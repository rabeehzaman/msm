"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { billAccounts, bills, expenseCategories, expenseEntries, funds, maintenanceLogs } from "@/db/schema";
import { requireAdmin, requireEntry } from "@/lib/auth/guard";
import { MONTHS } from "@/lib/format";
import {
  parseAmount, parseDate, parseId, parseOptionalAmount, parseOptionalDate, parseYearMonth, requiredText, run, text, UserError,
} from "@/lib/money/action";
import { postExpense, removePostedExpense } from "@/lib/money/expense";
import { fundIdByName } from "@/lib/money/funds";
import { nextReceiptNumber, postLedger, removeLedger, replaceLedger, writeAudit, type Tx } from "@/lib/money/ledger";

function refresh() {
  revalidatePath("/finances", "layout");
  revalidatePath("/bills");
  revalidatePath("/maintenance");
  revalidatePath("/dashboard");
  revalidatePath("/cash-bank");
}

async function categoryName(tx: Tx, tenantId: string, id: string) {
  const [row] = await tx
    .select({ name: expenseCategories.name })
    .from(expenseCategories)
    .where(and(eq(expenseCategories.id, id), eq(expenseCategories.tenantId, tenantId)))
    .limit(1);
  if (!row) throw new UserError("Please select a category.");
  return row.name;
}

async function chosenFund(tx: Tx, tenantId: string, value: FormDataEntryValue | null) {
  const id = text(value);
  if (id) {
    const [row] = await tx
      .select({ id: funds.id })
      .from(funds)
      .where(and(eq(funds.id, id), eq(funds.tenantId, tenantId)))
      .limit(1);
    if (row) return row.id;
  }
  return (await fundIdByName(tx, tenantId, "General Fund"))!;
}

// --- Expenses ---

export async function saveExpense(formData: FormData) {
  return run(async () => {
    const id = text(formData.get("id"));
    const { actor } = await (id ? requireAdmin() : requireEntry());
    const date = parseDate(formData.get("date"));
    const amount = parseAmount(formData.get("amount"));
    const payee = requiredText(formData.get("payee"), "Paid to");
    const categoryId = parseId(formData.get("categoryId"), "a category");
    const accountId = parseId(formData.get("accountId"), "Cash or Bank");
    const description = text(formData.get("description"));
    const photoPath = text(formData.get("photoPath"));

    await db.transaction(async (tx) => {
      const category = await categoryName(tx, actor.tenantId, categoryId);
      const fundId = await chosenFund(tx, actor.tenantId, formData.get("fundId"));
      if (id) {
        const [old] = await tx
          .select()
          .from(expenseEntries)
          .where(and(eq(expenseEntries.id, id), eq(expenseEntries.tenantId, actor.tenantId)))
          .limit(1);
        if (!old) throw new UserError("That expense no longer exists.");
        if (old.sourceType) throw new UserError("This expense came from a bill or maintenance entry. Change it there.");
        const [row] = await tx
          .update(expenseEntries)
          .set({
            date, amount, payee, category, categoryId, accountId, description, fundId,
            photoPath: photoPath ?? old.photoPath,
            updatedBy: actor.userId,
            updatedAt: new Date(),
          })
          .where(eq(expenseEntries.id, id))
          .returning();
        await replaceLedger(tx, actor, {
          accountId, date, direction: "out", kind: "expense", amount,
          sourceType: "expense", sourceId: id, category, fundId,
          party: payee, receiptNumber: old.voucherNumber, note: description,
        });
        await writeAudit(tx, actor, "update", "expense_entries", id, old, row);
      } else {
        const voucherNumber = await nextReceiptNumber(tx, actor.tenantId, "EXP");
        const [row] = await tx
          .insert(expenseEntries)
          .values({
            tenantId: actor.tenantId,
            fundId, voucherNumber, amount, payee, category, categoryId, description,
            status: "paid", date, accountId, photoPath, createdBy: actor.userId,
          })
          .returning();
        await postLedger(tx, actor, {
          accountId, date, direction: "out", kind: "expense", amount,
          sourceType: "expense", sourceId: row.id, category, fundId,
          party: payee, receiptNumber: voucherNumber, note: description,
        });
        await writeAudit(tx, actor, "create", "expense_entries", row.id, null, row);
      }
    });
    refresh();
  });
}

export async function deleteExpense(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(expenseEntries)
        .where(and(eq(expenseEntries.id, id), eq(expenseEntries.tenantId, actor.tenantId)))
        .limit(1);
      if (!old) throw new UserError("That expense no longer exists.");
      if (old.sourceType) throw new UserError("This expense came from a bill or maintenance entry. Change it there.");
      await removeLedger(tx, "expense", id);
      await tx.delete(expenseEntries).where(eq(expenseEntries.id, id));
      await writeAudit(tx, actor, "delete", "expense_entries", id, old, null);
    });
    refresh();
  });
}

// Zakat distributions and Qard Hasan loans: money leaving a restricted fund.
export async function recordFundPayment(formData: FormData) {
  return run(async () => {
    const { actor } = await requireEntry();
    const date = parseDate(formData.get("date"));
    const amount = parseAmount(formData.get("amount"));
    const payee = requiredText(formData.get("payee"), "Paid to");
    const accountId = parseId(formData.get("accountId"), "Cash or Bank");
    const category = requiredText(formData.get("category"), "Category");
    const fundId = parseId(formData.get("fundId"), "a fund");
    await db.transaction(async (tx) => {
      const id = await postExpense(tx, actor, {
        date,
        amount,
        payee,
        category,
        accountId,
        fundId: await chosenFund(tx, actor.tenantId, fundId),
        description: text(formData.get("description")),
      });
      await writeAudit(tx, actor, "create", "expense_entries", id, null, { date, amount, payee, category });
    });
    refresh();
  });
}

// --- Categories (admin) ---

export async function saveExpenseCategory(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const id = text(formData.get("id"));
    const name = requiredText(formData.get("name"), "Name");
    await db.transaction(async (tx) => {
      if (id) {
        const [row] = await tx
          .update(expenseCategories)
          .set({ name, isActive: formData.getAll("isActive").includes("on"), updatedAt: new Date() })
          .where(and(eq(expenseCategories.id, id), eq(expenseCategories.tenantId, actor.tenantId)))
          .returning();
        await writeAudit(tx, actor, "update", "expense_categories", id, null, row);
      } else {
        const [row] = await tx.insert(expenseCategories).values({ tenantId: actor.tenantId, name }).returning();
        await writeAudit(tx, actor, "create", "expense_categories", row.id, null, row);
      }
    });
    revalidatePath("/settings/categories");
    refresh();
  }, "A category with this name already exists.");
}

// --- Regular bills ---

export async function saveBillAccount(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const id = text(formData.get("id"));
    const values = {
      name: requiredText(formData.get("name"), "Name"),
      consumerNumber: text(formData.get("consumerNumber")),
      categoryId: parseId(formData.get("categoryId"), "a category"),
      notes: text(formData.get("notes")),
    };
    await db.transaction(async (tx) => {
      await categoryName(tx, actor.tenantId, values.categoryId);
      if (id) {
        const [row] = await tx
          .update(billAccounts)
          .set({ ...values, updatedBy: actor.userId, updatedAt: new Date() })
          .where(and(eq(billAccounts.id, id), eq(billAccounts.tenantId, actor.tenantId)))
          .returning();
        await writeAudit(tx, actor, "update", "bill_accounts", id, null, row);
      } else {
        const [row] = await tx
          .insert(billAccounts)
          .values({ ...values, tenantId: actor.tenantId, createdBy: actor.userId })
          .returning();
        await writeAudit(tx, actor, "create", "bill_accounts", row.id, null, row);
      }
    });
    refresh();
  }, "A bill with this name already exists.");
}

export async function saveBill(formData: FormData) {
  return run(async () => {
    const id = text(formData.get("id"));
    const { actor } = await (id ? requireAdmin() : requireEntry());
    const amount = parseAmount(formData.get("amount"));
    const dueDate = parseOptionalDate(formData.get("dueDate"));
    const note = text(formData.get("note"));
    await db.transaction(async (tx) => {
      if (id) {
        const [old] = await tx
          .select()
          .from(bills)
          .where(and(eq(bills.id, id), eq(bills.tenantId, actor.tenantId)))
          .limit(1);
        if (!old) throw new UserError("That bill no longer exists.");
        if (old.paidDate) throw new UserError("This bill is already paid. Undo the payment first.");
        const [row] = await tx
          .update(bills)
          .set({ amount, dueDate, note, updatedBy: actor.userId, updatedAt: new Date() })
          .where(eq(bills.id, id))
          .returning();
        await writeAudit(tx, actor, "update", "bills", id, old, row);
      } else {
        const billAccountId = parseId(formData.get("billAccountId"), "a consumer number");
        const { year, month } = parseYearMonth(formData.get("year"), formData.get("month"));
        const [account] = await tx
          .select({ id: billAccounts.id })
          .from(billAccounts)
          .where(and(eq(billAccounts.id, billAccountId), eq(billAccounts.tenantId, actor.tenantId)))
          .limit(1);
        if (!account) throw new UserError("Please select a consumer number.");
        const [row] = await tx
          .insert(bills)
          .values({ tenantId: actor.tenantId, billAccountId, year, month, amount, dueDate, note, createdBy: actor.userId })
          .returning();
        await writeAudit(tx, actor, "create", "bills", row.id, null, row);
      }
    });
    refresh();
  }, "This bill is already entered for that month.");
}

export async function deleteBill(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx.select().from(bills).where(and(eq(bills.id, id), eq(bills.tenantId, actor.tenantId))).limit(1);
      if (!old) throw new UserError("That bill no longer exists.");
      if (old.paidDate) throw new UserError("This bill is already paid. Undo the payment first.");
      await tx.delete(bills).where(eq(bills.id, id));
      await writeAudit(tx, actor, "delete", "bills", id, old, null);
    });
    refresh();
  });
}

// Paying a bill creates the expense and takes the money out of Cash/Bank in one step.
export async function payBill(formData: FormData) {
  return run(async () => {
    const { actor } = await requireEntry();
    const id = parseId(formData.get("id"), "a bill");
    const paidDate = parseDate(formData.get("paidDate"));
    const accountId = parseId(formData.get("accountId"), "Cash or Bank");
    await db.transaction(async (tx) => {
      const [row] = await tx
        .select({ bill: bills, name: billAccounts.name, consumer: billAccounts.consumerNumber, categoryId: billAccounts.categoryId })
        .from(bills)
        .innerJoin(billAccounts, eq(bills.billAccountId, billAccounts.id))
        .where(and(eq(bills.id, id), eq(bills.tenantId, actor.tenantId)))
        .for("update", { of: bills })
        .limit(1);
      if (!row) throw new UserError("That bill no longer exists.");
      if (row.bill.paidDate) throw new UserError("This bill is already paid.");
      const category = row.categoryId ? await categoryName(tx, actor.tenantId, row.categoryId) : "Miscellaneous";
      const expenseId = await postExpense(tx, actor, {
        date: paidDate,
        amount: row.bill.amount,
        payee: row.name,
        category,
        categoryId: row.categoryId,
        accountId,
        description: `${MONTHS[row.bill.month - 1]} ${row.bill.year}${row.consumer ? `, ${row.consumer}` : ""}`,
        sourceType: "bill",
        sourceId: id,
      });
      await tx
        .update(bills)
        .set({ paidDate, accountId, expenseId, updatedBy: actor.userId, updatedAt: new Date() })
        .where(eq(bills.id, id));
      await writeAudit(tx, actor, "update", "bills", id, row.bill, { paidDate, accountId, amount: row.bill.amount });
    });
    refresh();
  });
}

export async function undoBillPayment(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx.select().from(bills).where(and(eq(bills.id, id), eq(bills.tenantId, actor.tenantId))).limit(1);
      if (!old) throw new UserError("That bill no longer exists.");
      if (!old.expenseId) throw new UserError("This bill is not paid.");
      await tx
        .update(bills)
        .set({ paidDate: null, accountId: null, expenseId: null, updatedBy: actor.userId, updatedAt: new Date() })
        .where(eq(bills.id, id));
      await removePostedExpense(tx, actor.tenantId, old.expenseId);
      await writeAudit(tx, actor, "delete", "bills", id, old, { paidDate: null });
    });
    refresh();
  });
}

// --- Maintenance ---

function status(value: FormDataEntryValue | null) {
  return value === "in_progress" || value === "done" ? value : "pending";
}

export async function saveMaintenance(formData: FormData) {
  return run(async () => {
    const id = text(formData.get("id"));
    const { actor } = await (id ? requireAdmin() : requireEntry());
    const photoPath = text(formData.get("photoPath"));
    const values = {
      date: parseDate(formData.get("date")),
      buildingId: text(formData.get("buildingId")),
      roomId: text(formData.get("roomId")),
      area: text(formData.get("area")),
      work: requiredText(formData.get("work"), "Work description"),
      doneBy: text(formData.get("doneBy")),
      cost: parseOptionalAmount(formData.get("cost"), "Cost"),
      status: status(formData.get("status")),
    };
    await db.transaction(async (tx) => {
      if (id) {
        const [old] = await tx
          .select()
          .from(maintenanceLogs)
          .where(and(eq(maintenanceLogs.id, id), eq(maintenanceLogs.tenantId, actor.tenantId)))
          .limit(1);
        if (!old) throw new UserError("That entry no longer exists.");
        if (old.expenseId && Number(old.cost) !== Number(values.cost)) {
          throw new UserError("This work is already paid. Undo the payment before changing the cost.");
        }
        const [row] = await tx
          .update(maintenanceLogs)
          .set({ ...values, photoPath: photoPath ?? old.photoPath, updatedBy: actor.userId, updatedAt: new Date() })
          .where(eq(maintenanceLogs.id, id))
          .returning();
        await writeAudit(tx, actor, "update", "maintenance_logs", id, old, row);
      } else {
        const [row] = await tx
          .insert(maintenanceLogs)
          .values({ ...values, photoPath, tenantId: actor.tenantId, createdBy: actor.userId })
          .returning();
        await writeAudit(tx, actor, "create", "maintenance_logs", row.id, null, row);
      }
    });
    refresh();
  });
}

export async function deleteMaintenance(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(maintenanceLogs)
        .where(and(eq(maintenanceLogs.id, id), eq(maintenanceLogs.tenantId, actor.tenantId)))
        .limit(1);
      if (!old) throw new UserError("That entry no longer exists.");
      if (old.expenseId) throw new UserError("This work is already paid. Undo the payment first.");
      await tx.delete(maintenanceLogs).where(eq(maintenanceLogs.id, id));
      await writeAudit(tx, actor, "delete", "maintenance_logs", id, old, null);
    });
    refresh();
  });
}

// Paying posts a Maintenance expense and deducts from Cash/Bank. No second entry.
export async function payMaintenance(formData: FormData) {
  return run(async () => {
    const { actor } = await requireEntry();
    const id = parseId(formData.get("id"), "an entry");
    const paidDate = parseDate(formData.get("paidDate"));
    const accountId = parseId(formData.get("accountId"), "Cash or Bank");
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(maintenanceLogs)
        .where(and(eq(maintenanceLogs.id, id), eq(maintenanceLogs.tenantId, actor.tenantId)))
        .for("update")
        .limit(1);
      if (!old) throw new UserError("That entry no longer exists.");
      if (old.expenseId) throw new UserError("This work is already paid.");
      if (Number(old.cost) <= 0) throw new UserError("Enter the cost first.");
      const [category] = await tx
        .select({ id: expenseCategories.id, name: expenseCategories.name })
        .from(expenseCategories)
        .where(and(eq(expenseCategories.tenantId, actor.tenantId), sql`${expenseCategories.name} ilike 'Maintenance%'`))
        .limit(1);
      const expenseId = await postExpense(tx, actor, {
        date: paidDate,
        amount: old.cost,
        payee: old.doneBy ?? old.work,
        category: category?.name ?? "Maintenance & Repairs",
        categoryId: category?.id,
        accountId,
        description: old.work,
        sourceType: "maintenance",
        sourceId: id,
      });
      await tx
        .update(maintenanceLogs)
        .set({ paidDate, accountId, expenseId, updatedBy: actor.userId, updatedAt: new Date() })
        .where(eq(maintenanceLogs.id, id));
      await writeAudit(tx, actor, "update", "maintenance_logs", id, old, { paidDate, accountId, amount: old.cost });
    });
    refresh();
  });
}

export async function undoMaintenancePayment(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(maintenanceLogs)
        .where(and(eq(maintenanceLogs.id, id), eq(maintenanceLogs.tenantId, actor.tenantId)))
        .limit(1);
      if (!old) throw new UserError("That entry no longer exists.");
      if (!old.expenseId) throw new UserError("This work is not paid.");
      await tx
        .update(maintenanceLogs)
        .set({ paidDate: null, accountId: null, expenseId: null, updatedBy: actor.userId, updatedAt: new Date() })
        .where(eq(maintenanceLogs.id, id));
      await removePostedExpense(tx, actor.tenantId, old.expenseId);
      await writeAudit(tx, actor, "delete", "maintenance_logs", id, old, { paidDate: null });
    });
    refresh();
  });
}
