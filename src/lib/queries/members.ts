import { db } from "@/db";
import { members, households } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { ensureTenant } from "./auth";

export async function getMembers() {
  const tenant = await ensureTenant();

  const result = await db
    .select({
      id: members.id,
      fullName: members.fullName,
      gender: members.gender,
      dateOfBirth: members.dateOfBirth,
      phone: members.phone,
      bloodGroup: members.bloodGroup,
      occupation: members.occupation,
      status: members.status,
      relationshipToHead: members.relationshipToHead,
      isHeadOfHousehold: members.isHeadOfHousehold,
      householdId: members.householdId,
      houseNumber: households.houseNumber,
      familyName: households.familyName,
    })
    .from(members)
    .leftJoin(households, eq(members.householdId, households.id))
    .where(eq(members.tenantId, tenant.id))
    .orderBy(desc(members.createdAt));

  return result;
}

export async function getMemberStats() {
  const tenant = await ensureTenant();

  const [total] = await db
    .select({ count: count() })
    .from(members)
    .where(eq(members.tenantId, tenant.id));

  return {
    total: Number(total?.count ?? 0),
  };
}
