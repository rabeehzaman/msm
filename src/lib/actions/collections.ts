"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  collectionCategories, fridayCollections, funds, households, incomeEntries, subscriptionPayments, subscriptions,
} from "@/db/schema";
import { requireAdmin, requireEntry } from "@/lib/auth/guard";
import {
  parseAmount, parseDate, parseId, requiredText, run, text, UserError,
} from "@/lib/money/action";
import { fundIdByName } from "@/lib/money/funds";
import { nextReceiptNumber, postLedger, removeLedger, replaceLedger, writeAudit, type Tx } from "@/lib/money/ledger";
import { receiptUsed } from "@/lib/queries/collections";

function refresh() {
  revalidatePath("/finances", "layout");
  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
  revalidatePath("/cash-bank");
}

async function categoryFor(tx: Tx, tenantId: string, id: string) {
  const [row] = await tx
    .select()
    .from(collectionCategories)
    .where(and(eq(collectionCategories.id, id), eq(collectionCategories.tenantId, tenantId)))
    .limit(1);
  if (!row) throw new UserError("Please select a category.");
  const fundId = row.fundId ?? (await fundIdByName(tx, tenantId, "General Fund"));
  return { name: row.name, fundId: fundId! };
}

async function categoryOfKind(tx: Tx, tenantId: string, kind: "friday" | "subscription", fallback: string) {
  const [row] = await tx
    .select()
    .from(collectionCategories)
    .where(and(eq(collectionCategories.tenantId, tenantId), eq(collectionCategories.kind, kind)))
    .limit(1);
  return {
    name: row?.name ?? fallback,
    fundId: row?.fundId ?? (await fundIdByName(tx, tenantId, "General Fund")),
  };
}

// --- General collections: General Fund, Nercha, Donations and anything the admin adds ---

export async function saveCollection(formData: FormData) {
  return run(async () => {
    const id = text(formData.get("id"));
    const { actor } = await (id ? requireAdmin() : requireEntry());
    const date = parseDate(formData.get("date"));
    const amount = parseAmount(formData.get("amount"));
    const categoryId = parseId(formData.get("categoryId"), "a category");
    const accountId = parseId(formData.get("accountId"), "Cash or Bank");
    const donorName = text(formData.get("donorName"));
    const houseName = text(formData.get("houseName"));
    const bookNumber = text(formData.get("bookNumber"));
    const description = text(formData.get("description"));

    const newId = await db.transaction(async (tx) => {
      const category = await categoryFor(tx, actor.tenantId, categoryId);
      if (id) {
        const [old] = await tx
          .select()
          .from(incomeEntries)
          .where(and(eq(incomeEntries.id, id), eq(incomeEntries.tenantId, actor.tenantId)))
          .limit(1);
        if (!old) throw new UserError("That entry no longer exists.");
        const receiptNumber = text(formData.get("receiptNumber")) ?? old.receiptNumber;
        const [row] = await tx
          .update(incomeEntries)
          .set({
            date, amount, categoryId, category: category.name, fundId: category.fundId, accountId,
            donorName, houseName, bookNumber, description, receiptNumber,
            updatedBy: actor.userId, updatedAt: new Date(),
          })
          .where(eq(incomeEntries.id, id))
          .returning();
        await replaceLedger(tx, actor, {
          accountId, date, direction: "in", kind: "income", amount,
          sourceType: "collection", sourceId: id, category: category.name, fundId: category.fundId,
          party: donorName, houseName, receiptNumber, bookNumber, note: description,
        });
        await writeAudit(tx, actor, "update", "income_entries", id, old, row);
        return id;
      }
      const receiptNumber = text(formData.get("receiptNumber")) ?? (await nextReceiptNumber(tx, actor.tenantId, "COL"));
      const [row] = await tx
        .insert(incomeEntries)
        .values({
          tenantId: actor.tenantId, date, amount, categoryId, category: category.name, fundId: category.fundId,
          accountId, donorName, houseName, bookNumber, description, receiptNumber, createdBy: actor.userId,
        })
        .returning();
      await postLedger(tx, actor, {
        accountId, date, direction: "in", kind: "income", amount,
        sourceType: "collection", sourceId: row.id, category: category.name, fundId: category.fundId,
        party: donorName, houseName, receiptNumber, bookNumber, note: description,
      });
      await writeAudit(tx, actor, "create", "income_entries", row.id, null, row);
      return row.id;
    });
    refresh();
    return newId;
  });
}

export async function deleteCollection(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(incomeEntries)
        .where(and(eq(incomeEntries.id, id), eq(incomeEntries.tenantId, actor.tenantId)))
        .limit(1);
      if (!old) throw new UserError("That entry no longer exists.");
      await removeLedger(tx, "collection", id);
      await tx.delete(incomeEntries).where(eq(incomeEntries.id, id));
      await writeAudit(tx, actor, "delete", "income_entries", id, old, null);
    });
    refresh();
  });
}

// --- Friday collection: usually no individual payer ---

export async function saveFriday(formData: FormData) {
  return run(async () => {
    const id = text(formData.get("id"));
    const { actor } = await (id ? requireAdmin() : requireEntry());
    const date = parseDate(formData.get("date"));
    const amount = parseAmount(formData.get("amount"));
    const accountId = parseId(formData.get("accountId"), "Cash or Bank");
    const countedBy = text(formData.get("countedBy"));
    const notes = text(formData.get("notes"));
    await db.transaction(async (tx) => {
      const category = await categoryOfKind(tx, actor.tenantId, "friday", "Friday (Jumu'ah) Collection");
      const ledger = {
        accountId, date, direction: "in" as const, kind: "income" as const, amount,
        category: category.name, fundId: category.fundId, party: countedBy, note: notes,
      };
      if (id) {
        const [old] = await tx
          .select()
          .from(fridayCollections)
          .where(and(eq(fridayCollections.id, id), eq(fridayCollections.tenantId, actor.tenantId)))
          .limit(1);
        if (!old) throw new UserError("That entry no longer exists.");
        const [row] = await tx
          .update(fridayCollections)
          .set({ date, totalAmount: amount, accountId, countedBy, notes, fundId: category.fundId, updatedBy: actor.userId, updatedAt: new Date() })
          .where(eq(fridayCollections.id, id))
          .returning();
        await replaceLedger(tx, actor, { ...ledger, sourceType: "friday", sourceId: id });
        await writeAudit(tx, actor, "update", "friday_collections", id, old, row);
      } else {
        const [row] = await tx
          .insert(fridayCollections)
          .values({
            tenantId: actor.tenantId, date, totalAmount: amount, accountId, countedBy, notes,
            fundId: category.fundId, status: "verified", createdBy: actor.userId,
          })
          .returning();
        await postLedger(tx, actor, { ...ledger, sourceType: "friday", sourceId: row.id });
        await writeAudit(tx, actor, "create", "friday_collections", row.id, null, row);
      }
    });
    refresh();
  });
}

export async function deleteFriday(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(fridayCollections)
        .where(and(eq(fridayCollections.id, id), eq(fridayCollections.tenantId, actor.tenantId)))
        .limit(1);
      if (!old) throw new UserError("That entry no longer exists.");
      await removeLedger(tx, "friday", id);
      await tx.delete(fridayCollections).where(eq(fridayCollections.id, id));
      await writeAudit(tx, actor, "delete", "friday_collections", id, old, null);
    });
    refresh();
  });
}

// --- Subscription book ---

export async function paySubscription(formData: FormData) {
  return run(async () => {
    const { actor } = await requireEntry();
    const subscriptionId = parseId(formData.get("subscriptionId"), "a subscription");
    const amount = parseAmount(formData.get("amount"));
    const date = parseDate(formData.get("date"));
    const accountId = parseId(formData.get("accountId"), "Cash or Bank");
    const bookNumber = requiredText(formData.get("bookNumber"), "Book number");
    const receiptNumber = requiredText(formData.get("receiptNumber"), "Receipt number");
    const periods = formData.getAll("periods").map(String).filter((p) => /^\d{4}-\d{2}$/.test(p));
    if (periods.length === 0) throw new UserError("Please choose the periods being paid.");
    if (formData.get("force") !== "1" && (await receiptUsed(actor.tenantId, bookNumber, receiptNumber))) {
      throw new UserError(`Receipt ${receiptNumber} is already used in book ${bookNumber}.`, true);
    }
    const note = text(formData.get("note"));
    const id = await db.transaction(async (tx) => {
      const [plan] = await tx
        .select({ householdId: subscriptions.householdId, houseNumber: households.houseNumber, familyName: households.familyName })
        .from(subscriptions)
        .innerJoin(households, eq(subscriptions.householdId, households.id))
        .where(and(eq(subscriptions.id, subscriptionId), eq(subscriptions.tenantId, actor.tenantId)))
        .limit(1);
      if (!plan) throw new UserError("That subscription no longer exists.");
      const category = await categoryOfKind(tx, actor.tenantId, "subscription", "Subscription");
      const [row] = await tx
        .insert(subscriptionPayments)
        .values({
          tenantId: actor.tenantId, subscriptionId, householdId: plan.householdId, amount, date,
          accountId, bookNumber, receiptNumber, periods, period: periods.join(", "), note,
          createdBy: actor.userId,
        })
        .returning();
      await postLedger(tx, actor, {
        accountId, date, direction: "in", kind: "income", amount,
        sourceType: "subscription", sourceId: row.id, category: category.name, fundId: category.fundId,
        party: plan.familyName, houseName: `${plan.houseNumber} ${plan.familyName}`, receiptNumber, bookNumber,
        note: note ?? periods.join(", "),
      });
      await writeAudit(tx, actor, "create", "subscription_payments", row.id, null, row);
      return row.id;
    });
    refresh();
    return id;
  });
}

export async function deleteSubscriptionPayment(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(subscriptionPayments)
        .where(and(eq(subscriptionPayments.id, id), eq(subscriptionPayments.tenantId, actor.tenantId)))
        .limit(1);
      if (!old) throw new UserError("That payment no longer exists.");
      await removeLedger(tx, "subscription", id);
      await tx.delete(subscriptionPayments).where(eq(subscriptionPayments.id, id));
      await writeAudit(tx, actor, "delete", "subscription_payments", id, old, null);
    });
    refresh();
  });
}

// --- Collection categories (admin) ---

export async function saveCollectionCategory(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const id = text(formData.get("id"));
    const name = requiredText(formData.get("name"), "Name");
    await db.transaction(async (tx) => {
      if (id) {
        const [row] = await tx
          .update(collectionCategories)
          .set({ name, isActive: formData.getAll("isActive").includes("on"), updatedAt: new Date() })
          .where(and(eq(collectionCategories.id, id), eq(collectionCategories.tenantId, actor.tenantId)))
          .returning();
        await writeAudit(tx, actor, "update", "collection_categories", id, null, row);
      } else {
        const [general] = await tx
          .select({ id: funds.id })
          .from(funds)
          .where(and(eq(funds.tenantId, actor.tenantId), eq(funds.name, "General Fund")))
          .limit(1);
        const [row] = await tx
          .insert(collectionCategories)
          .values({ tenantId: actor.tenantId, name, fundId: general?.id })
          .returning();
        await writeAudit(tx, actor, "create", "collection_categories", row.id, null, row);
      }
    });
    revalidatePath("/settings/categories");
    refresh();
  }, "A category with this name already exists.");
}
