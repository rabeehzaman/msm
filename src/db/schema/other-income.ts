import { pgTable, uuid, text, timestamp, numeric, date, integer, boolean, unique, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { funds } from "./funds";
import { cashAccounts } from "./accounts";

// Other Income (migration 0009): money that is not a collection, e.g. hall hire, scrap sale, bank interest.
export const incomeHeads = pgTable(
  "income_heads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").default(99).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("income_heads_tenant_id_name_key").on(t.tenantId, t.name)],
);

export const otherIncomeEntries = pgTable(
  "other_income_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    headId: uuid("head_id").notNull().references(() => incomeHeads.id, { onDelete: "restrict" }),
    fundId: uuid("fund_id").notNull().references(() => funds.id, { onDelete: "restrict" }),
    accountId: uuid("account_id").notNull().references(() => cashAccounts.id, { onDelete: "restrict" }),
    date: date("date").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    receivedFrom: text("received_from"),
    receiptNumber: text("receipt_number").notNull(),
    bookNumber: text("book_number"),
    note: text("note"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("other_income_entries_date_idx").on(t.tenantId, t.date.desc()),
    index("other_income_entries_head_idx").on(t.headId),
  ],
);
