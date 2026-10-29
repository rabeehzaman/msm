import { db } from "@/db";
import { bloodDonors, professionalDirectory, members, households, wards } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureTenant } from "./auth";

export async function getBloodDonors() {
  const tenant = await ensureTenant();
  return db
    .select({
      id: bloodDonors.id,
      name: members.fullName,
      ward: wards.name,
      bloodGroup: bloodDonors.bloodGroup,
      phone: bloodDonors.phone,
      lastDonation: bloodDonors.lastDonationDate,
      available: bloodDonors.isAvailable,
    })
    .from(bloodDonors)
    .innerJoin(members, eq(bloodDonors.memberId, members.id))
    .leftJoin(households, eq(members.householdId, households.id))
    .leftJoin(wards, eq(households.wardId, wards.id))
    .where(eq(bloodDonors.tenantId, tenant.id))
    .orderBy(desc(bloodDonors.createdAt));
}

export async function getProfessionals() {
  const tenant = await ensureTenant();
  return db
    .select({
      id: professionalDirectory.id,
      name: members.fullName,
      profession: professionalDirectory.profession,
      specialization: professionalDirectory.specialization,
      business: professionalDirectory.businessName,
      ward: wards.name,
      phone: professionalDirectory.phone,
      available: professionalDirectory.isAvailable,
    })
    .from(professionalDirectory)
    .innerJoin(members, eq(professionalDirectory.memberId, members.id))
    .leftJoin(households, eq(members.householdId, households.id))
    .leftJoin(wards, eq(households.wardId, wards.id))
    .where(eq(professionalDirectory.tenantId, tenant.id))
    .orderBy(desc(professionalDirectory.createdAt));
}
