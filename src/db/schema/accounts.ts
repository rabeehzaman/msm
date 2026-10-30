import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  date,
  boolean,
  integer,
  pgEnum,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { funds } from "./funds";

// --- APP USERS ---
export const appRoleEnum = pgEnum("app_role", ["admin", "entry", "viewer"]);

export const appUsers = pgTable("app_users", {
  userId: uuid("user_id").primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  displayName: text("display_name"),
  role: appRoleEnum("role"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- CASH AND BANK ACCOUNTS ---
export const cashAccountTypeEnum = pgEnum("cash_account_type", ["cash", "bank"]);

export const cashAccounts = pgTable(
  "cash_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: cashAccountTypeEnum("type").notNull(),
    bankName: text("bank_name"),
    accountNumber: text("account_number"),
    openingBalance: numeric("opening_balance", { precision: 14, scale: 2 }).default("0").notNull(),
    openingDate: date("opening_date").defaultNow().notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text("notes"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("cash_accounts_tenant_id_name_key").on(t.tenantId, t.name)],
);

// --- LEDGER ---
// Every rupee in or out of an account. Balances are calculated from here, never stored.
export const ledgerDirectionEnum = pgEnum("ledger_direction", ["in", "out"]);
export const ledgerKindEnum = pgEnum("ledger_kind", ["income", "expense", "transfer"]);

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => cashAccounts.id, { onDelete: "restrict" }),
    date: date("date").notNull(),
    direction: ledgerDirectionEnum("direction").notNull(),
    kind: ledgerKindEnum("kind").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    sourceType: text("source_type").notNull(),
    sourceId: uuid("source_id").notNull(),
    category: text("category").notNull(),
    fundId: uuid("fund_id").references(() => funds.id, { onDelete: "set null" }),
    party: text("party"),
    houseName: text("house_name"),
    receiptNumber: text("receipt_number"),
    bookNumber: text("book_number"),
    note: text("note"),
    createdBy: uuid("created_by"),
    createdByName: text("created_by_name"),
    updatedBy: uuid("updated_by"),
    updatedByName: text("updated_by_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("ledger_entries_source_type_source_id_direction_key").on(t.sourceType, t.sourceId, t.direction)],
);

// --- TRANSFERS ---
export const cashTransfers = pgTable("cash_transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  fromAccountId: uuid("from_account_id")
    .notNull()
    .references(() => cashAccounts.id, { onDelete: "restrict" }),
  toAccountId: uuid("to_account_id")
    .notNull()
    .references(() => cashAccounts.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  date: date("date").notNull(),
  note: text("note"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- RECEIPT COUNTERS ---
export const receiptCounters = pgTable(
  "receipt_counters",
  {
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    series: text("series").notNull(),
    lastNumber: integer("last_number").default(0).notNull(),
  },
  (t) => [primaryKey({ columns: [t.tenantId, t.series] })],
);
