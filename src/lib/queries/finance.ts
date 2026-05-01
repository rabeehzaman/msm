import { db } from "@/db";
import { funds, incomeEntries, expenseEntries, subscriptions, fridayCollections } from "@/db/schema";
import { eq, desc, count, sum } from "drizzle-orm";
import { ensureTenant } from "./auth";

export async function getFunds() {
  const tenant = await ensureTenant();
  const existingFunds = await db
    .select()
    .from(funds)
    .where(eq(funds.tenantId, tenant.id))
    .orderBy(funds.name);

  if (existingFunds.length > 0) {
    return existingFunds;
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

  await db.insert(funds).values(defaultFunds.map((fund) => ({ tenantId: tenant.id, ...fund })));

  return db.select().from(funds).where(eq(funds.tenantId, tenant.id)).orderBy(funds.name);
}

export async function getIncomeEntries() {
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
    .where(eq(incomeEntries.tenantId, tenant.id))
    .orderBy(desc(incomeEntries.date))
    .limit(50);
  return result;
}

export async function getExpenseEntries() {
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
    .where(eq(expenseEntries.tenantId, tenant.id))
    .orderBy(desc(expenseEntries.date))
    .limit(50);
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

  const [incomeTotal] = await db
    .select({ total: sum(incomeEntries.amount) })
    .from(incomeEntries)
    .where(eq(incomeEntries.tenantId, tenant.id));

  const [expenseTotal] = await db
    .select({ total: sum(expenseEntries.amount) })
    .from(expenseEntries)
    .where(eq(expenseEntries.tenantId, tenant.id));

  const [incomeCount] = await db
    .select({ count: count() })
    .from(incomeEntries)
    .where(eq(incomeEntries.tenantId, tenant.id));

  const [expenseCount] = await db
    .select({ count: count() })
    .from(expenseEntries)
    .where(eq(expenseEntries.tenantId, tenant.id));

  const fundBalances = await getFunds();

  return {
    totalIncome: Number(incomeTotal?.total ?? 0),
    totalExpenses: Number(expenseTotal?.total ?? 0),
    incomeCount: Number(incomeCount?.count ?? 0),
    expenseCount: Number(expenseCount?.count ?? 0),
    funds: fundBalances,
  };
}
