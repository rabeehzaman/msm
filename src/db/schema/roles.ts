import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { members } from "./members";

export const systemRoleEnum = pgEnum("system_role", [
  "super_admin",
  "president",
  "secretary",
  "joint_secretary",
  "treasurer",
  "imam",
  "muezzin",
  "madrasa_principal",
  "madrasa_teacher",
  "committee_member",
  "sub_committee_head",
  "auditor",
  "volunteer",
  "family_head",
  "family_member",
]);

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: systemRoleEnum("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  roleId: uuid("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  assignedBy: uuid("assigned_by").references(() => members.id),
});
