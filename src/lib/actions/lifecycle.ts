"use server";

import { db } from "@/db";
import { marriages, marriageNocs, deaths, certificates, welfareApplications, events, announcements, cemeteryPlots } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureTenant } from "@/lib/queries/auth";

export async function registerMarriage(formData: FormData) {
  const tenant = await ensureTenant();
  await db.insert(marriages).values({
    tenantId: tenant.id,
    brideName: formData.get("brideName") as string,
    groomName: formData.get("groomName") as string,
    brideFatherName: (formData.get("brideFatherName") as string) || null,
    groomFatherName: (formData.get("groomFatherName") as string) || null,
    waliName: (formData.get("waliName") as string) || null,
    witness1Name: (formData.get("witness1Name") as string) || null,
    witness2Name: (formData.get("witness2Name") as string) || null,
    mehrAmount: (formData.get("mehrAmount") as string) || null,
    mehrDeferred: (formData.get("mehrDeferred") as string) || null,
    qaziName: (formData.get("qaziName") as string) || null,
    nikahDate: (formData.get("nikahDate") as string) || null,
    status: "registered",
    certificateNumber: `NK-${new Date().getFullYear()}-${Date.now().toString(36).slice(-3).toUpperCase()}`,
  });
  revalidatePath("/marriages");
  return { success: true };
}

export async function registerDeath(formData: FormData) {
  const tenant = await ensureTenant();
  await db.insert(deaths).values({
    tenantId: tenant.id,
    deceasedName: formData.get("deceasedName") as string,
    dateOfDeath: formData.get("dateOfDeath") as string,
    timeOfDeath: (formData.get("timeOfDeath") as string) || null,
    causeOfDeath: (formData.get("causeOfDeath") as string) || null,
    placeOfDeath: (formData.get("placeOfDeath") as string) || null,
    informerName: (formData.get("informerName") as string) || null,
    janazahTime: (formData.get("janazahTime") as string) || null,
    janazahLocation: (formData.get("janazahLocation") as string) || null,
    certificateNumber: `DC-${new Date().getFullYear()}-${Date.now().toString(36).slice(-3).toUpperCase()}`,
  });
  revalidatePath("/deaths");
  return { success: true };
}

export async function issueCertificate(formData: FormData) {
  const tenant = await ensureTenant();
  await db.insert(certificates).values({
    tenantId: tenant.id,
    type: formData.get("type") as typeof certificates.$inferInsert.type,
    serialNumber: `CERT-${Date.now().toString(36).toUpperCase()}`,
    memberName: formData.get("memberName") as string,
    purpose: (formData.get("purpose") as string) || null,
    status: "requested",
  });
  revalidatePath("/certificates");
  return { success: true };
}

export async function submitWelfareApplication(formData: FormData) {
  const tenant = await ensureTenant();
  await db.insert(welfareApplications).values({
    tenantId: tenant.id,
    applicantName: formData.get("applicantName") as string,
    scheme: formData.get("scheme") as typeof welfareApplications.$inferInsert.scheme,
    amountRequested: (formData.get("amountRequested") as string) || null,
    description: (formData.get("description") as string) || null,
    status: "submitted",
  });
  revalidatePath("/welfare");
  return { success: true };
}

export async function createEvent(formData: FormData) {
  const tenant = await ensureTenant();
  await db.insert(events).values({
    tenantId: tenant.id,
    title: formData.get("title") as string,
    type: formData.get("type") as string,
    description: (formData.get("description") as string) || null,
    date: formData.get("date") as string,
    venue: (formData.get("venue") as string) || null,
    status: "scheduled",
  });
  revalidatePath("/events");
  return { success: true };
}

export async function createAnnouncement(formData: FormData) {
  const tenant = await ensureTenant();
  await db.insert(announcements).values({
    tenantId: tenant.id,
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    category: (formData.get("category") as string) || null,
    isPublished: true,
    publishedAt: new Date(),
  });
  revalidatePath("/announcements");
  return { success: true };
}
