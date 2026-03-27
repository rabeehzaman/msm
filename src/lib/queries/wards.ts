import { db } from "@/db";
import { wards, households, members } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { ensureTenant } from "./auth";

export async function getWards() {
  const tenant = await ensureTenant();

  const result = await db
    .select()
    .from(wards)
    .where(eq(wards.tenantId, tenant.id))
    .orderBy(wards.sortOrder);

  // Get household and member counts per ward
  const householdCounts = await db
    .select({
      wardId: households.wardId,
      count: count(),
    })
    .from(households)
    .where(eq(households.tenantId, tenant.id))
    .groupBy(households.wardId);

  const hCountMap = new Map(
    householdCounts.map((hc) => [hc.wardId, Number(hc.count)])
  );

  return result.map((w) => ({
    ...w,
    householdCount: hCountMap.get(w.id) ?? 0,
  }));
}
