import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { wards } from "./wards";

export const membershipStatusEnum = pgEnum("membership_status", [
  "active",
  "inactive",
  "suspended",
  "transferred",
]);

export const households = pgTable("households", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  houseNumber: text("house_number").notNull(),
  familyName: text("family_name").notNull(),
  wardId: uuid("ward_id").references(() => wards.id),
  address: text("address"),
  locality: text("locality"),
  pincode: text("pincode"),
  gpsLatitude: numeric("gps_latitude"),
  gpsLongitude: numeric("gps_longitude"),
  propertyOwnership: text("property_ownership"),
  rationCardNumber: text("ration_card_number"),
  primaryPhone: text("primary_phone"),
  secondaryPhone: text("secondary_phone"),
  email: text("email"),
  membershipStatus: membershipStatusEnum("membership_status")
    .default("active")
    .notNull(),
  subscriptionPlan: text("subscription_plan"),
  notes: text("notes"),
  customFields: jsonb("custom_fields").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
