import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cashAccounts, salaryPayments, staff } from "@/db/schema";
import { MONTHS } from "@/lib/format";
import { ensureTenant } from "@/lib/queries/auth";
import { getStaffFacts, personUnpaid } from "@/lib/queries/salary";
import { staffRoleLabel } from "@/lib/salary/calc";
import { monthFilter, sumBy, yearFilter } from "./helpers";
import type { ReportColumn, ReportDefinition, ReportRow } from "./types";

const lineColumns: ReportColumn[] = [
  { key: "basic", label: "Basic salary", kind: "money" },
  { key: "cleaning", label: "Cleaning fee", kind: "money" },
  { key: "ramadan", label: "Ramadan allowance", kind: "money" },
  { key: "other", label: "Other additions", kind: "money" },
  { key: "total", label: "Total", kind: "money" },
];

const lineTotals = (rows: ReportRow[]) => ({
  basic: sumBy(rows, "basic"),
  cleaning: sumBy(rows, "cleaning"),
  ramadan: sumBy(rows, "ramadan"),
  other: sumBy(rows, "other"),
  total: sumBy(rows, "total"),
});

export const salaryReports: ReportDefinition[] = [
  {
    slug: "salary-register",
    title: "Monthly salary register",
    description: "Everyone paid in a month, with each line",
    group: "Salaries",
    build: async (params) => {
      const tenant = await ensureTenant();
      const { year, filter: yearF } = yearFilter(params);
      const { month, filter: monthF } = monthFilter(params);
      const payments = await db
        .select({ p: salaryPayments, name: staff.name, role: staff.role, via: cashAccounts.name })
        .from(salaryPayments)
        .innerJoin(staff, eq(salaryPayments.staffId, staff.id))
        .leftJoin(cashAccounts, eq(salaryPayments.accountId, cashAccounts.id))
        .where(and(eq(salaryPayments.tenantId, tenant.id), eq(salaryPayments.year, year), eq(salaryPayments.month, month)));
      const rows: ReportRow[] = payments.map(({ p, name, role, via }) => ({
        name,
        role: staffRoleLabel[role],
        basic: Number(p.basic),
        cleaning: Number(p.cleaning),
        ramadan: Number(p.ramadan),
        other: Number(p.otherAdditions),
        total: Number(p.amount),
        paidDate: p.paidDate,
        via,
      }));
      return {
        slug: "salary-register",
        title: "Monthly salary register",
        subtitle: `${MONTHS[month - 1]} ${year}`,
        filters: [monthF, yearF],
        columns: [
          { key: "name", label: "Name" },
          { key: "role", label: "Role", translate: true },
          ...lineColumns,
          { key: "paidDate", label: "Payment date", kind: "date" },
          { key: "via", label: "Paid via" },
        ],
        rows,
        totals: { name: "Total", ...lineTotals(rows) },
      };
    },
  },
  {
    slug: "staff-history",
    title: "Staff-wise payment history",
    description: "Every payment to one person",
    group: "Salaries",
    build: async (params) => {
      const people = await getStaffFacts();
      const person = people.find((p) => p.id === params.staff) ?? people[0];
      const columns: ReportColumn[] = [
        { key: "month", label: "Month" },
        ...lineColumns,
        { key: "paidDate", label: "Payment date", kind: "date" },
        { key: "via", label: "Paid via" },
      ];
      if (!person) return { slug: "staff-history", title: "Staff-wise payment history", filters: [], columns, rows: [] };
      const rows: ReportRow[] = [...person.payments]
        .sort((a, b) => a.year * 100 + a.month - (b.year * 100 + b.month))
        .map((p) => ({
          month: `${MONTHS[p.month - 1]} ${p.year}`,
          basic: Number(p.basic),
          cleaning: Number(p.cleaning),
          ramadan: Number(p.ramadan),
          other: Number(p.otherAdditions),
          total: Number(p.amount),
          paidDate: p.paidDate,
          via: p.accountName,
        }));
      return {
        slug: "staff-history",
        title: "Staff-wise payment history",
        subtitle: person.name,
        filters: [
          {
            name: "staff",
            label: "Staff",
            type: "select",
            value: person.id,
            options: people.map((p) => ({ value: p.id, label: p.name })),
          },
        ],
        columns,
        rows,
        totals: { month: "Total", ...lineTotals(rows) },
      };
    },
  },
  {
    slug: "unpaid-salaries",
    title: "Unpaid salaries",
    description: "Months not yet paid, up to this month",
    group: "Salaries",
    build: async () => {
      const people = await getStaffFacts();
      const rows: ReportRow[] = [];
      for (const person of people) {
        for (const kind of ["salary", "cleaning"] as const) {
          for (const m of personUnpaid(person, kind)) {
            rows.push({
              name: person.name,
              line: kind === "cleaning" ? "Cleaning fee" : "Salary",
              month: `${MONTHS[m.month - 1]} ${m.year}`,
              amount: m.amount,
            });
          }
        }
      }
      return {
        slug: "unpaid-salaries",
        title: "Unpaid salaries",
        filters: [],
        columns: [
          { key: "name", label: "Name" },
          { key: "line", label: "Type", translate: true },
          { key: "month", label: "Month" },
          { key: "amount", label: "Amount", kind: "money" },
        ],
        rows,
        totals: { name: "Total", amount: sumBy(rows, "amount") },
      };
    },
  },
];
