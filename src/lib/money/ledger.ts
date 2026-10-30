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
  await assertAccount(tx, actor.tenantId, input.accountId);
  await tx.insert(ledgerEntries).values({
    tenantId: actor.tenantId,
    ...input,
    createdBy: actor.userId,
    createdByName: actor.name,
  });
}

// Editing a record rewrites its ledger row, keeping who first entered it.
export async function replaceLedger(tx: Tx, actor: Actor, input: LedgerInput) {
  await assertAccount(tx, actor.tenantId, input.accountId);
  const rows = await tx
    .update(ledgerEntries)
    .set({ ...input, updatedBy: actor.userId, updatedByName: actor.name, updatedAt: new Date() })
    .where(
      and(
        eq(ledgerEntries.sourceType, input.sourceType),
        eq(ledgerEntries.sourceId, input.sourceId),
        eq(ledgerEntries.direction, input.direction),
      ),
    )
    .returning({ id: ledgerEntries.id });
  if (rows.length === 0) await postLedger(tx, actor, input);
}

export async function removeLedger(tx: Tx, sourceType: string, sourceId: string) {
  await tx
    .delete(ledgerEntries)
    .where(and(eq(ledgerEntries.sourceType, sourceType), eq(ledgerEntries.sourceId, sourceId)));
}

async function assertAccount(tx: Tx, tenantId: string, accountId: string) {
  const [account] = await tx
    .select({ id: cashAccounts.id })
    .from(cashAccounts)
    .where(and(eq(cashAccounts.id, accountId), eq(cashAccounts.tenantId, tenantId), eq(cashAccounts.isActive, true)))
    .limit(1);
  if (!account) throw new UserError("Please select a Cash or Bank account.");
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
