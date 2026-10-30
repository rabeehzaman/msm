"use server";

import { db } from "@/db";
import { exams, classes, teachers } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { requireEntry } from "@/lib/auth/guard";

export async function createExam(formData: FormData) {
  const { tenant } = await requireEntry();
  await db.insert(exams).values({
    tenantId: tenant.id,
    name: formData.get("name") as string,
    classId: (formData.get("classId") as string) || null,
    subjectId: (formData.get("subjectId") as string) || null,
    type: (formData.get("type") as typeof exams.$inferInsert.type) || "monthly_test",
    date: formData.get("date") as string,
    maxMarks: parseInt(formData.get("maxMarks") as string) || 100,
  });
  revalidatePath("/madrasa/exams");
  return { success: true };
}

export async function createClass(formData: FormData) {
  const { tenant } = await requireEntry();
  await db.insert(classes).values({
    tenantId: tenant.id,
    name: formData.get("name") as string,
    level: parseInt(formData.get("level") as string) || 1,
    section: (formData.get("section") as string) || null,
    room: (formData.get("room") as string) || null,
    capacity: parseInt(formData.get("capacity") as string) || 40,
  });
  revalidatePath("/madrasa");
  revalidatePath("/madrasa/classes");
  revalidatePath("/madrasa/students");
  revalidatePath("/madrasa/attendance");
  revalidatePath("/madrasa/exams");
  return { success: true };
}

export async function createTeacher(formData: FormData) {
  const { tenant } = await requireEntry();
  await db.insert(teachers).values({
    tenantId: tenant.id,
    fullName: formData.get("fullName") as string,
    phone: (formData.get("phone") as string) || null,
    qualifications: (formData.get("qualifications") as string) || null,
    salary: (formData.get("salary") as string) || null,
  });
  revalidatePath("/madrasa");
  return { success: true };
}
