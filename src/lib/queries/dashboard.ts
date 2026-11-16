import { and, asc, desc, eq, gte, isNull, lt, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { billAccounts, bills, cashAccounts, expenseEntries, funds, ledgerEntries } from "@/db/schema";
import { currentYearMonth, MONTHS } from "@/lib/format";
import { OTHER_INCOME_SOURCE } from "@/lib/money/other-income";
import { pendingMonthsFor } from "@/lib/period";
import { pendingMonths, roomMonth } from "@/lib/rent/status";
import { personUnpaidMonths, salaryLines } from "@/lib/salary/calc";
import { ensureTenant } from "./auth";
import { getRoomFacts } from "./rent";
import { getStaffFacts } from "./salary";

// Everything on the Dashboard for one From–To period, worked out on the server.
//
// Money figures all come from the ledger (every Cash/Bank line), counted by the line's own date: the
// date the money was received or paid, never the day it was typed in. The Cash Book, Bank Book and
// Income & Expense Statement read the same lines, so the Dashboard agrees with them for any period.
//
// A card and the list behind it use the same rule (`matches` below) on the same lines, so the list
// total always equals the card.

const round2 = (n: number) => Math.round(n * 100) / 100;
const signed = sql<string>`case when ${ledgerEntries.direction} = 'in' then ${ledgerEntries.amount} else -${ledgerEntries.amount} end`;

// For an expense line, where the expense came from: a bill, a maintenance job, or typed in directly.
const origin = sql<string | null>`${expenseEntries.sourceType}`;

function inPeriod(tenantId: string, from: string, to: string) {
  return and(eq(ledgerEntries.tenantId, tenantId), gte(ledgerEntries.date, from), lte(ledgerEntries.date, to));
}

type LineFacts = {
  accountId: string;
  direction: "in" | "out";
  kind: "income" | "expense" | "transfer";
  sourceType: string;
  origin: string | null;
  category: string;
  fundType: string | null;
};

// The figure a card shows. Ledger cards are sums of ledger lines; the pending cards are lists of
// months or bills still unpaid today.
export type CardKey =
  | "income"
  | "expense"
  | "rent"
  | "salary"
  | "bills"
  | "friday"
  | "qard-given"
  | "qard-repaid"
  | `inc:${"r" | "o"}:${string}`
  | `exp:${string}`
  | `acct:${string}`
  | "rent-pending"
  | "salary-pending"
  | "bills-due";

const PENDING_KEYS = ["rent-pending", "salary-pending", "bills-due"] as const;
export function isPendingKey(key: string): key is (typeof PENDING_KEYS)[number] {
  return (PENDING_KEYS as readonly string[]).includes(key);
}

export function isCardKey(key: string): key is CardKey {
  return (
    isPendingKey(key) ||
    ["income", "expense", "rent", "salary", "bills", "friday", "qard-given", "qard-repaid"].includes(key) ||
    /^inc:[ro]:.+/.test(key) ||
    /^exp:.+/.test(key) ||
    /^acct:.+/.test(key)
  );
}

// Which ledger lines make up a card. `acct:all` is every account together.
export function matches(key: CardKey, l: LineFacts) {
  switch (key) {
    case "income":
      return l.kind === "income";
    case "expense":
      return l.kind === "expense";
    case "rent":
      return l.kind === "income" && l.sourceType === "rent";
    case "salary":
      return l.kind === "expense" && l.sourceType === "salary";
    case "bills":
      return l.kind === "expense" && l.sourceType === "expense" && l.origin === "bill";
    case "friday":
      return l.kind === "income" && l.sourceType === "friday";
    case "qard-given":
      return l.kind === "expense" && l.fundType === "qard_hasan";
    case "qard-repaid":
      return l.kind === "income" && l.fundType === "qard_hasan";
  }
  if (key.startsWith("inc:")) {
    const other = key[4] === "o";
    return l.kind === "income" && (l.sourceType === OTHER_INCOME_SOURCE) === other && l.category === key.slice(6);
  }
  if (key.startsWith("exp:")) return l.kind === "expense" && l.category === key.slice(4);
  if (key.startsWith("acct:")) return key === "acct:all" || l.accountId === key.slice(5);
  return false;
}

function ledgerLineQuery() {
  return {
    accountId: ledgerEntries.accountId,
    direction: ledgerEntries.direction,
    kind: ledgerEntries.kind,
    sourceType: ledgerEntries.sourceType,
    origin,
    category: ledgerEntries.category,
    fundType: sql<string | null>`${funds.type}::text`,
  };
}

// Expense lines are joined to their expense entry (to tell bills apart) and every line to its fund.
const expenseJoin = and(eq(ledgerEntries.sourceType, "expense"), eq(expenseEntries.id, ledgerEntries.sourceId));
const fundJoin = eq(ledgerEntries.fundId, funds.id);

// Rent and salary months inside the period that are still unpaid today, by Rental Month and
// Salary Month (never by payment date). Bills: unpaid, with the due date inside the period.
async function pendingFor(tenantId: string, from: string, to: string) {
  const now = currentYearMonth();
  const months = pendingMonthsFor(from, to);
  const wanted = new Set(months.map((m) => `${m.year}-${m.month}`));
  const [rooms, people, dueBills] = await Promise.all([
    getRoomFacts(),
    getStaffFacts(),
    db
      .select({
        id: bills.id,
        accountLabel: billAccounts.name,
        year: bills.year,
        month: bills.month,
        amount: bills.amount,
        dueDate: bills.dueDate,
      })
      .from(bills)
      .innerJoin(billAccounts, eq(bills.billAccountId, billAccounts.id))
      .where(and(eq(bills.tenantId, tenantId), isNull(bills.paidDate), gte(bills.dueDate, from), lte(bills.dueDate, to)))
      .orderBy(asc(bills.dueDate), asc(billAccounts.name)),
  ]);
  // Variable rooms whose rent for one of these months is not entered yet: they cannot count as pending.
  const unsetRooms = rooms.filter((room) => months.some((m) => roomMonth(room, m.year, m.month, now).status === "unset")).length;
  const rent = rooms.flatMap((room) =>
    pendingMonths(room, now)
      .filter((p) => wanted.has(`${p.year}-${p.month}`))
      .map((p) => ({ ...p, label: room.label, tenantName: p.tenancy.tenantName })),
  );
  const salary = people.flatMap((person) =>
    salaryLines(person).flatMap((kind) =>
      personUnpaidMonths(person, kind, now)
        .filter((m) => wanted.has(`${m.year}-${m.month}`))
        .map((m) => ({ ...m, kind, name: person.name })),
    ),
  );
  return { rent, salary, dueBills, unsetRooms };
}

const sumAmounts = (rows: { amount: number | string }[]) =>
  Math.round(rows.reduce((s, r) => s + Math.round(Number(r.amount) * 100), 0)) / 100;

export async function getDashboardPeriod(from: string, to: string) {
  const tenant = await ensureTenant();
  const [accounts, groups, before, fundRows, fundMoves, pending] = await Promise.all([
    db.select().from(cashAccounts).where(eq(cashAccounts.tenantId, tenant.id)).orderBy(asc(cashAccounts.type), asc(cashAccounts.name)),
    db
      .select({ ...ledgerLineQuery(), total: sql<string>`sum(${ledgerEntries.amount})`, count: sql<number>`count(*)::int` })
      .from(ledgerEntries)
      .leftJoin(expenseEntries, expenseJoin)
      .leftJoin(funds, fundJoin)
      .where(inPeriod(tenant.id, from, to))
      .groupBy(
        ledgerEntries.accountId,
        ledgerEntries.direction,
        ledgerEntries.kind,
        ledgerEntries.sourceType,
        expenseEntries.sourceType,
        ledgerEntries.category,
        funds.type,
      ),
    db
      .select({ accountId: ledgerEntries.accountId, total: sql<string>`sum(${signed})` })
      .from(ledgerEntries)
      .where(and(eq(ledgerEntries.tenantId, tenant.id), lt(ledgerEntries.date, from)))
      .groupBy(ledgerEntries.accountId),
    db
      .select({ id: funds.id, name: funds.name, type: funds.type, isRestricted: funds.isRestricted })
      .from(funds)
      .where(eq(funds.tenantId, tenant.id))
      .orderBy(funds.name),
    db
      .select({ fundId: ledgerEntries.fundId, total: sql<string>`sum(${signed})` })
      .from(ledgerEntries)
      .where(and(eq(ledgerEntries.tenantId, tenant.id), lte(ledgerEntries.date, to)))
      .groupBy(ledgerEntries.fundId),
    pendingFor(tenant.id, from, to),
  ]);

  const lines = groups.map((g) => ({ ...g, amount: Number(g.total) }));
  const total = (key: CardKey) => sumAmounts(lines.filter((l) => matches(key, l)));
  const count = (key: CardKey) => lines.filter((l) => matches(key, l)).reduce((s, l) => s + l.count, 0);

  // Opening as on the From date + in - out = closing as on the To date, exactly as the Cash Book does it.
  const beforeMap = new Map(before.map((b) => [b.accountId, Number(b.total)]));
  const balances = accounts
    .map((a) => {
      const opening = round2(Number(a.openingBalance) + (beforeMap.get(a.id) ?? 0));
      const own = lines.filter((l) => l.accountId === a.id);
      const moneyIn = sumAmounts(own.filter((l) => l.direction === "in"));
      const moneyOut = sumAmounts(own.filter((l) => l.direction === "out"));
      return {
        id: a.id,
        name: a.name,
        type: a.type,
        isActive: a.isActive,
        opening,
        in: moneyIn,
        out: moneyOut,
        closing: round2(opening + moneyIn - moneyOut),
      };
    })
    // A hidden account still shows while it holds money or moved money in the period.
    .filter((a) => a.isActive || a.opening !== 0 || a.closing !== 0 || a.in !== 0 || a.out !== 0);
  const sumOf = (k: "opening" | "in" | "out" | "closing") => round2(balances.reduce((s, a) => s + a[k], 0));

  const byCategory = (kind: "income" | "expense") => {
    const map = new Map<string, { key: CardKey; category: string; other: boolean; amount: number; count: number }>();
    for (const l of lines) {
      if (l.kind !== kind) continue;
      const other = kind === "income" && l.sourceType === OTHER_INCOME_SOURCE;
      const key = (kind === "income" ? `inc:${other ? "o" : "r"}:${l.category}` : `exp:${l.category}`) as CardKey;
      const row = map.get(key) ?? { key, category: l.category, other, amount: 0, count: 0 };
      row.amount = round2(row.amount + l.amount);
      row.count += l.count;
      map.set(key, row);
    }
    return [...map.values()].sort((a, b) => Number(a.other) - Number(b.other) || b.amount - a.amount || a.category.localeCompare(b.category));
  };

  const income = total("income");
  const expense = total("expense");
  const fundMap = new Map(fundMoves.map((m) => [m.fundId, Number(m.total)]));
  const hasQard = fundRows.some((f) => f.type === "qard_hasan");

  return {
    from,
    to,
    income,
    expense,
    net: round2(income - expense),
    incomeCount: count("income"),
    expenseCount: count("expense"),
    incomeByCategory: byCategory("income"),
    expenseByCategory: byCategory("expense"),
    accounts: balances.map((a) => ({ id: a.id, name: a.name, type: a.type, opening: a.opening, in: a.in, out: a.out, closing: a.closing })),
    totals: { opening: sumOf("opening"), in: sumOf("in"), out: sumOf("out"), closing: sumOf("closing") },
    rent: {
      collected: total("rent"),
      collectedCount: count("rent"),
      pendingCount: pending.rent.length,
      pendingAmount: sumAmounts(pending.rent),
      unsetRooms: pending.unsetRooms,
    },
    salary: {
      paid: total("salary"),
      paidCount: count("salary"),
      pendingCount: pending.salary.length,
      pendingAmount: sumAmounts(pending.salary),
    },
    bills: {
      paid: total("bills"),
      paidCount: count("bills"),
      dueCount: pending.dueBills.length,
      dueAmount: sumAmounts(pending.dueBills),
      due: pending.dueBills.slice(0, 4),
    },
    friday: { amount: total("friday"), count: count("friday") },
    qard: hasQard ? { given: total("qard-given"), givenCount: count("qard-given"), repaid: total("qard-repaid"), repaidCount: count("qard-repaid") } : null,
    // Fund balances as on the To date.
    funds: fundRows.map((f) => ({ id: f.id, name: f.name, isRestricted: f.isRestricted, balance: round2(fundMap.get(f.id) ?? 0) })),
  };
}

export type DashboardPeriod = Awaited<ReturnType<typeof getDashboardPeriod>>;

export type EntryRow = {
  id: string;
  date: string | null;
  title: string;
  detail: string;
  direction: "in" | "out" | null;
  amount: number;
};

export type DashboardEntries = {
  rows: EntryRow[];
  count: number;
  total: number;
  // Only for a Cash/Bank card: the same four figures as the Cash Book.
  book?: { opening: number; in: number; out: number; closing: number };
};

// Most rows a list sends to the phone. The total and count always cover every entry.
const LIST_LIMIT = 500;

const monthLabel = (year: number, month: number) => `${MONTHS[month - 1]} ${year}`;

// The entries behind one card for the same period.
export async function getDashboardEntries(key: CardKey, from: string, to: string): Promise<DashboardEntries> {
  const tenant = await ensureTenant();

  if (isPendingKey(key)) {
    const pending = await pendingFor(tenant.id, from, to);
    const rows: EntryRow[] =
      key === "rent-pending"
        ? pending.rent.map((p, i) => ({
            id: `r${i}`,
            date: null,
            title: p.label,
            detail: [monthLabel(p.year, p.month), p.tenantName].filter(Boolean).join(" · "),
            direction: null,
            amount: p.amount,
          }))
        : key === "salary-pending"
          ? pending.salary.map((p, i) => ({
              id: `s${i}`,
              date: null,
              title: p.name,
              detail: `${monthLabel(p.year, p.month)}${p.kind === "cleaning" ? " · Cleaning fee" : ""}`,
              direction: null,
              amount: p.amount,
            }))
          : pending.dueBills.map((b) => ({
              id: b.id,
              date: b.dueDate,
              title: b.accountLabel,
              detail: monthLabel(b.year, b.month),
              direction: null,
              amount: Number(b.amount),
            }));
    return { rows: rows.slice(0, LIST_LIMIT), count: rows.length, total: sumAmounts(rows) };
  }

  const all = await db
    .select({
      ...ledgerLineQuery(),
      id: ledgerEntries.id,
      date: ledgerEntries.date,
      amount: ledgerEntries.amount,
      party: ledgerEntries.party,
      houseName: ledgerEntries.houseName,
      receiptNumber: ledgerEntries.receiptNumber,
      note: ledgerEntries.note,
      accountName: cashAccounts.name,
    })
    .from(ledgerEntries)
    .leftJoin(expenseEntries, expenseJoin)
    .leftJoin(funds, fundJoin)
    .leftJoin(cashAccounts, eq(ledgerEntries.accountId, cashAccounts.id))
    .where(inPeriod(tenant.id, from, to))
    .orderBy(desc(ledgerEntries.date), desc(ledgerEntries.createdAt), desc(ledgerEntries.id));
  const lines = all.filter((l) => matches(key, l));
  const rows: EntryRow[] = lines.map((l) => ({
    id: l.id,
    date: l.date,
    title: [l.category, l.party].filter(Boolean).join(" · "),
    detail: [l.houseName, l.receiptNumber, l.note, l.accountName].filter(Boolean).join(" · "),
    direction: l.direction,
    amount: Number(l.amount),
  }));
  const moneyIn = sumAmounts(rows.filter((r) => r.direction === "in"));
  const moneyOut = sumAmounts(rows.filter((r) => r.direction === "out"));

  let book: DashboardEntries["book"];
  if (key.startsWith("acct:")) {
    const accountId = key.slice(5);
    const [accounts, before] = await Promise.all([
      db
        .select({ id: cashAccounts.id, openingBalance: cashAccounts.openingBalance })
        .from(cashAccounts)
        .where(and(eq(cashAccounts.tenantId, tenant.id), accountId === "all" ? undefined : eq(cashAccounts.id, accountId))),
      db
        .select({ total: sql<string>`coalesce(sum(${signed}), 0)` })
        .from(ledgerEntries)
        .where(
          and(
            eq(ledgerEntries.tenantId, tenant.id),
            accountId === "all" ? undefined : eq(ledgerEntries.accountId, accountId),
            lt(ledgerEntries.date, from),
          ),
        ),
    ]);
    const opening = round2(accounts.reduce((s, a) => s + Number(a.openingBalance), 0) + Number(before[0]?.total ?? 0));
    book = { opening, in: moneyIn, out: moneyOut, closing: round2(opening + moneyIn - moneyOut) };
  }

  return {
    rows: rows.slice(0, LIST_LIMIT),
    count: rows.length,
    total: book ? book.closing : sumAmounts(rows),
    book,
  };
}
