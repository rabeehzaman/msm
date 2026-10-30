import { and, eq, sql } from "drizzle-orm";
import type { db } from "@/db";
import { auditLogs, cashAccounts, ledgerEntries, receiptCounters } from "@/db/schema";
import type { Actor } from "@/lib/auth/guard";
import { UserError } from "./action";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type LedgerInput = {
  accountId: string;
  date: string;
  direction: "in" | "out";
  kind: "income" | "expense" | "transfer";
  amount: string;
  sourceType: string;
  sourceId: string;
  category: string;
  fundId?: string | null;
  party?: string | null;
  houseName?: string | null;
  receiptNumber?: string | null;
  bookNumber?: string | null;
  note?: string | null;
};

// Each money record posts here inside the same database transaction as the record itself,
// so a record and its cash/bank movement always succeed or fail together.
export async function postLedger(tx: Tx, actor: Actor, input: LedgerInput) {
  await assertAccount(tx, actor.tenantId, input.accountId, input.date);
  await tx.insert(ledgerEntries).values({
    tenantId: actor.tenantId,
    ...input,
    createdBy: actor.userId,
    createdByName: actor.name,
  });
}

// Editing a record rewrites its ledger row, keeping who first entered it.
export async function replaceLedger(tx: Tx, actor: Actor, input: LedgerInput) {
  const match = and(
    eq(ledgerEntries.sourceType, input.sourceType),
    eq(ledgerEntries.sourceId, input.sourceId),
    eq(ledgerEntries.direction, input.direction),
  );
  const [existing] = await tx.select({ accountId: ledgerEntries.accountId }).from(ledgerEntries).where(match).limit(1);
  // Posting a fresh line here could count the money twice, so an edit never creates one.
  if (!existing) throw new UserError("This entry has no cash or bank line, so it cannot be edited.");
  await assertAccount(tx, actor.tenantId, input.accountId, input.date, existing.accountId === input.accountId);
  await tx
    .update(ledgerEntries)
    .set({ ...input, updatedBy: actor.userId, updatedByName: actor.name, updatedAt: new Date() })
    .where(match);
}

export async function removeLedger(tx: Tx, sourceType: string, sourceId: string) {
  await tx
    .delete(ledgerEntries)
    .where(and(eq(ledgerEntries.sourceType, sourceType), eq(ledgerEntries.sourceId, sourceId)));
}

export async function renameLedgerCategory(tx: Tx, tenantId: string, kind: "income" | "expense", from: string, to: string) {
  if (from === to) return;
  await tx
    .update(ledgerEntries)
    .set({ category: to })
    .where(and(eq(ledgerEntries.tenantId, tenantId), eq(ledgerEntries.kind, kind), eq(ledgerEntries.category, from)));
}

// A hidden account stays allowed for a record that is already on it.
async function assertAccount(tx: Tx, tenantId: string, accountId: string, date: string, allowHidden = false) {
  const [account] = await tx
    .select({ isActive: cashAccounts.isActive, openingDate: cashAccounts.openingDate })
    .from(cashAccounts)
    .where(and(eq(cashAccounts.id, accountId), eq(cashAccounts.tenantId, tenantId)))
    .limit(1);
  if (!account || (!account.isActive && !allowHidden)) throw new UserError("Please select a Cash or Bank account.");
  // Money from before the opening date is already inside the opening balance.
  if (date < account.openingDate) {
    throw new UserError("This date is before the account's opening date. Change the date, or the account's opening date and balance.");
  }
}

export async function writeAudit(
  tx: Tx,
  actor: Actor,
  action: "create" | "update" | "delete",
  tableName: string,
  recordId: string | null,
  oldValue: unknown,
  newValue: unknown,
) {
  await tx.insert(auditLogs).values({
    tenantId: actor.tenantId,
    userId: actor.userId,
    action,
    tableName,
    recordId,
    oldValue: oldValue ?? null,
    newValue: newValue ?? null,
    userAgent: actor.name,
  });
}

// Next number in a receipt series, e.g. RENT-0001. Safe when two people save at once.
export async function nextReceiptNumber(tx: Tx, tenantId: string, series: string) {
  const [row] = await tx
    .insert(receiptCounters)
    .values({ tenantId, series, lastNumber: 1 })
    .onConflictDoUpdate({
      target: [receiptCounters.tenantId, receiptCounters.series],
      set: { lastNumber: sql`${receiptCounters.lastNumber} + 1` },
    })
    .returning({ n: receiptCounters.lastNumber });
  return `${series}-${String(row.n).padStart(4, "0")}`;
}
