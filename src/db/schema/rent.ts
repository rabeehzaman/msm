import { pgTable, uuid, text, timestamp, numeric, date, integer, unique } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { cashAccounts } from "./accounts";

export const buildings = pgTable(
  "buildings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("buildings_tenant_id_name_key").on(t.tenantId, t.name)],
);

export const floors = pgTable(
  "floors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    buildingId: uuid("building_id").notNull().references(() => buildings.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("floors_building_id_name_key").on(t.buildingId, t.name)],
);

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    floorId: uuid("floor_id").notNull().references(() => floors.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    notes: text("notes"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("rooms_floor_id_name_key").on(t.floorId, t.name)],
);

export const roomTenancies = pgTable("room_tenancies", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  roomId: uuid("room_id").notNull().references(() => rooms.id, { onDelete: "restrict" }),
  tenantName: text("tenant_name").notNull(),
  phone: text("phone"),
  shopName: text("shop_name"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  duesFrom: date("dues_from"),
  notes: text("notes"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const roomRents = pgTable(
  "room_rents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    roomId: uuid("room_id").notNull().references(() => rooms.id, { onDelete: "restrict" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    effectiveFrom: date("effective_from").notNull(),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("room_rents_room_id_effective_from_key").on(t.roomId, t.effectiveFrom)],
);

export const rentPayments = pgTable(
  "rent_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    roomId: uuid("room_id").notNull().references(() => rooms.id, { onDelete: "restrict" }),
    tenancyId: uuid("tenancy_id").notNull().references(() => roomTenancies.id, { onDelete: "restrict" }),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    paidDate: date("paid_date").notNull(),
    accountId: uuid("account_id").notNull().references(() => cashAccounts.id, { onDelete: "restrict" }),
    receiptNumber: text("receipt_number").notNull(),
    note: text("note"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("rent_payments_room_id_year_month_key").on(t.roomId, t.year, t.month)],
);
