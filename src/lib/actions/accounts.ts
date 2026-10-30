"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cashAccounts, cashTransfers, ledgerEntries } from "@/db/schema";
import { requireAdmin, requireEntry } from "@/lib/auth/guard";
import { parseAmount, parseDate, parseId, parseOptionalAmount, requiredText, run, text, UserError } from "@/lib/money/action";
import { postLedger, removeLedger, writeAudit } from "@/lib/money/ledger";

export async function saveAccount(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const id = text(formData.get("id"));
    const type = formData.get("type") === "cash" ? ("cash" as const) : ("bank" as const);
    const values = {
      name: requiredText(formData.get("name"), "Account name"),
      type,
      bankName: text(formData.get("bankName")),
      accountNumber: text(formData.get("accountNumber")),
      openingBalance: parseOptionalAmount(formData.get("openingBalance"), "Opening balance"),
      openingDate: parseDate(formData.get("openingDate")),
      notes: text(formData.get("notes")),
    };
    await db.transaction(async (tx) => {
      if (id) {
        const [old] = await tx
          .select()
          .from(cashAccounts)
          .where(and(eq(cashAccounts.id, id), eq(cashAccounts.tenantId, actor.tenantId)))
          .for("update")
          .limit(1);
        if (!old) throw new UserError("That account no longer exists.");
        const [row] = await tx
          .update(cashAccounts)
          .set({ ...values, updatedBy: actor.userId, updatedAt: new Date() })
          .where(eq(cashAccounts.id, id))
          .returning();
        await writeAudit(tx, actor, "update", "cash_accounts", id, old, row);
      } else {
        const [row] = await tx
          .insert(cashAccounts)
          .values({ ...values, tenantId: actor.tenantId, createdBy: actor.userId })
          .returning();
        await writeAudit(tx, actor, "create", "cash_accounts", row.id, null, row);
      }
    });
    revalidatePath("/cash-bank", "layout");
  }, "An account with this name already exists.");
}

export async function setAccountActive(id: string, isActive: boolean) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(cashAccounts)
        .where(and(eq(cashAccounts.id, id), eq(cashAccounts.tenantId, actor.tenantId)))
        .for("update")
        .limit(1);
      if (!old) throw new UserError("That account no longer exists.");
      if (!isActive) {
        const others = await tx
          .select({ id: cashAccounts.id })
          .from(cashAccounts)
          .where(and(eq(cashAccounts.tenantId, actor.tenantId), eq(cashAccounts.isActive, true), ne(cashAccounts.id, id)));
        if (others.length === 0) throw new UserError("At least one account must stay active.");
        const [moved] = await tx
          .select({
            total: sql<string>`coalesce(sum(case when ${ledgerEntries.direction} = 'in' then ${ledgerEntries.amount} else -${ledgerEntries.amount} end), 0)`,
          })
          .from(ledgerEntries)
          .where(eq(ledgerEntries.accountId, id));
        if (Math.round((Number(old.openingBalance) + Number(moved.total)) * 100) !== 0) {
          throw new UserError("This account still holds money. Transfer it out before hiding the account.");
        }
      }
      await tx
        .update(cashAccounts)
        .set({ isActive, updatedBy: actor.userId, updatedAt: new Date() })
        .where(eq(cashAccounts.id, id));
      await writeAudit(tx, actor, "update", "cash_accounts", id, { isActive: old.isActive }, { isActive });
    });
    revalidatePath("/cash-bank", "layout");
  });
}

// Moves money between two accounts. Two ledger lines, no income or expense effect.
export async function createTransfer(formData: FormData) {
  return run(async () => {
    const { actor } = await requireEntry();
    const fromAccountId = parseId(formData.get("fromAccountId"), "the account the money leaves");
    const toAccountId = parseId(formData.get("toAccountId"), "the account the money goes to");
    if (fromAccountId === toAccountId) throw new UserError("Choose two different accounts.");
    const amount = parseAmount(formData.get("amount"));
    const date = parseDate(formData.get("date"));
    const note = text(formData.get("note"));
    await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(cashTransfers)
        .values({ tenantId: actor.tenantId, fromAccountId, toAccountId, amount, date, note, createdBy: actor.userId })
        .returning();
      const shared = { date, kind: "transfer" as const, amount, sourceType: "transfer", sourceId: row.id, category: "Transfer", note };
      await postLedger(tx, actor, { ...shared, accountId: fromAccountId, direction: "out" });
      await postLedger(tx, actor, { ...shared, accountId: toAccountId, direction: "in" });
      await writeAudit(tx, actor, "create", "cash_transfers", row.id, null, row);
    });
    revalidatePath("/cash-bank", "layout");
    revalidatePath("/dashboard");
  });
}

export async function deleteTransfer(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(cashTransfers)
        .where(and(eq(cashTransfers.id, id), eq(cashTransfers.tenantId, actor.tenantId)))
        .for("update")
        .limit(1);
      if (!old) throw new UserError("That transfer no longer exists.");
      await removeLedger(tx, "transfer", id);
      await tx.delete(cashTransfers).where(eq(cashTransfers.id, id));
      await writeAudit(tx, actor, "delete", "cash_transfers", id, old, null);
    });
    revalidatePath("/cash-bank", "layout");
    revalidatePath("/dashboard");
  });
}
