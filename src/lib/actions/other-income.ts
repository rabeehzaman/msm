"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { funds, incomeHeads, ledgerEntries, otherIncomeEntries } from "@/db/schema";
import { requireAdmin, requireEntry, type Actor } from "@/lib/auth/guard";
import { parseAmount, parseDate, parseId, requiredText, run, text, UserError } from "@/lib/money/action";
import { fundIdByName } from "@/lib/money/funds";
import { nextReceiptNumber, postLedger, removeLedger, replaceLedger, writeAudit, type Tx } from "@/lib/money/ledger";
import { OTHER_INCOME_SOURCE, otherIncomeLedger } from "@/lib/money/other-income";

function refresh() {
  revalidatePath("/finances", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/cash-bank");
  revalidatePath("/settings/categories");
}

async function headFor(tx: Tx, tenantId: string, id: string) {
  const [row] = await tx
    .select()
    .from(incomeHeads)
    .where(and(eq(incomeHeads.id, id), eq(incomeHeads.tenantId, tenantId)))
    .limit(1);
  if (!row) throw new UserError("Please select an income head.");
  return row;
}

async function fundFor(tx: Tx, tenantId: string, value: string | null) {
  if (value) {
    const [row] = await tx
      .select({ id: funds.id })
      .from(funds)
      .where(and(eq(funds.id, value), eq(funds.tenantId, tenantId)))
      .limit(1);
    if (!row) throw new UserError("Please select a fund.");
    return row.id;
  }
  const general = await fundIdByName(tx, tenantId, "General Fund");
  if (!general) throw new UserError("Please select a fund.");
  return general;
}

// Adds or edits an Other Income entry and its Cash/Bank line in one step.
export async function saveOtherIncome(formData: FormData) {
  return run(async () => {
    const id = text(formData.get("id"));
    const { actor } = await (id ? requireAdmin() : requireEntry());
    const headId = parseId(formData.get("headId"), "an income head");
    const date = parseDate(formData.get("date"));
    const amount = parseAmount(formData.get("amount"));
    const accountId = parseId(formData.get("accountId"), "Cash or Bank");
    const receivedFrom = text(formData.get("receivedFrom"));
    const bookNumber = text(formData.get("bookNumber"));
    const note = text(formData.get("note"));

    const savedId = await db.transaction(async (tx) => {
      const head = await headFor(tx, actor.tenantId, headId);
      const fundId = await fundFor(tx, actor.tenantId, text(formData.get("fundId")));
      if (id) {
        const [old] = await tx
          .select()
          .from(otherIncomeEntries)
          .where(and(eq(otherIncomeEntries.id, id), eq(otherIncomeEntries.tenantId, actor.tenantId)))
          .for("update")
          .limit(1);
        if (!old) throw new UserError("That entry no longer exists.");
        // A hidden head stays allowed for an entry that is already under it.
        if (!head.isActive && old.headId !== head.id) throw new UserError("Please select an income head.");
        const receiptNumber = text(formData.get("receiptNumber")) ?? old.receiptNumber;
        const [row] = await tx
          .update(otherIncomeEntries)
          .set({
            headId, fundId, accountId, date, amount, receivedFrom, receiptNumber, bookNumber, note,
            updatedBy: actor.userId, updatedAt: new Date(),
          })
          .where(eq(otherIncomeEntries.id, id))
          .returning();
        await replaceLedger(tx, actor, otherIncomeLedger({ ...row, headName: head.name }));
        await writeAudit(tx, actor, "update", "other_income_entries", id, old, row);
        return id;
      }
      if (!head.isActive) throw new UserError("Please select an income head.");
      const receiptNumber = text(formData.get("receiptNumber")) ?? (await nextReceiptNumber(tx, actor.tenantId, "OTH"));
      const [row] = await tx
        .insert(otherIncomeEntries)
        .values({
          tenantId: actor.tenantId, headId, fundId, accountId, date, amount, receivedFrom, receiptNumber, bookNumber, note,
          createdBy: actor.userId,
        })
        .returning();
      await postLedger(tx, actor, otherIncomeLedger({ ...row, headName: head.name }));
      await writeAudit(tx, actor, "create", "other_income_entries", row.id, null, row);
      return row.id;
    });
    refresh();
    return savedId;
  });
}

// Removes the entry and takes the amount back out of Cash/Bank and the fund.
export async function deleteOtherIncome(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(otherIncomeEntries)
        .where(and(eq(otherIncomeEntries.id, id), eq(otherIncomeEntries.tenantId, actor.tenantId)))
        .for("update")
        .limit(1);
      if (!old) throw new UserError("That entry no longer exists.");
      await removeLedger(tx, OTHER_INCOME_SOURCE, id);
      await tx.delete(otherIncomeEntries).where(eq(otherIncomeEntries.id, id));
      await writeAudit(tx, actor, "delete", "other_income_entries", id, old, null);
    });
    refresh();
  });
}

// --- Income heads (admin): add, rename, hide, or delete one that has no entries ---

async function renameHeadLines(tx: Tx, actor: Actor, headId: string, name: string) {
  // Only this head's own Cash/Bank lines, so a collection category with the same name is untouched.
  const ids = tx.select({ id: otherIncomeEntries.id }).from(otherIncomeEntries).where(eq(otherIncomeEntries.headId, headId));
  await tx
    .update(ledgerEntries)
    .set({ category: name })
    .where(
      and(
        eq(ledgerEntries.tenantId, actor.tenantId),
        eq(ledgerEntries.sourceType, OTHER_INCOME_SOURCE),
        inArray(ledgerEntries.sourceId, ids),
      ),
    );
}

export async function saveIncomeHead(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const id = text(formData.get("id"));
    const name = requiredText(formData.get("name"), "Name");
    const head = await db.transaction(async (tx) => {
      if (id) {
        const [old] = await tx
          .select()
          .from(incomeHeads)
          .where(and(eq(incomeHeads.id, id), eq(incomeHeads.tenantId, actor.tenantId)))
          .for("update")
          .limit(1);
        if (!old) throw new UserError("Please select an income head.");
        const [row] = await tx
          .update(incomeHeads)
          .set({ name, isActive: formData.getAll("isActive").includes("on"), updatedAt: new Date() })
          .where(eq(incomeHeads.id, id))
          .returning();
        if (old.name !== name) await renameHeadLines(tx, actor, id, name);
        await writeAudit(tx, actor, "update", "income_heads", id, old, row);
        return { id: row.id, name: row.name };
      }
      const [row] = await tx.insert(incomeHeads).values({ tenantId: actor.tenantId, name }).returning();
      await writeAudit(tx, actor, "create", "income_heads", row.id, null, row);
      return { id: row.id, name: row.name };
    });
    refresh();
    return head;
  }, "An income head with this name already exists.");
}

export async function deleteIncomeHead(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(incomeHeads)
        .where(and(eq(incomeHeads.id, id), eq(incomeHeads.tenantId, actor.tenantId)))
        .for("update")
        .limit(1);
      if (!old) throw new UserError("Please select an income head.");
      const [used] = await tx
        .select({ n: sql<number>`count(*)::int` })
        .from(otherIncomeEntries)
        .where(eq(otherIncomeEntries.headId, id));
      if (used.n > 0) throw new UserError("This head has entries, so it can only be hidden, not deleted.");
      await tx.delete(incomeHeads).where(eq(incomeHeads.id, id));
      await writeAudit(tx, actor, "delete", "income_heads", id, old, null);
    });
    refresh();
  });
}
