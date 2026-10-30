import { pgTable, uuid, text, timestamp, numeric, date, integer, boolean, unique } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { cashAccounts } from "./accounts";
import { buildings, rooms } from "./rent";

// expense_entries itself lives in finance.ts; these support it.

export const expenseCategories = pgTable(
  "expense_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").default(99).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("expense_categories_tenant_id_name_key").on(t.tenantId, t.name)],
);

export const billAccounts = pgTable(
  "bill_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    consumerNumber: text("consumer_number"),
    categoryId: uuid("category_id").references(() => expenseCategories.id, { onDelete: "set null" }),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text("notes"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("bill_accounts_tenant_id_name_key").on(t.tenantId, t.name)],
);

export const bills = pgTable(
  "bills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    billAccountId: uuid("bill_account_id").notNull().references(() => billAccounts.id, { onDelete: "restrict" }),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    dueDate: date("due_date"),
    paidDate: date("paid_date"),
    accountId: uuid("account_id").references(() => cashAccounts.id, { onDelete: "restrict" }),
    expenseId: uuid("expense_id"),
    note: text("note"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("bills_bill_account_id_year_month_key").on(t.billAccountId, t.year, t.month)],
);

export const maintenanceLogs = pgTable("maintenance_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  buildingId: uuid("building_id").references(() => buildings.id, { onDelete: "restrict" }),
  roomId: uuid("room_id").references(() => rooms.id, { onDelete: "restrict" }),
  area: text("area"),
  work: text("work").notNull(),
  doneBy: text("done_by"),
  cost: numeric("cost", { precision: 12, scale: 2 }).default("0").notNull(),
  status: text("status").default("pending").notNull(),
  photoPath: text("photo_path"),
  paidDate: date("paid_date"),
  accountId: uuid("account_id").references(() => cashAccounts.id, { onDelete: "restrict" }),
  expenseId: uuid("expense_id"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
