"use server";

import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureTenant } from "@/lib/queries/auth";

export async function createMember(formData: FormData) {
  const tenant = await ensureTenant();

  await db.insert(members).values({
    tenantId: tenant.id,
    householdId: formData.get("householdId") as string,
    fullName: formData.get("fullName") as string,
    gender: (formData.get("gender") as "male" | "female") || null,
    dateOfBirth: (formData.get("dateOfBirth") as string) || null,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    relationshipToHead: (formData.get("relationshipToHead") as string) as typeof members.$inferInsert.relationshipToHead || "head",
    maritalStatus: (formData.get("maritalStatus") as string) as typeof members.$inferInsert.maritalStatus || null,
    bloodGroup: (formData.get("bloodGroup") as string) || null,
    occupation: (formData.get("occupation") as string) || null,
    educationQualification: (formData.get("educationQualification") as string) || null,
    isHeadOfHousehold: formData.get("isHeadOfHousehold") === "true",
  });

  revalidatePath("/members");
  revalidatePath("/households");
  return { success: true };
}

export async function deleteMember(id: string) {
  await db.delete(members).where(eq(members.id, id));
  revalidatePath("/members");
  revalidatePath("/households");
  return { success: true };
}
