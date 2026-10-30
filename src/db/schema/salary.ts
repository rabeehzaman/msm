import { pgTable, uuid, text, timestamp, numeric, date, integer, boolean, jsonb, pgEnum, unique } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { cashAccounts } from "./accounts";

export const staffRoleEnum = pgEnum("staff_role", ["ustadh", "cleaning", "other"]);
export const cleaningFeeModeEnum = pgEnum("cleaning_fee_mode", ["none", "included", "separate"]);
export const allowanceModeEnum = pgEnum("allowance_mode", ["lump", "split"]);

export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: staffRoleEnum("role").default("ustadh").notNull(),
  phone: text("phone"),
  monthlySalary: numeric("monthly_salary", { precision: 12, scale: 2 }).default("0").notNull(),
  joiningDate: date("joining_date").notNull(),
  duesFrom: date("dues_from"),
  isActive: boolean("is_active").default(true).notNull(),
  cleaningFee: numeric("cleaning_fee", { precision: 12, scale: 2 }).default("0").notNull(),
  cleaningMode: cleaningFeeModeEnum("cleaning_mode").default("none").notNull(),
  notes: text("notes"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const salaryPayments = pgTable(
  "salary_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id").notNull().references(() => staff.id, { onDelete: "restrict" }),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    kind: text("kind").default("salary").notNull(),
    basic: numeric("basic", { precision: 12, scale: 2 }).default("0").notNull(),
    cleaning: numeric("cleaning", { precision: 12, scale: 2 }).default("0").notNull(),
    ramadan: numeric("ramadan", { precision: 12, scale: 2 }).default("0").notNull(),
    otherAdditions: numeric("other_additions", { precision: 12, scale: 2 }).default("0").notNull(),
    otherNote: text("other_note"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    paidDate: date("paid_date").notNull(),
    accountId: uuid("account_id").notNull().references(() => cashAccounts.id, { onDelete: "restrict" }),
    note: text("note"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("salary_payments_staff_id_year_month_kind_key").on(t.staffId, t.year, t.month, t.kind)],
);

export const ramadanAllowances = pgTable("ramadan_allowances", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  staffId: uuid("staff_id").notNull().references(() => staff.id, { onDelete: "restrict" }),
  year: integer("year").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  mode: allowanceModeEnum("mode").notNull(),
  months: jsonb("months").$type<number[]>().notNull(),
  note: text("note"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
