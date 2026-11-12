import { cache } from "react";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  buildings, cashAccounts, floors, rentPayments, roomMonthRents, roomRents, rooms, roomTenancies,
} from "@/db/schema";
import { currentYearMonth, monthKey } from "@/lib/format";
import {
  currentRentType, pendingMonths, rentForMonth, roomLabel, roomMonth, type YearMonth,
} from "@/lib/rent/status";
import { ensureTenant } from "./auth";

// Every room with its tenants, rent history, Variable month rents and payments, in one round of
// parallel queries. Memoised per request, so the grid, the totals and the reports share one load.
export const getRoomFacts = cache(async () => {
  const tenant = await ensureTenant();
  const [roomRows, tenancies, rents, monthRents, payments] = await Promise.all([
    db
      .select({
        id: rooms.id,
        name: rooms.name,
        notes: rooms.notes,
        floorId: floors.id,
        floorName: floors.name,
        buildingId: buildings.id,
        buildingName: buildings.name,
      })
      .from(rooms)
      .innerJoin(floors, eq(rooms.floorId, floors.id))
      .innerJoin(buildings, eq(floors.buildingId, buildings.id))
      .where(eq(rooms.tenantId, tenant.id))
      .orderBy(asc(buildings.sortOrder), asc(buildings.name), asc(floors.sortOrder), asc(floors.name), asc(rooms.sortOrder), asc(rooms.name)),
    db.select().from(roomTenancies).where(eq(roomTenancies.tenantId, tenant.id)).orderBy(desc(roomTenancies.startDate)),
    db
      .select({
        id: roomRents.id,
        roomId: roomRents.roomId,
        amount: roomRents.amount,
        effectiveFrom: roomRents.effectiveFrom,
        rentType: roomRents.rentType,
      })
      .from(roomRents)
      .where(eq(roomRents.tenantId, tenant.id)),
    db
      .select({
        roomId: roomMonthRents.roomId,
        year: roomMonthRents.year,
        month: roomMonthRents.month,
        amount: roomMonthRents.amount,
      })
      .from(roomMonthRents)
      .where(eq(roomMonthRents.tenantId, tenant.id)),
    db
      .select({
        id: rentPayments.id,
        roomId: rentPayments.roomId,
        tenancyId: rentPayments.tenancyId,
        year: rentPayments.year,
        month: rentPayments.month,
        part: rentPayments.part,
        amount: rentPayments.amount,
        paidDate: rentPayments.paidDate,
        accountId: rentPayments.accountId,
        accountName: cashAccounts.name,
        receiptNumber: rentPayments.receiptNumber,
        note: rentPayments.note,
      })
      .from(rentPayments)
      .leftJoin(cashAccounts, eq(rentPayments.accountId, cashAccounts.id))
      .where(eq(rentPayments.tenantId, tenant.id))
      .orderBy(asc(rentPayments.part)),
  ]);
  const group = <T extends { roomId: string }>(list: T[]) => {
    const map = new Map<string, T[]>();
    for (const row of list) map.set(row.roomId, [...(map.get(row.roomId) ?? []), row]);
    return map;
  };
  const tenanciesBy = group(tenancies);
  const rentsBy = group(rents);
  const monthRentsBy = group(monthRents);
  const paymentsBy = group(payments);
  return roomRows.map((room) => ({
    ...room,
    label: roomLabel(room.buildingName, room.floorName, room.name),
    tenancies: (tenanciesBy.get(room.id) ?? []).map((t) => ({
      id: t.id,
      tenantName: t.tenantName,
      phone: t.phone,
      shopName: t.shopName,
      startDate: t.startDate,
      endDate: t.endDate,
      duesFrom: t.duesFrom,
      notes: t.notes,
    })),
    rents: [...(rentsBy.get(room.id) ?? [])].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom)),
    monthRents: monthRentsBy.get(room.id) ?? [],
    payments: paymentsBy.get(room.id) ?? [],
  }));
});

export type RoomFacts = Awaited<ReturnType<typeof getRoomFacts>>[number];
export type RentPaymentRow = RoomFacts["payments"][number];

export function roomPending(room: RoomFacts, now: YearMonth = currentYearMonth()) {
  return pendingMonths(room, now);
}

// Rooms with all their facts, for the Rent grid. The grid works out each year's cells on the phone
// from these, so changing the year needs no new request.
export async function getRentRooms() {
  const facts = await getRoomFacts();
  const now = currentYearMonth();
  return facts.map((room) => ({
    id: room.id,
    label: room.label,
    name: room.name,
    buildingName: room.buildingName,
    floorName: room.floorName,
    tenantName: room.tenancies.find((t) => !t.endDate)?.tenantName ?? null,
    rentType: currentRentType(room.rents, now),
    tenancies: room.tenancies,
    rents: room.rents,
    monthRents: room.monthRents,
    payments: room.payments,
  }));
}

// This month's rent plus everything still outstanding, worked out on the server for the
// rent page and the dashboard.
export async function getRentSummary() {
  const facts = await getRoomFacts();
  const now = currentYearMonth();
  let expected = 0;
  let collected = 0;
  let pendingCount = 0;
  let pendingAmount = 0;
  let unsetRooms = 0;
  for (const room of facts) {
    const m = roomMonth(room, now.year, now.month, now);
    collected += m.paidTotal;
    if (m.type === "fixed") {
      // Same as before: a paid month counts what was paid, an unpaid due month its rent.
      if (m.paidCount > 0) expected += m.paidTotal;
      else if (m.status === "due") expected += m.due ?? 0;
    } else if (m.tracked || m.paidCount > 0) {
      expected += Math.max(m.due ?? 0, m.paidTotal);
      if (m.status === "unset") unsetRooms += 1;
    }
    for (const p of pendingMonths(room, now)) {
      pendingCount += 1;
      pendingAmount += p.amount;
    }
  }
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    expected: round(expected),
    collected: round(collected),
    pendingThisMonth: round(expected - collected),
    pendingCount,
    pendingAmount: round(pendingAmount),
    unsetRooms,
  };
}

// Variable rooms with a tenant in a month, for the "Set Variable Rents" screen.
export async function getVariableRentSheet(year: number, month: number) {
  const facts = await getRoomFacts();
  const now = currentYearMonth();
  return facts
    .map((room) => {
      const m = roomMonth(room, year, month, now);
      if (m.type !== "variable" || !m.tenancy) return null;
      const before = room.monthRents
        .filter((r) => monthKey(r.year, r.month) < monthKey(year, month))
        .sort((a, b) => monthKey(b.year, b.month) - monthKey(a.year, a.month))[0];
      const usual = rentForMonth(room.rents, year, month);
      return {
        roomId: room.id,
        label: room.label,
        tenantName: m.tenancy.tenantName,
        lastAmount: before ? Number(before.amount) : null,
        lastMonth: before ? { year: before.year, month: before.month } : null,
        usual: usual > 0 ? usual : null,
        amount: m.due,
        paidTotal: m.paidTotal,
      };
    })
    .filter((r) => r !== null);
}

export async function getBuildingTree() {
  const tenant = await ensureTenant();
  const now = currentYearMonth();
  const [buildingRows, floorRows, facts] = await Promise.all([
    db.select().from(buildings).where(eq(buildings.tenantId, tenant.id)).orderBy(asc(buildings.sortOrder), asc(buildings.name)),
    db.select().from(floors).where(eq(floors.tenantId, tenant.id)).orderBy(asc(floors.sortOrder), asc(floors.name)),
    getRoomFacts(),
  ]);
  return buildingRows.map((b) => ({
    id: b.id,
    name: b.name,
    floors: floorRows
      .filter((f) => f.buildingId === b.id)
      .map((f) => ({
        id: f.id,
        name: f.name,
        rooms: facts
          .filter((r) => r.floorId === f.id)
          .map((r) => {
            const open = r.tenancies.find((t) => !t.endDate);
            return {
              id: r.id,
              name: r.name,
              tenantName: open?.tenantName ?? null,
              shopName: open?.shopName ?? null,
              rent: open ? Number(r.rents[0]?.amount ?? 0) : null,
              rentType: currentRentType(r.rents, now),
            };
          }),
      })),
  }));
}

export async function getRoomDetail(id: string) {
  const facts = await getRoomFacts();
  return facts.find((r) => r.id === id) ?? null;
}
