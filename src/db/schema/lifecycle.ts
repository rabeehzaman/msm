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

// --- MARRIAGES ---
export const marriageStatusEnum = pgEnum("marriage_status", [
  "application",
  "under_review",
  "approved",
  "registered",
  "rejected",
]);

export const marriages = pgTable("marriages", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  brideId: uuid("bride_id").references(() => members.id),
  brideName: text("bride_name").notNull(),
  brideFatherName: text("bride_father_name"),
  brideDob: date("bride_dob"),
  brideAddress: text("bride_address"),
  groomId: uuid("groom_id").references(() => members.id),
  groomName: text("groom_name").notNull(),
  groomFatherName: text("groom_father_name"),
  groomDob: date("groom_dob"),
  groomAddress: text("groom_address"),
  groomOccupation: text("groom_occupation"),
  waliName: text("wali_name"),
  waliRelation: text("wali_relation"),
  waliId: uuid("wali_id").references(() => members.id),
  witness1Name: text("witness1_name"),
  witness2Name: text("witness2_name"),
  mehrAmount: numeric("mehr_amount", { precision: 12, scale: 2 }),
  mehrType: text("mehr_type"),
  mehrDeferred: numeric("mehr_deferred", { precision: 12, scale: 2 }),
  qaziName: text("qazi_name"),
  nikahDate: date("nikah_date"),
  certificateNumber: text("certificate_number"),
  status: marriageStatusEnum("status").default("application").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- MARRIAGE NOCs ---
export const nocTypeEnum = pgEnum("noc_type", ["incoming", "outgoing"]);
export const nocStatusEnum = pgEnum("noc_status", ["pending", "verified", "approved", "issued", "rejected"]);

export const marriageNocs = pgTable("marriage_nocs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  applicantId: uuid("applicant_id").references(() => members.id),
  applicantName: text("applicant_name").notNull(),
  householdId: uuid("household_id").references(() => households.id),
  type: nocTypeEnum("type").notNull(),
  otherMahalluName: text("other_mahallu_name"),
  reason: text("reason"),
  status: nocStatusEnum("status").default("pending").notNull(),
  verifiedBy: uuid("verified_by").references(() => members.id),
  approvedBy: uuid("approved_by").references(() => members.id),
  serialNumber: text("serial_number"),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- DEATHS ---
export const deaths = pgTable("deaths", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  memberId: uuid("member_id").references(() => members.id),
  deceasedName: text("deceased_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  dateOfDeath: date("date_of_death").notNull(),
  timeOfDeath: text("time_of_death"),
  causeOfDeath: text("cause_of_death"),
  placeOfDeath: text("place_of_death"),
  informerName: text("informer_name"),
  informerRelation: text("informer_relation"),
  burialPlotId: uuid("burial_plot_id"), // FK to cemetery_plots enforced at app level (circular ref)
  burialDate: date("burial_date"),
  janazahTime: text("janazah_time"),
  janazahLocation: text("janazah_location"),
  imamId: uuid("imam_id").references(() => members.id),
  ghuslTeam: jsonb("ghusl_team").default([]),
  certificateNumber: text("certificate_number"),
  khairatReleased: boolean("khairat_released").default(false),
  expenseTotal: numeric("expense_total", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- CEMETERY PLOTS ---
export const plotStatusEnum = pgEnum("plot_status", ["available", "occupied", "reserved", "maintenance"]);

export const cemeteryPlots = pgTable("cemetery_plots", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  section: text("section").notNull(),
  row: text("row").notNull(),
  plotNumber: text("plot_number").notNull(),
  gpsLatitude: numeric("gps_latitude"),
  gpsLongitude: numeric("gps_longitude"),
  status: plotStatusEnum("status").default("available").notNull(),
  occupantDeathId: uuid("occupant_death_id"), // FK to deaths enforced at app level (circular ref)
  occupantName: text("occupant_name"),
  burialDate: date("burial_date"),
  reservedForId: uuid("reserved_for_id").references(() => members.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- CERTIFICATES ---
export const certificateTypeEnum = pgEnum("certificate_type", [
  "nikah",
  "death",
  "character",
  "noc",
  "property",
  "transfer",
  "membership",
  "madrasa_completion",
  "hifz_completion",
  "clearance",
  "divorce",
]);

export const certificateStatusEnum = pgEnum("certificate_status", [
  "requested",
  "under_review",
  "dues_check",
  "generated",
  "signed",
  "delivered",
  "rejected",
]);

export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  type: certificateTypeEnum("type").notNull(),
  serialNumber: text("serial_number").notNull(),
  memberId: uuid("member_id").references(() => members.id),
  memberName: text("member_name").notNull(),
  householdId: uuid("household_id").references(() => households.id),
  purpose: text("purpose"),
  status: certificateStatusEnum("status").default("requested").notNull(),
  issuedBy: uuid("issued_by").references(() => members.id),
  signedBy: uuid("signed_by").references(() => members.id),
  counterSignedBy: uuid("counter_signed_by").references(() => members.id),
  pdfUrl: text("pdf_url"),
  qrCode: text("qr_code"),
  duesClearanceStatus: boolean("dues_clearance_status"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow(),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- WELFARE APPLICATIONS ---
export const welfareSchemeEnum = pgEnum("welfare_scheme", [
  "medical_aid",
  "education_scholarship",
  "marriage_assistance",
  "orphan_sponsorship",
  "widow_pension",
  "housing_support",
  "livelihood_support",
  "gulf_returnee",
  "emergency_relief",
]);

export const welfareStatusEnum = pgEnum("welfare_status", [
  "submitted",
  "under_review",
  "investigation",
  "recommended",
  "approved",
  "disbursed",
  "rejected",
  "follow_up",
]);

export const welfareApplications = pgTable("welfare_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  applicantId: uuid("applicant_id").references(() => members.id),
  applicantName: text("applicant_name").notNull(),
  householdId: uuid("household_id").references(() => households.id),
  scheme: welfareSchemeEnum("scheme").notNull(),
  amountRequested: numeric("amount_requested", { precision: 10, scale: 2 }),
  amountApproved: numeric("amount_approved", { precision: 10, scale: 2 }),
  amountDisbursed: numeric("amount_disbursed", { precision: 10, scale: 2 }),
  description: text("description"),
  status: welfareStatusEnum("status").default("submitted").notNull(),
  reviewedBy: uuid("reviewed_by").references(() => members.id),
  approvedBy: uuid("approved_by").references(() => members.id),
  documents: jsonb("documents").default([]),
  followUpNotes: text("follow_up_notes"),
  disbursedAt: timestamp("disbursed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- EVENTS ---
export const eventStatusEnum = pgEnum("event_status", ["draft", "scheduled", "ongoing", "completed", "cancelled"]);

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  endDate: date("end_date"),
  venue: text("venue"),
  budgetEstimate: numeric("budget_estimate", { precision: 10, scale: 2 }),
  actualExpense: numeric("actual_expense", { precision: 10, scale: 2 }),
  targetAudience: text("target_audience"),
  status: eventStatusEnum("status").default("draft").notNull(),
  coordinatorId: uuid("coordinator_id").references(() => members.id),
  registrationCount: integer("registration_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- ANNOUNCEMENTS ---
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  category: text("category"),
  targetAudience: jsonb("target_audience").default({}),
  channels: jsonb("channels").default([]),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => members.id),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- GOVERNANCE ---
export const committees = pgTable("committees", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  termStart: date("term_start"),
  termEnd: date("term_end"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const committeeMembers = pgTable("committee_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  committeeId: uuid("committee_id").notNull().references(() => committees.id, { onDelete: "cascade" }),
  memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  date: date("date").notNull(),
  agenda: text("agenda"),
  minutes: text("minutes"),
  minutesLocked: boolean("minutes_locked").default(false),
  attendees: jsonb("attendees").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
