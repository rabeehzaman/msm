import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { ensureTenant } from "@/lib/queries/auth";
import { ActivityClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const tenant = await ensureTenant();
  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      tableName: auditLogs.tableName,
      who: auditLogs.userAgent,
      createdAt: auditLogs.createdAt,
      oldValue: auditLogs.oldValue,
      newValue: auditLogs.newValue,
    })
    .from(auditLogs)
    .where(eq(auditLogs.tenantId, tenant.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(200);
  return <ActivityClient rows={rows} />;
}
