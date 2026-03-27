"use server";

import { db } from "@/db";
import { incomeEntries, expenseEntries, subscriptions, subscriptionPayments, fridayCollections, funds } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureTenant } from "@/lib/queries/auth";

export async function createFund(formData: FormData) {
  const tenant = await ensureTenant();
  await db.insert(funds).values({
    tenantId: tenant.id,
    type: formData.get("type") as typeof funds.$inferInsert.type,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    isRestricted: formData.get("isRestricted") === "true",
  });
  revalidatePath("/finances");
  return { success: true };
}

export async function seedDefaultFunds() {
  const tenant = await ensureTenant();
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

export async function createIncomeEntry(formData: FormData) {
  const tenant = await ensureTenant();
  const receiptNo = `REC-${Date.now().toString(36).toUpperCase()}`;

  await db.insert(incomeEntries).values({
    tenantId: tenant.id,
    fundId: formData.get("fundId") as string,
    receiptNumber: receiptNo,
    amount: formData.get("amount") as string,
    donorName: (formData.get("donorName") as string) || null,
    category: formData.get("category") as string,
    description: (formData.get("description") as string) || null,
    paymentMethod: (formData.get("paymentMethod") as typeof incomeEntries.$inferInsert.paymentMethod) || "cash",
    referenceNumber: (formData.get("referenceNumber") as string) || null,
    isAnonymous: formData.get("isAnonymous") === "on",
    date: formData.get("date") as string,
  });

  revalidatePath("/finances");
  revalidatePath("/finances/income");
  return { success: true };
}

export async function createExpenseEntry(formData: FormData) {
  const tenant = await ensureTenant();
  const voucherNo = `EXP-${Date.now().toString(36).toUpperCase()}`;

  await db.insert(expenseEntries).values({
    tenantId: tenant.id,
    fundId: formData.get("fundId") as string,
    voucherNumber: voucherNo,
    amount: formData.get("amount") as string,
    payee: formData.get("payee") as string,
    category: formData.get("category") as string,
    description: (formData.get("description") as string) || null,
    paymentMethod: (formData.get("paymentMethod") as typeof expenseEntries.$inferInsert.paymentMethod) || "cash",
    referenceNumber: (formData.get("referenceNumber") as string) || null,
    status: "pending_approval",
    date: formData.get("date") as string,
  });

  revalidatePath("/finances");
  revalidatePath("/finances/expenses");
  return { success: true };
}

export async function createFridayCollection(formData: FormData) {
  const tenant = await ensureTenant();

  await db.insert(fridayCollections).values({
    tenantId: tenant.id,
    date: formData.get("date") as string,
    totalAmount: formData.get("totalAmount") as string,
    status: "pending_verification",
    notes: (formData.get("notes") as string) || null,
  });

  revalidatePath("/finances/friday-collections");
  return { success: true };
}

export async function createSubscription(formData: FormData) {
  const tenant = await ensureTenant();

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

export async function recordSubscriptionPayment(formData: FormData) {
  const tenant = await ensureTenant();

  await db.insert(subscriptionPayments).values({
    tenantId: tenant.id,
    subscriptionId: formData.get("subscriptionId") as string,
    householdId: formData.get("householdId") as string,
    amount: formData.get("amount") as string,
    paymentMethod: (formData.get("paymentMethod") as typeof subscriptionPayments.$inferInsert.paymentMethod) || "cash",
    period: (formData.get("period") as string) || null,
    date: formData.get("date") as string,
    receiptNumber: `SUB-${Date.now().toString(36).toUpperCase()}`,
  });

  revalidatePath("/subscriptions");
  return { success: true };
}
