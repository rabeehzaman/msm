import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { fridayCollections, ledgerEntries } from "@/db/schema";
import { billState } from "@/lib/bills";
import { currentYearMonth, monthEnd, monthStart, todayIST } from "@/lib/format";
import { getAccountsWithBalances } from "./accounts";
import { ensureTenant } from "./auth";
import { getUnpaidBills } from "./expenses";
import { getRentSummary } from "./rent";
import { getSalarySummary } from "./salary";

function latestFriday(today: string) {
  const day = new Date(`${today}T00:00:00Z`);
  const back = (day.getUTCDay() + 2) % 7;
  return new Date(day.getTime() - back * 86400000).toISOString().slice(0, 10);
}

export async function getTreasurerDashboard() {
  const tenant = await ensureTenant();
  const today = todayIST();
  const { year, month } = currentYearMonth();
  const friday = latestFriday(today);
  const [accounts, moved, rent, salary, bills, fridayRows] = await Promise.all([
    getAccountsWithBalances(),
    db
      .select({ kind: ledgerEntries.kind, total: sql<string>`sum(${ledgerEntries.amount})` })
      .from(ledgerEntries)
      .where(
        and(
          eq(ledgerEntries.tenantId, tenant.id),
          gte(ledgerEntries.date, monthStart(year, month)),
          lte(ledgerEntries.date, monthEnd(year, month)),
        ),
      )
      .groupBy(ledgerEntries.kind),
    getRentSummary(),
    getSalarySummary(),
    getUnpaidBills(),
    db
      .select({ total: sql<string>`coalesce(sum(${fridayCollections.totalAmount}), 0)` })
      .from(fridayCollections)
      .where(and(eq(fridayCollections.tenantId, tenant.id), eq(fridayCollections.date, friday))),
  ]);
  const active = accounts.filter((a) => a.isActive);
  const dueBills = bills
    .map((b) => ({ ...b, state: billState(b.dueDate, null, today) }))
    .filter((b) => b.state === "overdue" || b.state === "soon");
  return {
    accounts: active.map(({ id, name, type, balance }) => ({ id, name, type, balance })),
    totalBalance: active.reduce((s, a) => s + a.balance, 0),
    monthIncome: Number(moved.find((m) => m.kind === "income")?.total ?? 0),
    monthExpense: Number(moved.find((m) => m.kind === "expense")?.total ?? 0),
    rent,
    salary,
    dueBills,
    friday: { date: friday, amount: Number(fridayRows[0]?.total ?? 0) },
  };
}
