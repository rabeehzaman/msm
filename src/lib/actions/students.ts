"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { feePayments, feeStructures, studentAttendance, students } from "@/db/schema";
import { requireAdmin, requireEntry } from "@/lib/auth/guard";
import { todayIST } from "@/lib/format";
import {
  parseAmount, parseDate, parseId, parseOptionalDate, requiredText, run, text, UserError,
} from "@/lib/money/action";
import { fundIdByName } from "@/lib/money/funds";
import { nextReceiptNumber, postLedger, removeLedger, writeAudit } from "@/lib/money/ledger";

function refresh() {
  revalidatePath("/madrasa", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/cash-bank");
}

export async function saveStudent(formData: FormData) {
  return run(async () => {
    const id = text(formData.get("id"));
    const { actor } = await (id ? requireAdmin() : requireEntry());
    const photoPath = text(formData.get("photoPath"));
    const gender = formData.get("gender");
    const values = {
      fullName: requiredText(formData.get("fullName"), "Name"),
      admissionNumber: text(formData.get("admissionNumber")),
      classId: text(formData.get("classId")),
      dateOfBirth: parseOptionalDate(formData.get("dateOfBirth")),
      gender: gender === "male" || gender === "female" ? gender : null,
      guardianName: text(formData.get("guardianName")),
      parentPhone: text(formData.get("parentPhone")),
      houseAddress: text(formData.get("houseAddress")),
      admissionDate: parseOptionalDate(formData.get("admissionDate")) ?? todayIST(),
      status: (formData.get("status") === "withdrawn" ? "withdrawn" : "active") as "active" | "withdrawn",
    };
    await db.transaction(async (tx) => {
      if (id) {
        const [old] = await tx.select().from(students).where(and(eq(students.id, id), eq(students.tenantId, actor.tenantId))).for("update").limit(1);
        if (!old) throw new UserError("That student no longer exists.");
        const [row] = await tx
          .update(students)
          .set({ ...values, photoPath: photoPath ?? old.photoPath, updatedAt: new Date() })
          .where(eq(students.id, id))
          .returning();
        await writeAudit(tx, actor, "update", "students", id, old, row);
      } else {
        const [row] = await tx.insert(students).values({ ...values, photoPath, tenantId: actor.tenantId }).returning();
        await writeAudit(tx, actor, "create", "students", row.id, null, row);
      }
    });
    refresh();
  });
}

export async function deleteStudent(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx.select().from(students).where(and(eq(students.id, id), eq(students.tenantId, actor.tenantId))).for("update").limit(1);
      if (!old) throw new UserError("That student no longer exists.");
      // Deleting would cascade into fee payments and leave the cash book wrong.
      const [paid] = await tx
        .select({ n: sql<number>`count(*)::int` })
        .from(feePayments)
        .where(eq(feePayments.studentId, id));
      if (paid.n > 0) throw new UserError("This student has fee payments. Mark them as Left instead of deleting.");
      await tx.delete(students).where(eq(students.id, id));
      await writeAudit(tx, actor, "delete", "students", id, old, null);
    });
    refresh();
  });
}

// Everyone is Present unless listed as Absent. Saving again replaces the day's marks.
export async function saveRegister(classId: string, date: string, absentIds: string[]) {
  return run(async () => {
    const { actor } = await requireEntry();
    const day = parseDate(date);
    const id = parseId(classId, "a class");
    const people = await db
      .select({ id: students.id, status: students.status })
      .from(students)
      .where(and(eq(students.tenantId, actor.tenantId), eq(students.classId, id), eq(students.status, "active")));
    if (people.length === 0) throw new UserError("This class has no students.");
    const absent = new Set(absentIds);
    await db.transaction(async (tx) => {
      await tx
        .insert(studentAttendance)
        .values(
          people.map((s) => ({
            tenantId: actor.tenantId,
            studentId: s.id,
            classId: id,
            date: day,
            status: absent.has(s.id) ? ("absent" as const) : ("present" as const),
          })),
        )
        .onConflictDoUpdate({
          target: [studentAttendance.studentId, studentAttendance.date],
          set: { status: sql`excluded.status`, classId: id },
        });
      await writeAudit(tx, actor, "update", "student_attendance", null, null, { classId: id, date: day, absent: absentIds });
    });
    revalidatePath("/madrasa/attendance");
  });
}

// --- Fees ---

export async function saveFeeType(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const id = text(formData.get("id"));
    const values = {
      feeType: requiredText(formData.get("feeType"), "Fee name"),
      amount: parseAmount(formData.get("amount")),
      frequency: formData.get("frequency") === "monthly" ? "monthly" : "once",
      classId: text(formData.get("classId")),
    };
    await db.transaction(async (tx) => {
      if (id) {
        const [row] = await tx
          .update(feeStructures)
          .set({ ...values, updatedAt: new Date() })
          .where(and(eq(feeStructures.id, id), eq(feeStructures.tenantId, actor.tenantId)))
          .returning();
        await writeAudit(tx, actor, "update", "fee_structures", id, null, row);
      } else {
        const [row] = await tx.insert(feeStructures).values({ ...values, tenantId: actor.tenantId }).returning();
        await writeAudit(tx, actor, "create", "fee_structures", row.id, null, row);
      }
    });
    refresh();
  });
}

export async function payFee(formData: FormData) {
  return run(async () => {
    const { actor } = await requireEntry();
    const studentId = parseId(formData.get("studentId"), "a student");
    const feeStructureId = parseId(formData.get("feeStructureId"), "a fee");
    const amount = parseAmount(formData.get("amount"));
    const date = parseDate(formData.get("date"));
    const accountId = parseId(formData.get("accountId"), "Cash or Bank");
    const note = text(formData.get("note"));
    const id = await db.transaction(async (tx) => {
      const [student] = await tx
        .select({ name: students.fullName })
        .from(students)
        .where(and(eq(students.id, studentId), eq(students.tenantId, actor.tenantId)))
        .limit(1);
      if (!student) throw new UserError("That student no longer exists.");
      const [fee] = await tx
        .select({ name: feeStructures.feeType })
        .from(feeStructures)
        .where(and(eq(feeStructures.id, feeStructureId), eq(feeStructures.tenantId, actor.tenantId)))
        .limit(1);
      if (!fee) throw new UserError("Please select a fee.");
      const receiptNumber = text(formData.get("receiptNumber")) ?? (await nextReceiptNumber(tx, actor.tenantId, "FEE"));
      const [row] = await tx
        .insert(feePayments)
        .values({
          tenantId: actor.tenantId, studentId, feeStructureId, amount, date, receiptNumber,
          accountId, note, createdBy: actor.userId,
        })
        .returning();
      await postLedger(tx, actor, {
        accountId, date, direction: "in", kind: "income", amount,
        sourceType: "fee", sourceId: row.id, category: "Madrasa fee",
        fundId: await fundIdByName(tx, actor.tenantId, "Madrasa Fund"),
        party: student.name, receiptNumber, note: fee.name,
      });
      await writeAudit(tx, actor, "create", "fee_payments", row.id, null, row);
      return row.id;
    });
    refresh();
    return id;
  });
}

export async function deleteFeePayment(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(feePayments)
        .where(and(eq(feePayments.id, id), eq(feePayments.tenantId, actor.tenantId)))
        .for("update")
        .limit(1);
      if (!old) throw new UserError("That payment no longer exists.");
      await removeLedger(tx, "fee", id);
      await tx.delete(feePayments).where(eq(feePayments.id, id));
      await writeAudit(tx, actor, "delete", "fee_payments", id, old, null);
    });
    refresh();
  });
}

