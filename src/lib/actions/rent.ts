"use server";

import { and, desc, eq, isNull, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { buildings, floors, rentPayments, roomRents, rooms, roomTenancies } from "@/db/schema";
import { requireAdmin, requireEntry } from "@/lib/auth/guard";
import { monthEnd, monthStart, MONTHS } from "@/lib/format";
import {
  parseAmount, parseDate, parseId, parseOptionalDate, parseYearMonth, requiredText, run, text, UserError,
} from "@/lib/money/action";
import { fundIdByName } from "@/lib/money/funds";
import { nextReceiptNumber, postLedger, removeLedger, replaceLedger, writeAudit, type Tx } from "@/lib/money/ledger";
import { roomLabel, tenancyForMonth } from "@/lib/rent/status";

function refresh() {
  revalidatePath("/rent", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/cash-bank");
}

// --- Buildings, floors and rooms (admin) ---

export async function saveBuilding(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const id = text(formData.get("id"));
    const name = requiredText(formData.get("name"), "Name");
    await db.transaction(async (tx) => {
      if (id) {
        const [row] = await tx
          .update(buildings)
          .set({ name, updatedAt: new Date() })
          .where(and(eq(buildings.id, id), eq(buildings.tenantId, actor.tenantId)))
          .returning();
        await writeAudit(tx, actor, "update", "buildings", id, null, row);
      } else {
        const [row] = await tx.insert(buildings).values({ tenantId: actor.tenantId, name, sortOrder: 99 }).returning();
        await writeAudit(tx, actor, "create", "buildings", row.id, null, row);
      }
    });
    refresh();
  }, "A building with this name already exists.");
}

export async function saveFloor(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const id = text(formData.get("id"));
    const name = requiredText(formData.get("name"), "Name");
    await db.transaction(async (tx) => {
      if (id) {
        const [row] = await tx
          .update(floors)
          .set({ name, updatedAt: new Date() })
          .where(and(eq(floors.id, id), eq(floors.tenantId, actor.tenantId)))
          .returning();
        await writeAudit(tx, actor, "update", "floors", id, null, row);
      } else {
        const buildingId = parseId(formData.get("buildingId"), "a building");
        const [row] = await tx.insert(floors).values({ tenantId: actor.tenantId, buildingId, name, sortOrder: 99 }).returning();
        await writeAudit(tx, actor, "create", "floors", row.id, null, row);
      }
    });
    refresh();
  }, "A floor with this name already exists in this building.");
}

export async function saveRoom(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const id = text(formData.get("id"));
    const name = requiredText(formData.get("name"), "Name");
    const notes = text(formData.get("notes"));
    await db.transaction(async (tx) => {
      if (id) {
        const [row] = await tx
          .update(rooms)
          .set({ name, notes, updatedAt: new Date() })
          .where(and(eq(rooms.id, id), eq(rooms.tenantId, actor.tenantId)))
          .returning();
        await writeAudit(tx, actor, "update", "rooms", id, null, row);
      } else {
        const floorId = parseId(formData.get("floorId"), "a floor");
        const [row] = await tx.insert(rooms).values({ tenantId: actor.tenantId, floorId, name, notes, sortOrder: 99 }).returning();
        await writeAudit(tx, actor, "create", "rooms", row.id, null, row);
      }
    });
    refresh();
  }, "A room with this name already exists on this floor.");
}

// --- Tenants and rent history (admin) ---

function firstOfMonth(date: string) {
  return `${date.slice(0, 7)}-01`;
}

// Starts a tenant in a vacant room, and sets the rent from their first month.
export async function startTenancy(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const roomId = parseId(formData.get("roomId"), "a room");
    const startDate = parseDate(formData.get("startDate"));
    const amount = parseAmount(formData.get("rent"), "Monthly rent");
    await db.transaction(async (tx) => {
      const [overlap] = await tx
        .select({ id: roomTenancies.id, endDate: roomTenancies.endDate })
        .from(roomTenancies)
        .where(eq(roomTenancies.roomId, roomId))
        .orderBy(desc(roomTenancies.startDate))
        .limit(1);
      if (overlap && (!overlap.endDate || overlap.endDate > startDate)) {
        throw new UserError("The new tenant's start date must be after the old tenant's end date.");
      }
      const [row] = await tx
        .insert(roomTenancies)
        .values({
          tenantId: actor.tenantId,
          roomId,
          tenantName: requiredText(formData.get("tenantName"), "Tenant name"),
          phone: text(formData.get("phone")),
          shopName: text(formData.get("shopName")),
          startDate,
          duesFrom: parseOptionalDate(formData.get("duesFrom")),
          notes: text(formData.get("notes")),
          createdBy: actor.userId,
        })
        .returning();
      await setRent(tx, actor.tenantId, actor.userId, roomId, amount, firstOfMonth(startDate));
      await writeAudit(tx, actor, "create", "room_tenancies", row.id, null, { ...row, rent: amount });
    });
    refresh();
  }, "This room already has a tenant.");
}

async function setRent(tx: Tx, tenantId: string, userId: string, roomId: string, amount: string, effectiveFrom: string) {
  await tx
    .insert(roomRents)
    .values({ tenantId, roomId, amount, effectiveFrom, createdBy: userId })
    .onConflictDoUpdate({ target: [roomRents.roomId, roomRents.effectiveFrom], set: { amount } });
}

export async function updateTenancy(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const id = parseId(formData.get("id"), "a tenant");
    const startDate = parseDate(formData.get("startDate"));
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(roomTenancies)
        .where(and(eq(roomTenancies.id, id), eq(roomTenancies.tenantId, actor.tenantId)))
        .for("update")
        .limit(1);
      if (!old) throw new UserError("That tenant no longer exists.");
      const [row] = await tx
        .update(roomTenancies)
        .set({
          tenantName: requiredText(formData.get("tenantName"), "Tenant name"),
          phone: text(formData.get("phone")),
          shopName: text(formData.get("shopName")),
          startDate,
          duesFrom: parseOptionalDate(formData.get("duesFrom")),
          notes: text(formData.get("notes")),
          updatedBy: actor.userId,
          updatedAt: new Date(),
        })
        .where(eq(roomTenancies.id, id))
        .returning();
      await writeAudit(tx, actor, "update", "room_tenancies", id, old, row);
    });
    refresh();
  });
}

// Closes the tenant. Their payments stay against them.
export async function endTenancy(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const id = parseId(formData.get("id"), "a tenant");
    const endDate = parseDate(formData.get("endDate"));
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(roomTenancies)
        .where(and(eq(roomTenancies.id, id), eq(roomTenancies.tenantId, actor.tenantId), isNull(roomTenancies.endDate)))
        .for("update")
        .limit(1);
      if (!old) throw new UserError("That tenant no longer exists.");
      if (endDate < old.startDate) throw new UserError("The end date cannot be before the start date.");
      const [laterPaid] = await tx
        .select({ n: sql<number>`count(*)::int` })
        .from(rentPayments)
        .where(
          and(
            eq(rentPayments.tenancyId, id),
            sql`make_date(${rentPayments.year}, ${rentPayments.month}, 1) > ${endDate}::date`,
          ),
        );
      if (laterPaid.n > 0) throw new UserError("This tenant has paid rent for months after this date. Un-tick those months first.");
      await tx
        .update(roomTenancies)
        .set({ endDate, updatedBy: actor.userId, updatedAt: new Date() })
        .where(eq(roomTenancies.id, id));
      await writeAudit(tx, actor, "update", "room_tenancies", id, { endDate: null }, { endDate });
    });
    refresh();
  });
}

// New rent from the chosen month. Earlier months keep the old rent.
export async function changeRent(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const roomId = parseId(formData.get("roomId"), "a room");
    const amount = parseAmount(formData.get("rent"), "Monthly rent");
    const { year, month } = parseYearMonth(formData.get("year"), formData.get("month"));
    const effectiveFrom = monthStart(year, month);
    await db.transaction(async (tx) => {
      const [room] = await tx
        .select({ id: rooms.id })
        .from(rooms)
        .where(and(eq(rooms.id, roomId), eq(rooms.tenantId, actor.tenantId)))
        .limit(1);
      if (!room) throw new UserError("That room no longer exists.");
      await setRent(tx, actor.tenantId, actor.userId, roomId, amount, effectiveFrom);
      await writeAudit(tx, actor, "update", "room_rents", null, null, { roomId, amount, effectiveFrom });
    });
    refresh();
  });
}

// --- Rent payments ---

async function roomName(tx: Tx, tenantId: string, roomId: string) {
  const [row] = await tx
    .select({ room: rooms.name, floor: floors.name, building: buildings.name })
    .from(rooms)
    .innerJoin(floors, eq(rooms.floorId, floors.id))
    .innerJoin(buildings, eq(floors.buildingId, buildings.id))
    .where(and(eq(rooms.id, roomId), eq(rooms.tenantId, tenantId)))
    .limit(1);
  if (!row) throw new UserError("That room no longer exists.");
  return roomLabel(row.building, row.floor, row.room);
}

// Ticks a month paid: saves the payment and adds it to Cash/Bank in one step.
export async function payRent(formData: FormData) {
  return run(async () => {
    const { actor } = await requireEntry();
    const roomId = parseId(formData.get("roomId"), "a room");
    const { year, month } = parseYearMonth(formData.get("year"), formData.get("month"));
    const amount = parseAmount(formData.get("amount"));
    const paidDate = parseDate(formData.get("paidDate"));
    const accountId = parseId(formData.get("accountId"), "Cash or Bank");
    const note = text(formData.get("note"));

    const id = await db.transaction(async (tx) => {
      const label = await roomName(tx, actor.tenantId, roomId);
      const tenancies = await tx
        .select()
        .from(roomTenancies)
        .where(
          and(
            eq(roomTenancies.roomId, roomId),
            lte(roomTenancies.startDate, monthEnd(year, month)),
          ),
        );
      const tenancy = tenancyForMonth(tenancies, year, month);
      if (!tenancy) throw new UserError("This room has no tenant for that month.");
      const receiptNumber = text(formData.get("receiptNumber")) ?? (await nextReceiptNumber(tx, actor.tenantId, "RENT"));
      const [row] = await tx
        .insert(rentPayments)
        .values({
          tenantId: actor.tenantId,
          roomId,
          tenancyId: tenancy.id,
          year,
          month,
          amount,
          paidDate,
          accountId,
          receiptNumber,
          note,
          createdBy: actor.userId,
        })
        .returning();
      await postLedger(tx, actor, {
        accountId,
        date: paidDate,
        direction: "in",
        kind: "income",
        amount,
        sourceType: "rent",
        sourceId: row.id,
        category: "Rent",
        fundId: await fundIdByName(tx, actor.tenantId, "General Fund"),
        party: tenancy.tenantName,
        receiptNumber,
        note: `${label}, ${MONTHS[month - 1]} ${year}`,
      });
      await writeAudit(tx, actor, "create", "rent_payments", row.id, null, row);
      return row.id;
    });
    refresh();
    return id;
  }, "This month is already marked as paid.");
}

export async function updateRentPayment(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const id = parseId(formData.get("id"), "a payment");
    const amount = parseAmount(formData.get("amount"));
    const paidDate = parseDate(formData.get("paidDate"));
    const accountId = parseId(formData.get("accountId"), "Cash or Bank");
    const note = text(formData.get("note"));
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(rentPayments)
        .where(and(eq(rentPayments.id, id), eq(rentPayments.tenantId, actor.tenantId)))
        .for("update")
        .limit(1);
      if (!old) throw new UserError("That payment no longer exists.");
      const label = await roomName(tx, actor.tenantId, old.roomId);
      const [tenancy] = await tx.select().from(roomTenancies).where(eq(roomTenancies.id, old.tenancyId)).limit(1);
      const receiptNumber = text(formData.get("receiptNumber")) ?? old.receiptNumber;
      const [row] = await tx
        .update(rentPayments)
        .set({ amount, paidDate, accountId, receiptNumber, note, updatedBy: actor.userId, updatedAt: new Date() })
        .where(eq(rentPayments.id, id))
        .returning();
      await replaceLedger(tx, actor, {
        accountId,
        date: paidDate,
        direction: "in",
        kind: "income",
        amount,
        sourceType: "rent",
        sourceId: id,
        category: "Rent",
        fundId: await fundIdByName(tx, actor.tenantId, "General Fund"),
        party: tenancy?.tenantName,
        receiptNumber,
        note: `${label}, ${MONTHS[old.month - 1]} ${old.year}`,
      });
      await writeAudit(tx, actor, "update", "rent_payments", id, old, row);
    });
    refresh();
  });
}

// Un-ticks a paid month and takes the amount back out of Cash/Bank.
export async function deleteRentPayment(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(rentPayments)
        .where(and(eq(rentPayments.id, id), eq(rentPayments.tenantId, actor.tenantId)))
        .for("update")
        .limit(1);
      if (!old) throw new UserError("That payment no longer exists.");
      await removeLedger(tx, "rent", id);
      await tx.delete(rentPayments).where(eq(rentPayments.id, id));
      await writeAudit(tx, actor, "delete", "rent_payments", id, old, null);
    });
    refresh();
  });
}
