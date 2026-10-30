import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { buildings, cashAccounts, floors, rentPayments, roomRents, rooms, roomTenancies } from "@/db/schema";
import { currentYearMonth } from "@/lib/format";
import { cellStatus, isTracked, pendingMonths, rentForMonth, roomLabel, tenancyForMonth } from "@/lib/rent/status";
import { ensureTenant } from "./auth";

export async function getRoomFacts() {
  const tenant = await ensureTenant();
  const [roomRows, tenancies, rents, payments] = await Promise.all([
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
    db.select().from(roomRents).where(eq(roomRents.tenantId, tenant.id)),
    db
      .select({
        id: rentPayments.id,
        roomId: rentPayments.roomId,
        tenancyId: rentPayments.tenancyId,
        year: rentPayments.year,
        month: rentPayments.month,
        amount: rentPayments.amount,
        paidDate: rentPayments.paidDate,
        accountId: rentPayments.accountId,
        accountName: cashAccounts.name,
        receiptNumber: rentPayments.receiptNumber,
        note: rentPayments.note,
        createdAt: rentPayments.createdAt,
        updatedAt: rentPayments.updatedAt,
      })
      .from(rentPayments)
      .leftJoin(cashAccounts, eq(rentPayments.accountId, cashAccounts.id))
      .where(eq(rentPayments.tenantId, tenant.id)),
  ]);
  return roomRows.map((room) => ({
    ...room,
    label: roomLabel(room.buildingName, room.floorName, room.name),
    tenancies: tenancies.filter((t) => t.roomId === room.id),
    rents: rents.filter((r) => r.roomId === room.id).sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom)),
    payments: payments.filter((p) => p.roomId === room.id),
  }));
}

export type RoomFacts = Awaited<ReturnType<typeof getRoomFacts>>[number];

export function monthCell(room: RoomFacts, year: number, month: number, now = currentYearMonth()) {
  const payment = room.payments.find((p) => p.year === year && p.month === month) ?? null;
  const tenancy = tenancyForMonth(room.tenancies, year, month);
  return {
    month,
    status: cellStatus(!!payment, !!tenancy && isTracked(tenancy, year, month), year, month, now),
    expected: rentForMonth(room.rents, year, month),
    tenancyId: tenancy?.id ?? null,
    tenantName: tenancy?.tenantName ?? null,
    payment,
  };
}

export function roomPending(room: RoomFacts, now = currentYearMonth()) {
  const paid = new Set(room.payments.map((p) => `${p.year}-${p.month}`));
  return pendingMonths(room.tenancies, room.rents, paid, now);
}

export async function getRentGrid(year: number) {
  const facts = await getRoomFacts();
  const now = currentYearMonth();
  return facts.map((room) => ({
    id: room.id,
    label: room.label,
    name: room.name,
    buildingName: room.buildingName,
    floorName: room.floorName,
    tenantName: room.tenancies.find((t) => !t.endDate)?.tenantName ?? null,
    months: Array.from({ length: 12 }, (_, i) => monthCell(room, year, i + 1, now)),
  }));
}

// This month's rent plus everything still outstanding, for the rent page and the dashboard.
export async function getRentSummary() {
  const facts = await getRoomFacts();
  const now = currentYearMonth();
  let expected = 0;
  let collected = 0;
  let pendingCount = 0;
  let pendingAmount = 0;
  for (const room of facts) {
    const cell = monthCell(room, now.year, now.month, now);
    if (cell.payment) collected += Number(cell.payment.amount);
    if (cell.payment) expected += Number(cell.payment.amount);
    else if (cell.status === "due") expected += cell.expected;
    for (const p of roomPending(room, now)) {
      pendingCount += 1;
      pendingAmount += p.amount;
    }
  }
  return { expected, collected, pendingThisMonth: expected - collected, pendingCount, pendingAmount };
}

export async function getBuildingTree() {
  const tenant = await ensureTenant();
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
            };
          }),
      })),
  }));
}

export async function getRoomDetail(id: string) {
  const facts = await getRoomFacts();
  return facts.find((r) => r.id === id) ?? null;
}
