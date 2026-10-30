import { and, asc, desc, eq, gte, lte, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  cashAccounts, collectionCategories, fridayCollections, funds, households, incomeEntries, subscriptionPayments, subscriptions,
} from "@/db/schema";
import { currentYearMonth } from "@/lib/format";
import { subscriptionPeriods } from "@/lib/subscriptions";
import { ensureTenant } from "./auth";

export async function getCollectionCategories() {
  const tenant = await ensureTenant();
  return db
    .select({
      id: collectionCategories.id,
      name: collectionCategories.name,
      kind: collectionCategories.kind,
      fundId: collectionCategories.fundId,
      fundName: funds.name,
      isActive: collectionCategories.isActive,
    })
    .from(collectionCategories)
    .leftJoin(funds, eq(collectionCategories.fundId, funds.id))
    .where(eq(collectionCategories.tenantId, tenant.id))
    .orderBy(asc(collectionCategories.sortOrder), asc(collectionCategories.name));
}

export async function getCollections(from: string, to: string) {
  const tenant = await ensureTenant();
  return db
    .select({
      id: incomeEntries.id,
      date: incomeEntries.date,
      category: incomeEntries.category,
      categoryId: incomeEntries.categoryId,
      amount: incomeEntries.amount,
      donorName: incomeEntries.donorName,
      houseName: incomeEntries.houseName,
      receiptNumber: incomeEntries.receiptNumber,
      bookNumber: incomeEntries.bookNumber,
      description: incomeEntries.description,
      accountId: incomeEntries.accountId,
      accountName: cashAccounts.name,
    })
    .from(incomeEntries)
    .leftJoin(cashAccounts, eq(incomeEntries.accountId, cashAccounts.id))
    .where(and(eq(incomeEntries.tenantId, tenant.id), gte(incomeEntries.date, from), lte(incomeEntries.date, to)))
    .orderBy(desc(incomeEntries.date), desc(incomeEntries.createdAt));
}

export async function getFridayEntries(limit = 60) {
  const tenant = await ensureTenant();
  return db
    .select({
      id: fridayCollections.id,
      date: fridayCollections.date,
      totalAmount: fridayCollections.totalAmount,
      countedBy: fridayCollections.countedBy,
      notes: fridayCollections.notes,
      accountId: fridayCollections.accountId,
      accountName: cashAccounts.name,
    })
    .from(fridayCollections)
    .leftJoin(cashAccounts, eq(fridayCollections.accountId, cashAccounts.id))
    .where(eq(fridayCollections.tenantId, tenant.id))
    .orderBy(desc(fridayCollections.date))
    .limit(limit);
}

// Plans with the household, what has been paid and which periods are still pending.
export async function getSubscriptionBook() {
  const tenant = await ensureTenant();
  const [plans, payments] = await Promise.all([
    db
      .select({
        id: subscriptions.id,
        householdId: subscriptions.householdId,
        houseNumber: households.houseNumber,
        familyName: households.familyName,
        phone: households.primaryPhone,
        planName: subscriptions.planName,
        amount: subscriptions.amount,
        frequency: subscriptions.frequency,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
      })
      .from(subscriptions)
      .innerJoin(households, eq(subscriptions.householdId, households.id))
      .where(eq(subscriptions.tenantId, tenant.id))
      .orderBy(asc(households.houseNumber)),
    db
      .select({
        id: subscriptionPayments.id,
        subscriptionId: subscriptionPayments.subscriptionId,
        amount: subscriptionPayments.amount,
        date: subscriptionPayments.date,
        receiptNumber: subscriptionPayments.receiptNumber,
        bookNumber: subscriptionPayments.bookNumber,
        periods: subscriptionPayments.periods,
        period: subscriptionPayments.period,
        accountName: cashAccounts.name,
      })
      .from(subscriptionPayments)
      .leftJoin(cashAccounts, eq(subscriptionPayments.accountId, cashAccounts.id))
      .where(eq(subscriptionPayments.tenantId, tenant.id))
      .orderBy(desc(subscriptionPayments.date)),
  ]);
  const now = currentYearMonth();
  return plans.map((plan) => {
    const own = payments.filter((p) => p.subscriptionId === plan.id);
    const paidKeys = new Set(own.flatMap((p) => p.periods));
    const periods = subscriptionPeriods(plan.startDate, plan.frequency, now).map((p) => ({
      ...p,
      paid: paidKeys.has(p.key),
    }));
    return {
      ...plan,
      periods,
      payments: own,
      totalPaid: own.reduce((s, p) => s + Number(p.amount), 0),
      pendingCount: plan.status === "active" ? periods.filter((p) => p.started && !p.paid).length : 0,
    };
  });
}

export async function receiptUsed(tenantId: string, bookNumber: string, receiptNumber: string, exceptId?: string) {
  const filters = [
    eq(subscriptionPayments.tenantId, tenantId),
    eq(subscriptionPayments.bookNumber, bookNumber),
    eq(subscriptionPayments.receiptNumber, receiptNumber),
  ];
  if (exceptId) filters.push(ne(subscriptionPayments.id, exceptId));
  const [row] = await db.select({ id: subscriptionPayments.id }).from(subscriptionPayments).where(and(...filters)).limit(1);
  return !!row;
}
