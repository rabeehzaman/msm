import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  date,
  jsonb,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { funds } from "./funds";
import { households } from "./households";
import { members } from "./members";

// --- PAYMENT METHOD ---
export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "upi",
  "bank_transfer",
  "cheque",
  "card",
  "online_gateway",
  "demand_draft",
  "standing_instruction",
  "other",
]);

// --- INCOME ENTRIES ---
export const incomeEntries = pgTable("income_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  fundId: uuid("fund_id")
    .notNull()
    .references(() => funds.id),
  receiptNumber: text("receipt_number").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  donorMemberId: uuid("donor_member_id").references(() => members.id),
  donorHouseholdId: uuid("donor_household_id").references(() => households.id),
  donorName: text("donor_name"),
  category: text("category").notNull(),
  description: text("description"),
  paymentMethod: paymentMethodEnum("payment_method").default("cash").notNull(),
  referenceNumber: text("reference_number"),
  isAnonymous: boolean("is_anonymous").default(false),
  collectedBy: uuid("collected_by").references(() => members.id),
  receiptUrl: text("receipt_url"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// --- EXPENSE ENTRIES ---
export const expenseStatusEnum = pgEnum("expense_status", [
  "draft",
  "pending_approval",
  "approved",
  "rejected",
  "paid",
  "cancelled",
]);

export const expenseEntries = pgTable("expense_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  fundId: uuid("fund_id")
    .notNull()
    .references(() => funds.id),
  voucherNumber: text("voucher_number").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  payee: text("payee").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  paymentMethod: paymentMethodEnum("payment_method").default("cash").notNull(),
  referenceNumber: text("reference_number"),
  budgetLineId: uuid("budget_line_id").references(() => budgets.id),
  status: expenseStatusEnum("status").default("draft").notNull(),
  requestedBy: uuid("requested_by").references(() => members.id),
  approvedBy: uuid("approved_by").references(() => members.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  attachmentUrls: jsonb("attachment_urls").default([]),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// --- SUBSCRIPTIONS ---
export const subscriptionFrequencyEnum = pgEnum("subscription_frequency", [
  "monthly",
  "quarterly",
  "half_yearly",
  "annual",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "paused",
  "cancelled",
  "defaulted",
]);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  planName: text("plan_name").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: subscriptionFrequencyEnum("frequency").default("monthly").notNull(),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  startDate: date("start_date").notNull(),
  nextDueDate: date("next_due_date").notNull(),
  lastPaidDate: date("last_paid_date"),
  totalPaid: numeric("total_paid", { precision: 12, scale: 2 }).default("0").notNull(),
  totalDue: numeric("total_due", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// --- SUBSCRIPTION PAYMENTS ---
export const subscriptionPayments = pgTable("subscription_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  subscriptionId: uuid("subscription_id")
    .notNull()
    .references(() => subscriptions.id, { onDelete: "cascade" }),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").default("cash").notNull(),
  referenceNumber: text("reference_number"),
  receiptNumber: text("receipt_number"),
  collectedBy: uuid("collected_by").references(() => members.id),
  period: text("period"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// --- FRIDAY COLLECTIONS ---
export const fridayCollectionStatusEnum = pgEnum("friday_collection_status", [
  "open",
  "counting",
  "pending_verification",
  "verified",
  "deposited",
  "reconciled",
]);

export const fridayCollections = pgTable("friday_collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  fundId: uuid("fund_id").references(() => funds.id),
  date: date("date").notNull(),
  denominations: jsonb("denominations").default({}),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  counter1Id: uuid("counter1_id").references(() => members.id),
  counter2Id: uuid("counter2_id").references(() => members.id),
  verifiedBy: uuid("verified_by").references(() => members.id),
  status: fridayCollectionStatusEnum("status").default("open").notNull(),
  bankDepositRef: text("bank_deposit_ref"),
  depositDate: date("deposit_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// --- BUDGETS ---
export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  fiscalYear: text("fiscal_year").notNull(),
  category: text("category").notNull(),
  fundId: uuid("fund_id").references(() => funds.id),
  allocated: numeric("allocated", { precision: 12, scale: 2 }).default("0").notNull(),
  spent: numeric("spent", { precision: 12, scale: 2 }).default("0").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// --- JOURNAL ENTRIES (Double-Entry) ---
export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  entryNumber: text("entry_number").notNull(),
  debitFundId: uuid("debit_fund_id").references(() => funds.id),
  creditFundId: uuid("credit_fund_id").references(() => funds.id),
  debitAccount: text("debit_account").notNull(),
  creditAccount: text("credit_account").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  narration: text("narration"),
  referenceType: text("reference_type"),
  referenceId: uuid("reference_id"),
  postedBy: uuid("posted_by").references(() => members.id),
  date: date("date").notNull(),
  isLocked: boolean("is_locked").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
