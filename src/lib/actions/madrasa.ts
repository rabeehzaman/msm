"use server";

import { db } from "@/db";
import { students, studentAttendance, exams, examResults, hifzProgress, classes, teachers, subjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureTenant } from "@/lib/queries/auth";

export async function createStudent(formData: FormData) {
  const tenant = await ensureTenant();
  await db.insert(students).values({
    tenantId: tenant.id,
    fullName: formData.get("fullName") as string,
    classId: (formData.get("classId") as string) || null,
    dateOfBirth: (formData.get("dateOfBirth") as string) || null,
    parentPhone: (formData.get("parentPhone") as string) || null,
    admissionDate: new Date().toISOString().split("T")[0],
    status: "active",
  });
  revalidatePath("/madrasa/students");
  revalidatePath("/madrasa");
  return { success: true };
}

export async function deleteStudent(id: string) {
  await db.delete(students).where(eq(students.id, id));
  revalidatePath("/madrasa/students");
  return { success: true };
}

export async function saveAttendance(records: { studentId: string; classId: string; date: string; status: "present" | "absent" | "late" | "excused" }[]) {
  const tenant = await ensureTenant();
  for (const r of records) {
    await db.insert(studentAttendance).values({
      tenantId: tenant.id,
      studentId: r.studentId,
      classId: r.classId,
      date: r.date,
      status: r.status,
    });
  }
  revalidatePath("/madrasa/attendance");
  return { success: true };
}

export async function createExam(formData: FormData) {
  const tenant = await ensureTenant();
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
  const tenant = await ensureTenant();
  await db.insert(classes).values({
    tenantId: tenant.id,
    name: formData.get("name") as string,
    level: parseInt(formData.get("level") as string) || 1,
    section: (formData.get("section") as string) || null,
    room: (formData.get("room") as string) || null,
    capacity: parseInt(formData.get("capacity") as string) || 40,
  });
  revalidatePath("/madrasa");
  return { success: true };
}

export async function createTeacher(formData: FormData) {
  const tenant = await ensureTenant();
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
