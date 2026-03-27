"use server";

import { db } from "@/db";
import { wards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureTenant } from "@/lib/queries/auth";

export async function createWard(formData: FormData) {
  const tenant = await ensureTenant();

  await db.insert(wards).values({
    tenantId: tenant.id,
    name: formData.get("name") as string,
    code: (formData.get("code") as string) || null,
    description: (formData.get("description") as string) || null,
  });

  revalidatePath("/wards");
  return { success: true };
}

export async function deleteWard(id: string) {
  await db.delete(wards).where(eq(wards.id, id));
  revalidatePath("/wards");
  return { success: true };
}
