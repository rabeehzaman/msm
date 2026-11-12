import { and, asc, desc, eq, gte, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { cashAccounts, funds, incomeHeads, otherIncomeEntries } from "@/db/schema";
import { ensureTenant } from "./auth";

export const OTHER_INCOME_PAGE_SIZE = 50;

// Heads with how many entries each has (a head with entries can only be hidden, not deleted).
export async function getIncomeHeads() {
  const tenant = await ensureTenant();
  return db
    .select({
      id: incomeHeads.id,
      name: incomeHeads.name,
      isActive: incomeHeads.isActive,
      entries: sql<number>`(select count(*)::int from ${otherIncomeEntries} where ${otherIncomeEntries.headId} = ${incomeHeads.id})`,
    })
    .from(incomeHeads)
    .where(eq(incomeHeads.tenantId, tenant.id))
    .orderBy(asc(incomeHeads.sortOrder), asc(incomeHeads.name));
}

// All funds with their state: the form offers active ones, plus an entry's own fund if it was hidden later.
export async function getIncomeFunds() {
  const tenant = await ensureTenant();
  return db
    .select({ id: funds.id, name: funds.name, isActive: funds.isActive })
    .from(funds)
    .where(eq(funds.tenantId, tenant.id))
    .orderBy(asc(funds.name));
}

export type OtherIncomeFilter = { from: string; to: string; headId?: string | null; q?: string | null; page?: number };

// Filters, search, totals and paging all run in the database, so the phone only receives one page.
export async function getOtherIncome({ from, to, headId, q, page = 1 }: OtherIncomeFilter) {
  const tenant = await ensureTenant();
  const filters: SQL[] = [
    eq(otherIncomeEntries.tenantId, tenant.id),
    gte(otherIncomeEntries.date, from),
    lte(otherIncomeEntries.date, to),
  ];
  if (headId) filters.push(eq(otherIncomeEntries.headId, headId));
  const term = q?.trim();
  if (term) {
    const like = `%${term.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    filters.push(
      or(
        ilike(otherIncomeEntries.receiptNumber, like),
        ilike(otherIncomeEntries.receivedFrom, like),
        ilike(otherIncomeEntries.note, like),
        ilike(otherIncomeEntries.bookNumber, like),
      )!,
    );
  }
  const where = and(...filters);
  const [rows, [totals]] = await Promise.all([
    db
      .select({
        id: otherIncomeEntries.id,
        date: otherIncomeEntries.date,
        headId: otherIncomeEntries.headId,
        headName: incomeHeads.name,
        amount: otherIncomeEntries.amount,
        receivedFrom: otherIncomeEntries.receivedFrom,
        receiptNumber: otherIncomeEntries.receiptNumber,
        bookNumber: otherIncomeEntries.bookNumber,
        note: otherIncomeEntries.note,
        fundId: otherIncomeEntries.fundId,
        fundName: funds.name,
        accountId: otherIncomeEntries.accountId,
        accountName: cashAccounts.name,
      })
      .from(otherIncomeEntries)
      .innerJoin(incomeHeads, eq(otherIncomeEntries.headId, incomeHeads.id))
      .leftJoin(funds, eq(otherIncomeEntries.fundId, funds.id))
      .leftJoin(cashAccounts, eq(otherIncomeEntries.accountId, cashAccounts.id))
      .where(where)
      .orderBy(desc(otherIncomeEntries.date), desc(otherIncomeEntries.createdAt))
      .limit(OTHER_INCOME_PAGE_SIZE)
      .offset((Math.max(1, page) - 1) * OTHER_INCOME_PAGE_SIZE),
    db
      .select({
        total: sql<string>`coalesce(sum(${otherIncomeEntries.amount}), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(otherIncomeEntries)
      .where(where),
  ]);
  return { rows, total: Number(totals.total), count: totals.count };
}
