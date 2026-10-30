import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { funds, ledgerEntries } from "@/db/schema";
import { getAccountBook, getAccountsWithBalances } from "@/lib/queries/accounts";
import { ensureTenant } from "@/lib/queries/auth";
import { MONTHS } from "@/lib/format";
import { dateRange, monthEnd, monthStart, round2, sumBy, yearFilter } from "./helpers";
import type { ReportDefinition, ReportRow } from "./types";

export const cashReports: ReportDefinition[] = [
  {
    slug: "cash-book",
    title: "Cash Book & Bank Book",
    description: "Every in and out for one account, with running balance",
    group: "Cash & Bank",
    build: async (params) => {
      const accounts = await getAccountsWithBalances();
      const accountId = accounts.find((a) => a.id === params.account)?.id ?? accounts[0]?.id;
      if (!accountId) return null;
      const { from, to, filters } = dateRange(params);
      const book = await getAccountBook(accountId, from, to);
      if (!book) return null;
      const rows: ReportRow[] = book.lines.map((l) => ({
        date: l.date,
        particulars: [l.category, l.party, l.note].filter(Boolean).join(" - "),
        receipt: l.receiptNumber,
        in: l.direction === "in" ? Number(l.amount) : null,
        out: l.direction === "out" ? Number(l.amount) : null,
        balance: l.balance,
        by: l.updatedByName ? `${l.createdByName} / ${l.updatedByName}` : l.createdByName,
      }));
      return {
        slug: "cash-book",
        title: book.account.type === "cash" ? "Cash Book" : "Bank Book",
        subtitle: book.account.name,
        filters: [
          {
            name: "account",
            label: "Account",
            type: "select",
            value: accountId,
            options: accounts.map((a) => ({ value: a.id, label: a.name })),
          },
          ...filters,
        ],
        columns: [
          { key: "date", label: "Date", kind: "date" },
          { key: "particulars", label: "Particulars", wrap: true },
          { key: "receipt", label: "Receipt No." },
          { key: "in", label: "In", kind: "money" },
          { key: "out", label: "Out", kind: "money" },
          { key: "balance", label: "Balance", kind: "money" },
          { key: "by", label: "Entered by" },
        ],
        rows,
        totals: { particulars: "Total", in: sumBy(rows, "in"), out: sumBy(rows, "out"), balance: book.closing },
        summary: [
          { label: "Opening balance", value: book.opening },
          { label: "Total in", value: sumBy(rows, "in") },
          { label: "Total out", value: sumBy(rows, "out") },
          { label: "Closing balance", value: book.closing },
        ],
      };
    },
  },
  {
    slug: "income-expense",
    title: "Income & Expense Statement",
    description: "Month by month or for the whole year",
    group: "Cash & Bank",
    build: async (params) => {
      const tenant = await ensureTenant();
      const { year, filter } = yearFilter(params);
      const view = params.view === "category" ? "category" : "monthly";
      const lines = await db
        .select({
          month: sql<number>`extract(month from ${ledgerEntries.date})::int`,
          kind: ledgerEntries.kind,
          category: ledgerEntries.category,
          total: sql<string>`sum(${ledgerEntries.amount})`,
        })
        .from(ledgerEntries)
        .where(
          and(
            eq(ledgerEntries.tenantId, tenant.id),
            gte(ledgerEntries.date, monthStart(year, 1)),
            lte(ledgerEntries.date, monthEnd(year, 12)),
          ),
        )
        .groupBy(sql`1`, ledgerEntries.kind, ledgerEntries.category);
      const income = lines.filter((l) => l.kind === "income");
      const expense = lines.filter((l) => l.kind === "expense");
      const sum = (ls: typeof lines) => round2(ls.reduce((s, l) => s + Number(l.total), 0));
      const totalIncome = sum(income);
      const totalExpense = sum(expense);
      const filters = [
        filter,
        {
          name: "view",
          label: "View",
          type: "select" as const,
          value: view,
          options: [
            { value: "monthly", label: "Month by month" },
            { value: "category", label: "Yearly by category" },
          ],
        },
      ];
      const summary = [
        { label: "Total income", value: totalIncome },
        { label: "Total expense", value: totalExpense },
        { label: "Surplus / deficit", value: round2(totalIncome - totalExpense) },
      ];
      if (view === "category") {
        const group = (ls: typeof lines, type: string): ReportRow[] => {
          const map = new Map<string, number>();
          for (const l of ls) map.set(l.category, (map.get(l.category) ?? 0) + Number(l.total));
          return [...map.entries()]
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([category, amount]) => ({
              type,
              category,
              income: type === "Income" ? round2(amount) : null,
              expense: type === "Expense" ? round2(amount) : null,
            }));
        };
        return {
          slug: "income-expense",
          title: "Income & Expense Statement",
          subtitle: String(year),
          filters,
          columns: [
            { key: "type", label: "Type", translate: true },
            { key: "category", label: "Category", translate: true },
            { key: "income", label: "Income", kind: "money" },
            { key: "expense", label: "Expense", kind: "money" },
          ],
          rows: [...group(income, "Income"), ...group(expense, "Expense")],
          totals: { category: "Total", income: totalIncome, expense: totalExpense },
          summary,
        };
      }
      const rows: ReportRow[] = MONTHS.map((m, i) => {
        const inc = sum(income.filter((l) => l.month === i + 1));
        const exp = sum(expense.filter((l) => l.month === i + 1));
        return { month: m, income: inc, expense: exp, net: round2(inc - exp) };
      });
      return {
        slug: "income-expense",
        title: "Income & Expense Statement",
        subtitle: String(year),
        filters,
        columns: [
          { key: "month", label: "Month", translate: true },
          { key: "income", label: "Income", kind: "money" },
          { key: "expense", label: "Expense", kind: "money" },
          { key: "net", label: "Surplus / deficit", kind: "money" },
        ],
        rows,
        totals: { month: "Total", income: totalIncome, expense: totalExpense, net: round2(totalIncome - totalExpense) },
        summary,
      };
    },
  },
  {
    slug: "fund-wise",
    title: "Fund-wise Report",
    description: "Money in and out of each fund",
    group: "Cash & Bank",
    build: async (params) => {
      const tenant = await ensureTenant();
      const { from, to, filters } = dateRange(params, 11);
      const allFunds = await db.select({ id: funds.id, name: funds.name }).from(funds).where(eq(funds.tenantId, tenant.id)).orderBy(funds.name);
      const moved = await db
        .select({
          fundId: ledgerEntries.fundId,
          kind: ledgerEntries.kind,
          total: sql<string>`sum(${ledgerEntries.amount})`,
        })
        .from(ledgerEntries)
        .where(and(eq(ledgerEntries.tenantId, tenant.id), gte(ledgerEntries.date, from), lte(ledgerEntries.date, to)))
        .groupBy(ledgerEntries.fundId, ledgerEntries.kind);
      const rows: ReportRow[] = allFunds
        .map((f) => {
          const income = Number(moved.find((m) => m.fundId === f.id && m.kind === "income")?.total ?? 0);
          const expense = Number(moved.find((m) => m.fundId === f.id && m.kind === "expense")?.total ?? 0);
          return { fund: f.name, income, expense, net: round2(income - expense) };
        })
        .filter((r) => r.income || r.expense);
      return {
        slug: "fund-wise",
        title: "Fund-wise Report",
        filters,
        columns: [
          { key: "fund", label: "Fund" },
          { key: "income", label: "Income", kind: "money" },
          { key: "expense", label: "Expense", kind: "money" },
          { key: "net", label: "Net", kind: "money" },
        ],
        rows,
        totals: { fund: "Total", income: sumBy(rows, "income"), expense: sumBy(rows, "expense"), net: sumBy(rows, "net") },
      };
    },
  },
];

