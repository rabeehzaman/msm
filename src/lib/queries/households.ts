import { db } from "@/db";
import { households, members, wards } from "@/db/schema";
import { eq, ilike, or, sql, count, desc } from "drizzle-orm";
import { ensureTenant } from "./auth";

export async function getHouseholds(search?: string) {
  const tenant = await ensureTenant();

  const query = db
    .select({
      id: households.id,
      houseNumber: households.houseNumber,
      familyName: households.familyName,
      address: households.address,
      primaryPhone: households.primaryPhone,
      membershipStatus: households.membershipStatus,
      wardName: wards.name,
      wardId: households.wardId,
      createdAt: households.createdAt,
    })
    .from(households)
    .leftJoin(wards, eq(households.wardId, wards.id))
    .where(eq(households.tenantId, tenant.id))
    .orderBy(desc(households.createdAt));

  const result = await query;

  // Get member counts per household
  const memberCounts = await db
    .select({
      householdId: members.householdId,
      count: count(),
    })
    .from(members)
    .where(eq(members.tenantId, tenant.id))
    .groupBy(members.householdId);

  const countMap = new Map(
    memberCounts.map((mc) => [mc.householdId, Number(mc.count)])
  );

  // Get head of household names
  const heads = await db
    .select({
      householdId: members.householdId,
      fullName: members.fullName,
    })
    .from(members)
    .where(eq(members.isHeadOfHousehold, true));

  const headMap = new Map(heads.map((h) => [h.householdId, h.fullName]));

  return result.map((h) => ({
    ...h,
    memberCount: countMap.get(h.id) ?? 0,
    headOfFamily: headMap.get(h.id) ?? "-",
  }));
}

export async function getHouseholdStats() {
  const tenant = await ensureTenant();

  const [totalResult] = await db
    .select({ count: count() })
    .from(households)
    .where(eq(households.tenantId, tenant.id));

  const [activeResult] = await db
    .select({ count: count() })
    .from(households)
    .where(
      sql`${households.tenantId} = ${tenant.id} AND ${households.membershipStatus} = 'active'`
    );

  return {
    total: Number(totalResult?.count ?? 0),
    active: Number(activeResult?.count ?? 0),
  };
}
