import { db } from "@/db";
import { marriages, marriageNocs, deaths, certificates, welfareApplications, events, announcements, cemeteryPlots, committees, committeeMembers, meetings, households, members, students } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { ensureTenant } from "./auth";

export async function getMarriages() {
  const tenant = await ensureTenant();
  return db.select().from(marriages).where(eq(marriages.tenantId, tenant.id)).orderBy(desc(marriages.createdAt));
}

export async function getDeaths() {
  const tenant = await ensureTenant();
  return db.select().from(deaths).where(eq(deaths.tenantId, tenant.id)).orderBy(desc(deaths.createdAt));
}

export async function getCertificates() {
  const tenant = await ensureTenant();
  return db.select().from(certificates).where(eq(certificates.tenantId, tenant.id)).orderBy(desc(certificates.createdAt));
}

export async function getWelfareApplications() {
  const tenant = await ensureTenant();
  return db.select().from(welfareApplications).where(eq(welfareApplications.tenantId, tenant.id)).orderBy(desc(welfareApplications.createdAt));
}

export async function getEvents() {
  const tenant = await ensureTenant();
  return db.select().from(events).where(eq(events.tenantId, tenant.id)).orderBy(desc(events.date));
}

export async function getAnnouncements() {
  const tenant = await ensureTenant();
  return db.select().from(announcements).where(eq(announcements.tenantId, tenant.id)).orderBy(desc(announcements.createdAt));
}

export async function getCemeteryPlots() {
  const tenant = await ensureTenant();
  return db.select().from(cemeteryPlots).where(eq(cemeteryPlots.tenantId, tenant.id));
}

export async function getCommittees() {
  const tenant = await ensureTenant();
  return db.select().from(committees).where(eq(committees.tenantId, tenant.id));
}

export async function getMeetings() {
  const tenant = await ensureTenant();
  return db.select().from(meetings).where(eq(meetings.tenantId, tenant.id)).orderBy(desc(meetings.date));
}

export async function getDashboardStats() {
  const tenant = await ensureTenant();
  const [householdCount] = await db.select({ count: count() }).from(households).where(eq(households.tenantId, tenant.id));
  const [memberCount] = await db.select({ count: count() }).from(members).where(eq(members.tenantId, tenant.id));
  const [studentCount] = await db.select({ count: count() }).from(students).where(eq(students.tenantId, tenant.id));

  return {
    households: Number(householdCount?.count ?? 0),
    members: Number(memberCount?.count ?? 0),
    students: Number(studentCount?.count ?? 0),
  };
}
