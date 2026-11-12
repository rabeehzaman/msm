import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { cashAccounts, rentPayments, roomTenancies } from "@/db/schema";
import { ensureTenant } from "@/lib/queries/auth";
import { getRoomFacts, roomPending } from "@/lib/queries/rent";
import { MONTHS } from "@/lib/format";
import { dateRange, sumBy, yearFilter } from "./helpers";
import type { ReportDefinition, ReportRow } from "./types";

const monthName = (year: number, month: number) => `${MONTHS[month - 1]} ${year}`;

export const rentReports: ReportDefinition[] = [
  {
    slug: "pending-rent",
    title: "Pending rent list",
    description: "Room, tenant, months due and total due",
    group: "Rent",
    build: async () => {
      const facts = await getRoomFacts();
      const rows: ReportRow[] = [];
      for (const room of facts) {
        const pending = roomPending(room);
        const byTenant = new Map<string, typeof pending>();
        for (const p of pending) byTenant.set(p.tenancy.id, [...(byTenant.get(p.tenancy.id) ?? []), p]);
        for (const list of byTenant.values()) {
          rows.push({
            room: room.label,
            tenant: list[0].tenancy.tenantName,
            monthsDue: list.map((p) => monthName(p.year, p.month)).join(", "),
            count: list.length,
            total: list.reduce((s, p) => s + p.amount, 0),
          });
        }
      }
      return {
        slug: "pending-rent",
        title: "Pending rent list",
        filters: [],
        columns: [
          { key: "room", label: "Room" },
          { key: "tenant", label: "Tenant" },
          { key: "monthsDue", label: "Months due", wrap: true },
          { key: "count", label: "Months" },
          { key: "total", label: "Total due", kind: "money" },
        ],
        rows,
        totals: { room: "Total", count: rows.reduce((s, r) => s + Number(r.count), 0), total: sumBy(rows, "total") },
      };
    },
  },
  {
    slug: "tenant-statement",
    title: "Tenant-wise rent statement",
    description: "Every month paid and pending for one tenant",
    group: "Rent",
    build: async (params) => {
      const facts = await getRoomFacts();
      const tenancies = facts.flatMap((r) => r.tenancies.map((t) => ({ ...t, room: r })));
      const selected = tenancies.find((t) => t.id === params.tenancy) ?? tenancies[0];
      const filters = [
        {
          name: "tenancy",
          label: "Tenant",
          type: "select" as const,
          value: selected?.id ?? "",
          options: tenancies.map((t) => ({ value: t.id, label: `${t.tenantName} (${t.room.label})` })),
        },
      ];
      const columns = [
        { key: "month", label: "Rental Month" },
        { key: "status", label: "Status", translate: true },
        { key: "paidDate", label: "Payment date", kind: "date" as const },
        { key: "account", label: "Paid via" },
        { key: "receipt", label: "Receipt No." },
        { key: "paid", label: "Paid", kind: "money" as const },
        { key: "due", label: "Due", kind: "money" as const },
      ];
      if (!selected) return { slug: "tenant-statement", title: "Tenant-wise rent statement", filters: [], columns, rows: [] };
      const paidRows = selected.room.payments
        .filter((p) => p.tenancyId === selected.id)
        .map((p) => ({
          sort: p.year * 100 + p.month,
          month: monthName(p.year, p.month),
          status: "Paid",
          paidDate: p.paidDate,
          account: p.accountName,
          receipt: p.receiptNumber,
          paid: Number(p.amount),
          due: null,
        }));
      const pendingRows = roomPending(selected.room)
        .filter((p) => p.tenancy.id === selected.id)
        .map((p) => ({
          sort: p.year * 100 + p.month,
          month: monthName(p.year, p.month),
          status: "Due",
          paidDate: null,
          account: null,
          receipt: null,
          paid: null,
          due: p.amount,
        }));
      const rows: ReportRow[] = [...paidRows, ...pendingRows].sort((a, b) => a.sort - b.sort);
      return {
        slug: "tenant-statement",
        title: "Tenant-wise rent statement",
        subtitle: `${selected.tenantName} · ${selected.room.label}`,
        filters,
        columns,
        rows,
        totals: { month: "Total", paid: sumBy(rows, "paid"), due: sumBy(rows, "due") },
      };
    },
  },
  {
    slug: "building-collection",
    title: "Building-wise collection summary",
    description: "Rent collected per building",
    group: "Rent",
    build: async (params) => {
      const tenant = await ensureTenant();
      const { year, filter } = yearFilter(params);
      const facts = await getRoomFacts();
      const payments = await db
        .select({ roomId: rentPayments.roomId, month: rentPayments.month, total: sql<string>`sum(${rentPayments.amount})` })
        .from(rentPayments)
        .where(and(eq(rentPayments.tenantId, tenant.id), eq(rentPayments.year, year)))
        .groupBy(rentPayments.roomId, rentPayments.month);
      const buildings = [...new Set(facts.map((r) => r.buildingName))];
      const rows: ReportRow[] = buildings.map((b) => {
        const roomIds = new Set(facts.filter((r) => r.buildingName === b).map((r) => r.id));
        const row: ReportRow = { building: b };
        let total = 0;
        MONTHS.forEach((m, i) => {
          const amount = payments
            .filter((p) => roomIds.has(p.roomId) && p.month === i + 1)
            .reduce((s, p) => s + Number(p.total), 0);
          row[m] = amount;
          total += amount;
        });
        row.total = total;
        return row;
      });
      const totals: ReportRow = { building: "Total", total: sumBy(rows, "total") };
      for (const m of MONTHS) totals[m] = sumBy(rows, m);
      return {
        slug: "building-collection",
        title: "Building-wise collection summary",
        subtitle: String(year),
        filters: [filter],
        columns: [
          { key: "building", label: "Building" },
          ...MONTHS.map((m) => ({ key: m, label: m, kind: "money" as const })),
          { key: "total", label: "Total", kind: "money" },
        ],
        rows,
        totals,
      };
    },
  },
  {
    slug: "rent-received",
    title: "Rent received",
    description: "Every rent payment by payment date, with the Rental Month it pays for",
    group: "Rent",
    build: async (params) => {
      const tenant = await ensureTenant();
      const { from, to, filters } = dateRange(params, 2);
      const [facts, lines] = await Promise.all([
        getRoomFacts(),
        db
          .select({
            paidDate: rentPayments.paidDate,
            year: rentPayments.year,
            month: rentPayments.month,
            roomId: rentPayments.roomId,
            tenant: roomTenancies.tenantName,
            receipt: rentPayments.receiptNumber,
            via: cashAccounts.name,
            amount: rentPayments.amount,
          })
          .from(rentPayments)
          .innerJoin(roomTenancies, eq(rentPayments.tenancyId, roomTenancies.id))
          .leftJoin(cashAccounts, eq(rentPayments.accountId, cashAccounts.id))
          .where(and(eq(rentPayments.tenantId, tenant.id), gte(rentPayments.paidDate, from), lte(rentPayments.paidDate, to)))
          .orderBy(asc(rentPayments.paidDate), asc(rentPayments.createdAt)),
      ]);
      const labels = new Map(facts.map((r) => [r.id, r.label]));
      const rows: ReportRow[] = lines.map((l) => ({
        paidDate: l.paidDate,
        rentalMonth: monthName(l.year, l.month),
        room: labels.get(l.roomId) ?? "",
        tenant: l.tenant,
        receipt: l.receipt,
        via: l.via,
        amount: Number(l.amount),
      }));
      return {
        slug: "rent-received",
        title: "Rent received",
        filters,
        columns: [
          { key: "paidDate", label: "Payment date", kind: "date" },
          { key: "rentalMonth", label: "Rental Month" },
          { key: "room", label: "Room" },
          { key: "tenant", label: "Tenant" },
          { key: "receipt", label: "Receipt No." },
          { key: "via", label: "Received via" },
          { key: "amount", label: "Amount", kind: "money" },
        ],
        rows,
        totals: { paidDate: "", room: "Total", amount: sumBy(rows, "amount") },
      };
    },
  },
];
