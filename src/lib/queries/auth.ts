import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { tenants } from "@/db/schema";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getDefaultTenant() {
  const result = await db.select().from(tenants).limit(1);
  return result[0] ?? null;
}

export async function ensureTenant() {
  let tenant = await getDefaultTenant();
  if (!tenant) {
    const [newTenant] = await db
      .insert(tenants)
      .values({
        name: "My Mahallu",
        slug: "mahallu",
      })
      .returning();
    tenant = newTenant;
  }
  return tenant;
}
