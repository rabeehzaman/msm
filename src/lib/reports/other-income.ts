import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { cashAccounts, funds, incomeHeads, otherIncomeEntries } from "@/db/schema";
import { MONTHS } from "@/lib/format";
import { ensureTenant } from "@/lib/queries/auth";
import { dateRange, monthEnd, monthStart, sumBy, yearFilter } from "./helpers";
import type { ReportDefinition, ReportRow } from "./types";

export const otherIncomeReports: ReportDefinition[] = [
  {
    slug: "other-income-by-head",
    title: "Other Income by head",
    description: "Each income head by month for a year",
    group: "Other Income",
    build: async (params) => {
      const tenant = await ensureTenant();
      const { year, filter } = yearFilter(params);
      const lines = await db
        .select({
          head: incomeHeads.name,
          month: sql<number>`extract(month from ${otherIncomeEntries.date})::int`,
          total: sql<string>`sum(${otherIncomeEntries.amount})`,
        })
        .from(otherIncomeEntries)
        .innerJoin(incomeHeads, eq(otherIncomeEntries.headId, incomeHeads.id))
        .where(
          and(
            eq(otherIncomeEntries.tenantId, tenant.id),
            gte(otherIncomeEntries.date, monthStart(year, 1)),
            lte(otherIncomeEntries.date, monthEnd(year, 12)),
          ),
        )
        .groupBy(incomeHeads.name, sql`2`);
      const heads = [...new Set(lines.map((l) => l.head))].sort();
      const rows: ReportRow[] = heads.map((head) => {
        const row: ReportRow = { head };
        let total = 0;
        MONTHS.forEach((m, i) => {
          const amount = Number(lines.find((l) => l.head === head && l.month === i + 1)?.total ?? 0);
          row[m] = amount;
          total += amount;
        });
        row.total = Math.round(total * 100) / 100;
        return row;
      });
      const totals: ReportRow = { head: "Total", total: sumBy(rows, "total") };
      for (const m of MONTHS) totals[m] = sumBy(rows, m);
      return {
        slug: "other-income-by-head",
        title: "Other Income by head",
        subtitle: String(year),
        filters: [filter],
        columns: [
          { key: "head", label: "Income head", translate: true },
          ...MONTHS.map((m) => ({ key: m, label: m, kind: "money" as const })),
          { key: "total", label: "Total", kind: "money" },
        ],
        rows,
        totals,
      };
    },
  },
  {
    slug: "other-income-list",
    title: "Other Income list",
    description: "Every Other Income entry for any dates",
    group: "Other Income",
    build: async (params) => {
      const tenant = await ensureTenant();
      const { from, to, filters } = dateRange(params, 2);
      const lines = await db
        .select({
          date: otherIncomeEntries.date,
          receipt: otherIncomeEntries.receiptNumber,
          head: incomeHeads.name,
          from: otherIncomeEntries.receivedFrom,
          amount: otherIncomeEntries.amount,
          via: cashAccounts.name,
          fund: funds.name,
          note: otherIncomeEntries.note,
        })
        .from(otherIncomeEntries)
        .innerJoin(incomeHeads, eq(otherIncomeEntries.headId, incomeHeads.id))
        .leftJoin(cashAccounts, eq(otherIncomeEntries.accountId, cashAccounts.id))
        .leftJoin(funds, eq(otherIncomeEntries.fundId, funds.id))
        .where(and(eq(otherIncomeEntries.tenantId, tenant.id), gte(otherIncomeEntries.date, from), lte(otherIncomeEntries.date, to)))
        .orderBy(asc(otherIncomeEntries.date), asc(otherIncomeEntries.createdAt));
      const rows: ReportRow[] = lines.map((l) => ({ ...l, amount: Number(l.amount) }));
      return {
        slug: "other-income-list",
        title: "Other Income list",
        filters,
        columns: [
          { key: "date", label: "Date", kind: "date" },
          { key: "receipt", label: "Receipt No." },
          { key: "head", label: "Income head", translate: true },
          { key: "from", label: "Received from" },
          { key: "amount", label: "Amount", kind: "money" },
          { key: "via", label: "Received via" },
          { key: "fund", label: "Fund" },
          { key: "note", label: "Note", wrap: true },
        ],
        rows,
        totals: { date: "", head: "Total", amount: sumBy(rows, "amount") },
      };
    },
  },
];
