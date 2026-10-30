"use server";

import { db } from "@/db";
import { households, subscriptionPayments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireEntry } from "@/lib/auth/guard";

export async function createHousehold(formData: FormData) {
  const { tenant } = await requireEntry();

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
  await requireAdmin();
  // Deleting would cascade into subscription payments and leave the cash book wrong.
  const [paid] = await db
    .select({ id: subscriptionPayments.id })
    .from(subscriptionPayments)
    .where(eq(subscriptionPayments.householdId, id))
    .limit(1);
  if (paid) throw new Error("This household has subscription payments and cannot be deleted.");
  await db.delete(households).where(eq(households.id, id));
  revalidatePath("/households");
  return { success: true };
}
