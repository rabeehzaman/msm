"use server";

import { db } from "@/db";
import { wards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireEntry } from "@/lib/auth/guard";

export async function createWard(formData: FormData) {
  const { tenant } = await requireEntry();

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
  await requireAdmin();
  await db.delete(wards).where(eq(wards.id, id));
  revalidatePath("/wards");
  return { success: true };
}
