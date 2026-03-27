"use server";

import { db } from "@/db";
import { households } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureTenant } from "@/lib/queries/auth";

export async function createHousehold(formData: FormData) {
  const tenant = await ensureTenant();

  await db.insert(households).values({
    tenantId: tenant.id,
    houseNumber: formData.get("houseNumber") as string,
    familyName: formData.get("familyName") as string,
    wardId: (formData.get("wardId") as string) || null,
    address: (formData.get("address") as string) || null,
    locality: (formData.get("locality") as string) || null,
    pincode: (formData.get("pincode") as string) || null,
    primaryPhone: (formData.get("primaryPhone") as string) || null,
    email: (formData.get("email") as string) || null,
    propertyOwnership: (formData.get("propertyOwnership") as string) || null,
    rationCardNumber: (formData.get("rationCardNumber") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });

  revalidatePath("/households");
  return { success: true };
}

export async function deleteHousehold(id: string) {
  await db.delete(households).where(eq(households.id, id));
  revalidatePath("/households");
  return { success: true };
}
