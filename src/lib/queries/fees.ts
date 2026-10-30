import { and, asc, desc, eq, gte, lte, inArray } from "drizzle-orm";
import { db } from "@/db";
import { cashAccounts, classes, feePayments, feeStructures, studentAttendance, students } from "@/db/schema";
import { monthEnd, monthStart } from "@/lib/format";
import { feeApplies, feePending, LEFT_STATUSES } from "@/lib/madrasa/fees";
import { ensureTenant } from "./auth";

export async function getFeeTypes() {
  const tenant = await ensureTenant();
  return db
    .select({
      id: feeStructures.id,
      feeType: feeStructures.feeType,
      amount: feeStructures.amount,
      frequency: feeStructures.frequency,
      classId: feeStructures.classId,
      className: classes.name,
      createdAt: feeStructures.createdAt,
    })
    .from(feeStructures)
    .leftJoin(classes, eq(feeStructures.classId, classes.id))
    .where(eq(feeStructures.tenantId, tenant.id))
    .orderBy(asc(feeStructures.feeType));
}

export async function getFeePayments(limit = 500) {
  const tenant = await ensureTenant();
  return db
    .select({
      id: feePayments.id,
      studentId: feePayments.studentId,
      studentName: students.fullName,
      feeStructureId: feePayments.feeStructureId,
      feeType: feeStructures.feeType,
      amount: feePayments.amount,
      waiverAmount: feePayments.waiverAmount,
      date: feePayments.date,
      receiptNumber: feePayments.receiptNumber,
      accountName: cashAccounts.name,
    })
    .from(feePayments)
    .innerJoin(students, eq(feePayments.studentId, students.id))
    .leftJoin(feeStructures, eq(feePayments.feeStructureId, feeStructures.id))
    .leftJoin(cashAccounts, eq(feePayments.accountId, cashAccounts.id))
    .where(eq(feePayments.tenantId, tenant.id))
    .orderBy(desc(feePayments.date), desc(feePayments.createdAt))
    .limit(limit);
}

// Per student and fee type: everything still owed, for the pending list.
export async function getPendingFees() {
  const tenant = await ensureTenant();
  const [fees, people, payments] = await Promise.all([
    getFeeTypes(),
    db
      .select({
        id: students.id,
        fullName: students.fullName,
        admissionNumber: students.admissionNumber,
        classId: students.classId,
        className: classes.name,
        admissionDate: students.admissionDate,
        status: students.status,
      })
      .from(students)
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(eq(students.tenantId, tenant.id))
      .orderBy(asc(students.fullName)),
    getFeePayments(100000),
  ]);
  const rows = [];
  for (const student of people) {
    if (LEFT_STATUSES.includes(student.status)) continue;
    for (const fee of fees) {
      if (!feeApplies(fee, student)) continue;
      const paid = payments
        .filter((p) => p.studentId === student.id && p.feeStructureId === fee.id)
        .reduce((s, p) => s + Number(p.amount) + Number(p.waiverAmount), 0);
      const pending = feePending(fee, student, paid);
      if (pending > 0) {
        rows.push({
          studentId: student.id,
          studentName: student.fullName,
          admissionNumber: student.admissionNumber,
          className: student.className,
          feeStructureId: fee.id,
          feeType: fee.feeType,
          pending,
        });
      }
    }
  }
  return rows;
}

export async function getClassRegister(classId: string, date: string) {
  const tenant = await ensureTenant();
  const people = await db
    .select({ id: students.id, fullName: students.fullName, admissionNumber: students.admissionNumber, status: students.status })
    .from(students)
    .where(and(eq(students.tenantId, tenant.id), eq(students.classId, classId)))
    .orderBy(asc(students.fullName));
  const active = people.filter((s) => !LEFT_STATUSES.includes(s.status));
  if (active.length === 0) return { students: [], saved: false, absent: [] as string[] };
  const marks = await db
    .select({ studentId: studentAttendance.studentId, status: studentAttendance.status })
    .from(studentAttendance)
    .where(
      and(
        eq(studentAttendance.date, date),
        inArray(studentAttendance.studentId, active.map((s) => s.id)),
      ),
    );
  return {
    students: active,
    saved: marks.length > 0,
    absent: marks.filter((m) => m.status === "absent").map((m) => m.studentId),
  };
}

export async function getMonthlyAttendance(classId: string, year: number, month: number) {
  const tenant = await ensureTenant();
  const people = await db
    .select({ id: students.id, fullName: students.fullName, admissionNumber: students.admissionNumber })
    .from(students)
    .where(and(eq(students.tenantId, tenant.id), eq(students.classId, classId)))
    .orderBy(asc(students.fullName));
  const marks = await db
    .select({ studentId: studentAttendance.studentId, date: studentAttendance.date, status: studentAttendance.status })
    .from(studentAttendance)
    .where(
      and(
        eq(studentAttendance.tenantId, tenant.id),
        eq(studentAttendance.classId, classId),
        gte(studentAttendance.date, monthStart(year, month)),
        lte(studentAttendance.date, monthEnd(year, month)),
      ),
    );
  const totalDays = new Set(marks.map((m) => m.date)).size;
  return {
    totalDays,
    rows: people.map((s) => {
      const own = marks.filter((m) => m.studentId === s.id);
      const present = own.filter((m) => m.status !== "absent").length;
      return { ...s, present, marked: own.length, percent: own.length ? Math.round((present / own.length) * 1000) / 10 : null };
    }),
  };
}
