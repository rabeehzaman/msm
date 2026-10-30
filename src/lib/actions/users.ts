"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guard";
import { run, text, UserError } from "@/lib/money/action";
import { writeAudit } from "@/lib/money/ledger";

export async function updateAppUser(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const userId = String(formData.get("userId"));
    const roleValue = String(formData.get("role"));
    const role = roleValue === "admin" || roleValue === "entry" || roleValue === "viewer" ? roleValue : null;
    const isActive = formData.get("isActive") === "on";
    const displayName = text(formData.get("displayName"));

    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(appUsers)
        .where(and(eq(appUsers.userId, userId), eq(appUsers.tenantId, actor.tenantId)))
        .limit(1);
      if (!old) throw new UserError("That user no longer exists.");
      if (old.role === "admin" && (role !== "admin" || !isActive)) {
        const [others] = await tx
          .select({ n: sql<number>`count(*)::int` })
          .from(appUsers)
          .where(
            and(
              eq(appUsers.tenantId, actor.tenantId),
              eq(appUsers.role, "admin"),
              eq(appUsers.isActive, true),
              ne(appUsers.userId, userId),
            ),
          );
        if (others.n === 0) throw new UserError("At least one active admin must remain.");
      }
      const [row] = await tx
        .update(appUsers)
        .set({ role, isActive, displayName, updatedAt: new Date() })
        .where(eq(appUsers.userId, userId))
        .returning();
      await writeAudit(tx, actor, "update", "app_users", null, old, row);
    });
    revalidatePath("/settings/users");
  });
}
