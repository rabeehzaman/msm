import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { getCurrentUser, ensureTenant } from "@/lib/queries/auth";
import { hasRole, type Role } from "./access";
import { UserError } from "@/lib/money/action";

export type Actor = { userId: string; name: string; tenantId: string; role: Role };

// The signed-in person's row, or null. Memoised per request.
export const getAppUser = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const [row] = await db.select().from(appUsers).where(eq(appUsers.userId, user.id)).limit(1);
  return row ?? null;
});

// Every server action goes through this: it refuses anyone below the required role.
export async function requireRole(min: Role) {
  const appUser = await getAppUser();
  if (!appUser || !appUser.isActive || !hasRole(appUser.role, min)) {
    throw new UserError("You do not have permission to do this.");
  }
  const tenant = await ensureTenant();
  const actor: Actor = {
    userId: appUser.userId,
    name: appUser.displayName || appUser.email,
    tenantId: tenant.id,
    role: appUser.role!,
  };
  return { tenant, actor };
}

export const requireEntry = () => requireRole("entry");
export const requireAdmin = () => requireRole("admin");
