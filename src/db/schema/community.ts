import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  numeric,
  integer,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { members } from "./members";
import { households } from "./households";
import { funds } from "./funds";

// --- QARD HASAN LOANS ---
export const loanPurposeEnum = pgEnum("loan_purpose", [
  "medical",
  "education",
  "marriage",
  "business_startup",
  "emergency",
  "housing_repair",
  "other",
]);

export const loanStatusEnum = pgEnum("loan_status", [
  "application",
  "under_review",
  "recommended",
  "approved",
  "disbursed",
  "repaying",
  "completed",
  "defaulted",
  "waived",
  "rejected",
]);

export const qardHasanLoans = pgTable("qard_hasan_loans", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  borrowerId: uuid("borrower_id").references(() => members.id),
  borrowerName: text("borrower_name").notNull(),
  householdId: uuid("household_id").references(() => households.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  purpose: loanPurposeEnum("purpose").notNull(),
  purposeDetail: text("purpose_detail"),
  guarantor1Id: uuid("guarantor1_id").references(() => members.id),
  guarantor1Name: text("guarantor1_name"),
  guarantor2Id: uuid("guarantor2_id").references(() => members.id),
  guarantor2Name: text("guarantor2_name"),
  repaymentMonths: integer("repayment_months").default(12),
  monthlyInstallment: numeric("monthly_installment", { precision: 10, scale: 2 }),
  totalRepaid: numeric("total_repaid", { precision: 10, scale: 2 }).default("0"),
  outstandingBalance: numeric("outstanding_balance", { precision: 10, scale: 2 }),
  status: loanStatusEnum("status").default("application").notNull(),
  reviewedBy: uuid("reviewed_by").references(() => members.id),
  approvedBy: uuid("approved_by").references(() => members.id),
  disbursedAt: timestamp("disbursed_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  documents: jsonb("documents").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const qardHasanRepayments = pgTable("qard_hasan_repayments", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  loanId: uuid("loan_id").notNull().references(() => qardHasanLoans.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  runningBalance: numeric("running_balance", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"),
  date: date("date").notNull(),
  receiptNumber: text("receipt_number"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- ZAKAT DISTRIBUTIONS ---
export const zakatAsnafEnum = pgEnum("zakat_asnaf", [
  "fuqara",
  "masakin",
  "amil",
  "muallaf",
  "riqab",
  "gharimin",
  "fi_sabilillah",
  "ibn_al_sabil",
]);

export const zakatDistributions = pgTable("zakat_distributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  fundId: uuid("fund_id").references(() => funds.id),
  recipientId: uuid("recipient_id").references(() => members.id),
  recipientName: text("recipient_name").notNull(),
  householdId: uuid("household_id").references(() => households.id),
  asnafCategory: zakatAsnafEnum("asnaf_category").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  fiscalYear: text("fiscal_year").notNull(),
  description: text("description"),
  approvedBy: uuid("approved_by").references(() => members.id),
  disbursedAt: timestamp("disbursed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- BLOOD DONORS ---
export const bloodDonors = pgTable("blood_donors", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  memberId: uuid("member_id").notNull().references(() => members.id),
  bloodGroup: text("blood_group").notNull(),
  lastDonationDate: date("last_donation_date"),
  isAvailable: boolean("is_available").default(true),
  healthStatus: text("health_status"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- PROFESSIONAL DIRECTORY ---
export const professionalDirectory = pgTable("professional_directory", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  memberId: uuid("member_id").notNull().references(() => members.id),
  profession: text("profession").notNull(),
  businessName: text("business_name"),
  specialization: text("specialization"),
  location: text("location"),
  phone: text("phone"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- VOLUNTEER REGISTRY ---
export const volunteerRegistry = pgTable("volunteer_registry", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  memberId: uuid("member_id").notNull().references(() => members.id),
  skills: jsonb("skills").default([]),
  availability: text("availability"),
  interests: jsonb("interests").default([]),
  hoursContributed: integer("hours_contributed").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
