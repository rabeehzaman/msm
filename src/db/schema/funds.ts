import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const fundTypeEnum = pgEnum("fund_type", [
  "general",
  "zakat",
  "sadaqah",
  "fitrah",
  "waqf",
  "building",
  "madrasa",
  "marriage_assistance",
  "death_janazah",
  "qard_hasan",
  "scholarship",
  "medical_emergency",
  "ramadan_special",
  "bait_ul_maal",
]);

export const funds = pgTable("funds", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  type: fundTypeEnum("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  balance: numeric("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  isRestricted: boolean("is_restricted").default(false).notNull(),
  rules: jsonb("rules").default({}),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
