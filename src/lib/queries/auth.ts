import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

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
        name: "Juma Masjid Mahallu",
        slug: "juma-masjid",
        address: "Near Bus Stand, Kondotty",
        phone: "+91 483 2712345",
        email: "info@jumamasjid.org",
      })
      .returning();
    tenant = newTenant;
  }
  return tenant;
}
