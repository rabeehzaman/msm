"use server";

import { db } from "@/db";
import { subscriptions, funds } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireEntry } from "@/lib/auth/guard";

export async function createFund(formData: FormData) {
  const { tenant } = await requireAdmin();
  await db.insert(funds).values({
    tenantId: tenant.id,
    type: formData.get("type") as typeof funds.$inferInsert.type,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    isRestricted: formData.get("isRestricted") === "true",
  });
  revalidatePath("/finances");
  revalidatePath("/finances/income");
  revalidatePath("/finances/expenses");
  revalidatePath("/finances/zakat");
  revalidatePath("/finances/qard-hasan");
  return { success: true };
}

export async function seedDefaultFunds() {
  const { tenant } = await requireEntry();
  const existing = await db.select().from(funds).where(eq(funds.tenantId, tenant.id)).limit(1);
  if (existing.length > 0) return;

  const defaultFunds = [
    { type: "general" as const, name: "General Fund", isRestricted: false },
    { type: "zakat" as const, name: "Zakat Fund", isRestricted: true },
    { type: "sadaqah" as const, name: "Sadaqah Fund", isRestricted: false },
    { type: "madrasa" as const, name: "Madrasa Fund", isRestricted: false },
    { type: "building" as const, name: "Building Fund", isRestricted: true },
    { type: "death_janazah" as const, name: "Death/Janazah Fund", isRestricted: true },
    { type: "marriage_assistance" as const, name: "Marriage Assistance Fund", isRestricted: true },
    { type: "scholarship" as const, name: "Scholarship Fund", isRestricted: true },
    { type: "qard_hasan" as const, name: "Qard Hasan Fund", isRestricted: true },
    { type: "ramadan_special" as const, name: "Ramadan Special Fund", isRestricted: true },
  ];

  for (const f of defaultFunds) {
    await db.insert(funds).values({ tenantId: tenant.id, ...f });
  }
}

export async function createSubscription(formData: FormData) {
  const { tenant } = await requireEntry();

  await db.insert(subscriptions).values({
    tenantId: tenant.id,
    householdId: formData.get("householdId") as string,
    planName: formData.get("planName") as string,
    amount: formData.get("amount") as string,
    frequency: (formData.get("frequency") as typeof subscriptions.$inferInsert.frequency) || "monthly",
    startDate: formData.get("startDate") as string,
    nextDueDate: formData.get("nextDueDate") as string,
  });

  revalidatePath("/subscriptions");
  return { success: true };
}
