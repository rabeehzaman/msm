import { db } from "@/db";
import { funds, incomeEntries, expenseEntries, ledgerEntries, subscriptions, fridayCollections } from "@/db/schema";
import { and, eq, desc, inArray, sql } from "drizzle-orm";
import { ensureTenant } from "./auth";

// Fund balances are worked out from the ledger; the stored funds.balance is never updated.
async function withLedgerBalances<T extends { id: string; balance: string }>(tenantId: string, rows: T[]) {
  const moved = await db
    .select({
      fundId: ledgerEntries.fundId,
      total: sql<string>`sum(case when ${ledgerEntries.direction} = 'in' then ${ledgerEntries.amount} else -${ledgerEntries.amount} end)`,
    })
    .from(ledgerEntries)
    .where(eq(ledgerEntries.tenantId, tenantId))
    .groupBy(ledgerEntries.fundId);
  const totals = new Map(moved.map((m) => [m.fundId, m.total]));
  return rows.map((f) => ({ ...f, balance: totals.get(f.id) ?? "0" }));
}

export async function getFunds() {
  const tenant = await ensureTenant();
  const existingFunds = await db
    .select()
    .from(funds)
    .where(eq(funds.tenantId, tenant.id))
    .orderBy(funds.name);

  if (existingFunds.length > 0) {
    return withLedgerBalances(tenant.id, existingFunds);
  }

  const defaultFunds = [
    { type: "general" as const, name: "General Fund", isRestricted: false },
    { type: "zakat" as const, name: "Zakat Fund", isRestricted: true },
    { type: "sadaqah" as const, name: "Sadaqah Fund", isRestricted: false },
    { type: "madrasa" as const, name: "Madrasa Fund", isRestricted: false },
    { type: "building" as const, name: "Building Fund", isRestricted: true },
    { type: "death_janazah" as const, name: "Death/Janazah Fund", isRestricted: true },
    { type: "marriage_assistance" as const, name: "Marriage Assistance Fund", isRestricted: true },
    { type: "scholarship" as const, name: "Scholarship Fund", isRestricted: true },
    { type: "qard_hasan" as const, name: "Qard Hasan Fund", isRestricted: true },
    { type: "ramadan_special" as const, name: "Ramadan Special Fund", isRestricted: true },
  ];

  // Concurrent first loads may race here; the unique (tenant_id, name) index plus
  // ON CONFLICT DO NOTHING makes the losing insert a harmless no-op.
  await db
    .insert(funds)
    .values(defaultFunds.map((fund) => ({ tenantId: tenant.id, ...fund })))
    .onConflictDoNothing({ target: [funds.tenantId, funds.name] });

  return db.select().from(funds).where(eq(funds.tenantId, tenant.id)).orderBy(funds.name);
}

export async function getIncomeEntries(fundId?: string) {
  const tenant = await ensureTenant();
  const result = await db
    .select({
      id: incomeEntries.id,
      receiptNumber: incomeEntries.receiptNumber,
      amount: incomeEntries.amount,
      donorName: incomeEntries.donorName,
      category: incomeEntries.category,
      description: incomeEntries.description,
      paymentMethod: incomeEntries.paymentMethod,
      date: incomeEntries.date,
      isAnonymous: incomeEntries.isAnonymous,
      fundName: funds.name,
      fundId: incomeEntries.fundId,
    })
    .from(incomeEntries)
    .leftJoin(funds, eq(incomeEntries.fundId, funds.id))
    .where(and(eq(incomeEntries.tenantId, tenant.id), fundId ? eq(incomeEntries.fundId, fundId) : undefined))
    .orderBy(desc(incomeEntries.date))
    .limit(fundId ? 100000 : 50);
  return result;
}

export async function getExpenseEntries(fundId?: string) {
  const tenant = await ensureTenant();
  const result = await db
    .select({
      id: expenseEntries.id,
      voucherNumber: expenseEntries.voucherNumber,
      amount: expenseEntries.amount,
      payee: expenseEntries.payee,
      category: expenseEntries.category,
      description: expenseEntries.description,
      paymentMethod: expenseEntries.paymentMethod,
      status: expenseEntries.status,
      date: expenseEntries.date,
      fundName: funds.name,
      fundId: expenseEntries.fundId,
    })
    .from(expenseEntries)
    .leftJoin(funds, eq(expenseEntries.fundId, funds.id))
    .where(and(eq(expenseEntries.tenantId, tenant.id), fundId ? eq(expenseEntries.fundId, fundId) : undefined))
    .orderBy(desc(expenseEntries.date))
    .limit(fundId ? 100000 : 50);
  return result;
}

export async function getSubscriptions() {
  const tenant = await ensureTenant();
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.tenantId, tenant.id))
    .orderBy(desc(subscriptions.createdAt));
  return result;
}

export async function getFridayCollections() {
  const tenant = await ensureTenant();
  return db
    .select()
    .from(fridayCollections)
    .where(eq(fridayCollections.tenantId, tenant.id))
    .orderBy(desc(fridayCollections.date))
    .limit(20);
}

export async function getFinanceDashboardStats() {
  const tenant = await ensureTenant();
  const totals = await db
    .select({
      kind: ledgerEntries.kind,
      total: sql<string>`sum(${ledgerEntries.amount})`,
      count: sql<number>`count(*)::int`,
    })
    .from(ledgerEntries)
    .where(and(eq(ledgerEntries.tenantId, tenant.id), inArray(ledgerEntries.kind, ["income", "expense"])))
    .groupBy(ledgerEntries.kind);
  const income = totals.find((t) => t.kind === "income");
  const expense = totals.find((t) => t.kind === "expense");
  const fundBalances = await getFunds();

  return {
    totalIncome: Number(income?.total ?? 0),
    totalExpenses: Number(expense?.total ?? 0),
    incomeCount: income?.count ?? 0,
    expenseCount: expense?.count ?? 0,
    funds: fundBalances,
  };
}
