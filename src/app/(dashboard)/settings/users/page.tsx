import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { ensureTenant } from "@/lib/queries/auth";
import { UsersClient } from "./client";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const tenant = await ensureTenant();
  const users = await db.select().from(appUsers).where(eq(appUsers.tenantId, tenant.id)).orderBy(desc(appUsers.createdAt));
  return <UsersClient users={users} />;
}
