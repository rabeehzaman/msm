import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  jsonb,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { households } from "./households";

export const memberStatusEnum = pgEnum("member_status", [
  "active",
  "inactive",
  "nri",
  "deceased",
  "transferred_out",
  "transferred_in",
  "banned",
  "suspended",
]);

export const genderEnum = pgEnum("gender", ["male", "female"]);

export const maritalStatusEnum = pgEnum("marital_status", [
  "single",
  "married",
  "divorced",
  "widowed",
]);

export const relationshipEnum = pgEnum("relationship_to_head", [
  "head",
  "spouse",
  "son",
  "daughter",
  "father",
  "mother",
  "brother",
  "sister",
  "grandson",
  "granddaughter",
  "daughter_in_law",
  "son_in_law",
  "other",
]);

export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  authUserId: uuid("auth_user_id"),

  // Personal info
  fullName: text("full_name").notNull(),
  fullNameMl: text("full_name_ml"),
  dateOfBirth: date("date_of_birth"),
  gender: genderEnum("gender"),
  maritalStatus: maritalStatusEnum("marital_status"),
  relationshipToHead: relationshipEnum("relationship_to_head")
    .default("head")
    .notNull(),

  // Contact
  phone: text("phone"),
  email: text("email"),
  whatsappNumber: text("whatsapp_number"),

  // Identity
  aadhaarNumber: text("aadhaar_number"),
  photoUrl: text("photo_url"),

  // Education & Employment
  educationQualification: text("education_qualification"),
  religiousQualification: text("religious_qualification"),
  occupation: text("occupation"),
  employer: text("employer"),
  monthlyIncomeRange: text("monthly_income_range"),

  // Health
  bloodGroup: text("blood_group"),
  healthConditions: text("health_conditions"),
  isDonorAvailable: boolean("is_donor_available").default(false),

  // Passport (for NRI tracking)
  passportNumber: text("passport_number"),
  passportExpiry: date("passport_expiry"),

  // Status & Flags
  status: memberStatusEnum("status").default("active").notNull(),
  isOrphan: boolean("is_orphan").default(false),
  isWidow: boolean("is_widow").default(false),
  isBpl: boolean("is_bpl").default(false),
  isSeniorCitizen: boolean("is_senior_citizen").default(false),
  isDifferentlyAbled: boolean("is_differently_abled").default(false),
  isMuallaf: boolean("is_muallaf").default(false),
  isHeadOfHousehold: boolean("is_head_of_household").default(false),

  // Voting
  hasVotingRight: boolean("has_voting_right").default(false),

  customFields: jsonb("custom_fields").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
