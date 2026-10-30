import { and, eq } from "drizzle-orm";
import { funds } from "@/db/schema";
import type { Tx } from "./ledger";

// Fund a money entry is credited to or paid from when the screen does not ask.
export async function fundIdByName(tx: Tx, tenantId: string, name: string) {
  const [named] = await tx
    .select({ id: funds.id })
    .from(funds)
    .where(and(eq(funds.tenantId, tenantId), eq(funds.name, name)))
    .limit(1);
  if (named) return named.id;
  const [fallback] = await tx
    .select({ id: funds.id })
    .from(funds)
    .where(and(eq(funds.tenantId, tenantId), eq(funds.type, "general")))
    .limit(1);
  if (fallback) return fallback.id;
  const [created] = await tx
    .insert(funds)
    .values({ tenantId, type: "general", name })
    .onConflictDoNothing()
    .returning({ id: funds.id });
  return created?.id ?? null;
}
