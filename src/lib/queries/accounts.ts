import { and, asc, desc, eq, gte, lt, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { cashAccounts, ledgerEntries } from "@/db/schema";
import { ensureTenant } from "./auth";

const signed = sql<string>`case when ${ledgerEntries.direction} = 'in' then ${ledgerEntries.amount} else -${ledgerEntries.amount} end`;

export async function getAccountsWithBalances() {
  const tenant = await ensureTenant();
  const accounts = await db
    .select()
    .from(cashAccounts)
    .where(eq(cashAccounts.tenantId, tenant.id))
    .orderBy(asc(cashAccounts.type), asc(cashAccounts.name));
  const moved = await db
    .select({ accountId: ledgerEntries.accountId, total: sql<string>`sum(${signed})` })
    .from(ledgerEntries)
    .where(eq(ledgerEntries.tenantId, tenant.id))
    .groupBy(ledgerEntries.accountId);
  const movedMap = new Map(moved.map((m) => [m.accountId, Number(m.total)]));
  return accounts.map((a) => ({
    ...a,
    balance: Math.round((Number(a.openingBalance) + (movedMap.get(a.id) ?? 0)) * 100) / 100,
  }));
}

// Accounts for "Received/Paid via" pickers.
export async function getActiveAccounts() {
  const tenant = await ensureTenant();
  return db
    .select({ id: cashAccounts.id, name: cashAccounts.name, type: cashAccounts.type })
    .from(cashAccounts)
    .where(and(eq(cashAccounts.tenantId, tenant.id), eq(cashAccounts.isActive, true)))
    .orderBy(asc(cashAccounts.type), asc(cashAccounts.name));
}

export async function getAccount(id: string) {
  const tenant = await ensureTenant();
  const [account] = await db
    .select()
    .from(cashAccounts)
    .where(and(eq(cashAccounts.id, id), eq(cashAccounts.tenantId, tenant.id)))
    .limit(1);
  return account ?? null;
}

// One account's book: everything in the date range, with the balance after each line.
export async function getAccountBook(accountId: string, from: string, to: string) {
  const tenant = await ensureTenant();
  const account = await getAccount(accountId);
  if (!account) return null;

  const [before] = await db
    .select({ total: sql<string>`coalesce(sum(${signed}), 0)` })
    .from(ledgerEntries)
    .where(
      and(
        eq(ledgerEntries.tenantId, tenant.id),
        eq(ledgerEntries.accountId, accountId),
        lt(ledgerEntries.date, from),
      ),
    );
  const opening = Math.round((Number(account.openingBalance) + Number(before.total)) * 100) / 100;

  const rows = await db
    .select()
    .from(ledgerEntries)
    .where(
      and(
        eq(ledgerEntries.tenantId, tenant.id),
        eq(ledgerEntries.accountId, accountId),
        gte(ledgerEntries.date, from),
        lte(ledgerEntries.date, to),
      ),
    )
    .orderBy(asc(ledgerEntries.date), asc(ledgerEntries.createdAt), asc(ledgerEntries.id));

  let balance = opening;
  const lines = rows.map((r) => {
    balance = Math.round((balance + (r.direction === "in" ? 1 : -1) * Number(r.amount)) * 100) / 100;
    return { ...r, balance };
  });
  return { account, opening, closing: balance, lines };
}

export async function getRecentLedger(limit = 10) {
  const tenant = await ensureTenant();
  return db
    .select()
    .from(ledgerEntries)
    .where(eq(ledgerEntries.tenantId, tenant.id))
    .orderBy(desc(ledgerEntries.date), desc(ledgerEntries.createdAt))
    .limit(limit);
}
