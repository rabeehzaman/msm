import { db } from "@/db";
import { students, studentAttendance, exams, examResults, hifzProgress, classes, teachers, subjects } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { ensureTenant } from "./auth";

export async function getStudents() {
  const tenant = await ensureTenant();
  return db
    .select({
      id: students.id,
      fullName: students.fullName,
      dateOfBirth: students.dateOfBirth,
      parentPhone: students.parentPhone,
      status: students.status,
      admissionDate: students.admissionDate,
      classId: students.classId,
      className: classes.name,
      classLevel: classes.level,
    })
    .from(students)
    .leftJoin(classes, eq(students.classId, classes.id))
    .where(eq(students.tenantId, tenant.id))
    .orderBy(desc(students.createdAt));
}

export async function getClasses() {
  const tenant = await ensureTenant();
  const result = await db.select().from(classes).where(eq(classes.tenantId, tenant.id)).orderBy(classes.level);

  const studentCounts = await db
    .select({ classId: students.classId, count: count() })
    .from(students)
    .where(eq(students.tenantId, tenant.id))
    .groupBy(students.classId);

  const countMap = new Map(studentCounts.map(sc => [sc.classId, Number(sc.count)]));

  return result.map(c => ({ ...c, studentCount: countMap.get(c.id) ?? 0 }));
}

export async function getTeachers() {
  const tenant = await ensureTenant();
  return db.select().from(teachers).where(eq(teachers.tenantId, tenant.id));
}

export async function getExams() {
  const tenant = await ensureTenant();
  return db
    .select({
      id: exams.id,
      name: exams.name,
      type: exams.type,
      date: exams.date,
      maxMarks: exams.maxMarks,
      className: classes.name,
    })
    .from(exams)
    .leftJoin(classes, eq(exams.classId, classes.id))
    .where(eq(exams.tenantId, tenant.id))
    .orderBy(desc(exams.date));
}

export async function getStudentsByClass(classId: string) {
  const tenant = await ensureTenant();
  return db
    .select()
    .from(students)
    .where(eq(students.classId, classId))
    .orderBy(students.fullName);
}

export async function getMadrasaStats() {
  const tenant = await ensureTenant();

  const [studentCount] = await db.select({ count: count() }).from(students).where(eq(students.tenantId, tenant.id));
  const [teacherCount] = await db.select({ count: count() }).from(teachers).where(eq(teachers.tenantId, tenant.id));
  const [classCount] = await db.select({ count: count() }).from(classes).where(eq(classes.tenantId, tenant.id));

  return {
    students: Number(studentCount?.count ?? 0),
    teachers: Number(teacherCount?.count ?? 0),
    classes: Number(classCount?.count ?? 0),
  };
}
