import { and, asc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { cashAccounts, fridayCollections, ledgerEntries } from "@/db/schema";
import { MONTHS, monthEnd, monthStart } from "@/lib/format";
import { ensureTenant } from "@/lib/queries/auth";
import { dateRange, sumBy, yearFilter } from "./helpers";
import type { ReportColumn, ReportDefinition, ReportRow } from "./types";

const SOURCES = ["collection", "friday", "subscription"];

const lineColumns: ReportColumn[] = [
  { key: "date", label: "Date", kind: "date" },
  { key: "category", label: "Category", translate: true },
  { key: "party", label: "Payer name" },
  { key: "house", label: "House / family name" },
  { key: "book", label: "Book number" },
  { key: "receipt", label: "Receipt No." },
  { key: "via", label: "Received via" },
  { key: "amount", label: "Amount", kind: "money" },
];

async function collectionLines(tenantId: string, from: string, to: string) {
  const lines = await db
    .select({
      date: ledgerEntries.date,
      category: ledgerEntries.category,
      party: ledgerEntries.party,
      house: ledgerEntries.houseName,
      book: ledgerEntries.bookNumber,
      receipt: ledgerEntries.receiptNumber,
      via: cashAccounts.name,
      amount: ledgerEntries.amount,
      sourceType: ledgerEntries.sourceType,
    })
    .from(ledgerEntries)
    .leftJoin(cashAccounts, eq(ledgerEntries.accountId, cashAccounts.id))
    .where(
      and(
        eq(ledgerEntries.tenantId, tenantId),
        inArray(ledgerEntries.sourceType, SOURCES),
        gte(ledgerEntries.date, from),
        lte(ledgerEntries.date, to),
      ),
    )
    .orderBy(asc(ledgerEntries.date), asc(ledgerEntries.createdAt));
  return lines.map((l) => ({ ...l, amount: Number(l.amount) }));
}

export const collectionReports: ReportDefinition[] = [
  {
    slug: "collection-by-category",
    title: "Category-wise collection",
    description: "Each category by month for a year",
    group: "Collections",
    build: async (params) => {
      const tenant = await ensureTenant();
      const { year, filter } = yearFilter(params);
      const lines = await db
        .select({
          category: ledgerEntries.category,
          month: sql<number>`extract(month from ${ledgerEntries.date})::int`,
          total: sql<string>`sum(${ledgerEntries.amount})`,
        })
        .from(ledgerEntries)
        .where(
          and(
            eq(ledgerEntries.tenantId, tenant.id),
            inArray(ledgerEntries.sourceType, SOURCES),
            gte(ledgerEntries.date, monthStart(year, 1)),
            lte(ledgerEntries.date, monthEnd(year, 12)),
          ),
        )
        .groupBy(ledgerEntries.category, sql`2`);
      const categories = [...new Set(lines.map((l) => l.category))].sort();
      const rows: ReportRow[] = categories.map((category) => {
        const row: ReportRow = { category };
        let total = 0;
        MONTHS.forEach((m, i) => {
          const amount = Number(lines.find((l) => l.category === category && l.month === i + 1)?.total ?? 0);
          row[m] = amount;
          total += amount;
        });
        row.total = total;
        return row;
      });
      const totals: ReportRow = { category: "Total", total: sumBy(rows, "total") };
      for (const m of MONTHS) totals[m] = sumBy(rows, m);
      return {
        slug: "collection-by-category",
        title: "Category-wise collection",
        subtitle: String(year),
        filters: [filter],
        columns: [
          { key: "category", label: "Category", translate: true },
          ...MONTHS.map((m) => ({ key: m, label: m, kind: "money" as const })),
          { key: "total", label: "Total", kind: "money" },
        ],
        rows,
        totals,
      };
    },
  },
  {
    slug: "friday-by-week",
    title: "Friday collection by week",
    description: "Every Friday in a year",
    group: "Collections",
    build: async (params) => {
      const tenant = await ensureTenant();
      const { year, filter } = yearFilter(params);
      const list = await db
        .select({
          date: fridayCollections.date,
          countedBy: fridayCollections.countedBy,
          via: cashAccounts.name,
          amount: fridayCollections.totalAmount,
          notes: fridayCollections.notes,
        })
        .from(fridayCollections)
        .leftJoin(cashAccounts, eq(fridayCollections.accountId, cashAccounts.id))
        .where(
          and(
            eq(fridayCollections.tenantId, tenant.id),
            gte(fridayCollections.date, monthStart(year, 1)),
            lte(fridayCollections.date, monthEnd(year, 12)),
          ),
        )
        .orderBy(asc(fridayCollections.date));
      const rows: ReportRow[] = list.map((l, i) => ({ week: i + 1, ...l, amount: Number(l.amount) }));
      return {
        slug: "friday-by-week",
        title: "Friday collection by week",
        subtitle: String(year),
        filters: [filter],
        columns: [
          { key: "week", label: "Week" },
          { key: "date", label: "Date", kind: "date" },
          { key: "countedBy", label: "Counted by" },
          { key: "via", label: "Received via" },
          { key: "notes", label: "Note", wrap: true },
          { key: "amount", label: "Amount", kind: "money" },
        ],
        rows,
        totals: { week: "Total", amount: sumBy(rows, "amount") },
      };
    },
  },
  {
    slug: "donor-statement",
    title: "Donor/member-wise statement",
    description: "Everything received from one person or house",
    group: "Collections",
    build: async (params) => {
      const tenant = await ensureTenant();
      const { from, to, filters } = dateRange(params, 23);
      const all = (await collectionLines(tenant.id, from, to)).filter((l) => l.sourceType !== "friday");
      const names = [...new Set(all.map((l) => l.house || l.party).filter(Boolean))].sort() as string[];
      const name = params.name && names.includes(params.name) ? params.name : (names[0] ?? "");
      const rows: ReportRow[] = all.filter((l) => (l.house || l.party) === name);
      return {
        slug: "donor-statement",
        title: "Donor/member-wise statement",
        subtitle: name,
        filters: [
          { name: "name", label: "Name", type: "select", value: name, options: names.map((n) => ({ value: n, label: n })) },
          ...filters,
        ],
        columns: lineColumns,
        rows,
        totals: { category: "Total", amount: sumBy(rows, "amount") },
      };
    },
  },
  {
    slug: "receipt-book",
    title: "Listing by receipt book",
    description: "All receipts in one book",
    group: "Collections",
    build: async (params) => {
      const tenant = await ensureTenant();
      const { from, to, filters } = dateRange(params, 23);
      const all = (await collectionLines(tenant.id, from, to)).filter((l) => l.book);
      const books = [...new Set(all.map((l) => l.book))].sort() as string[];
      const book = params.book && books.includes(params.book) ? params.book : (books[0] ?? "");
      const rows: ReportRow[] = all
        .filter((l) => l.book === book)
        .sort((a, b) => (a.receipt ?? "").localeCompare(b.receipt ?? "", undefined, { numeric: true }));
      return {
        slug: "receipt-book",
        title: "Listing by receipt book",
        subtitle: book,
        filters: [
          { name: "book", label: "Book number", type: "select", value: book, options: books.map((b) => ({ value: b, label: b })) },
          ...filters,
        ],
        columns: lineColumns,
        rows,
        totals: { category: "Total", amount: sumBy(rows, "amount") },
      };
    },
  },
];
