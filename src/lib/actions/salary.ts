"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { ramadanAllowances, salaryPayments, staff } from "@/db/schema";
import { requireAdmin, requireEntry } from "@/lib/auth/guard";
import { MONTHS } from "@/lib/format";
import {
  parseAmount, parseDate, parseId, parseOptionalAmount, parseOptionalDate, parseYearMonth, requiredText, run, text, UserError,
} from "@/lib/money/action";
import { fundIdByName } from "@/lib/money/funds";
import { postLedger, removeLedger, replaceLedger, writeAudit, type Tx } from "@/lib/money/ledger";

function refresh() {
  revalidatePath("/salaries", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/cash-bank");
}

// --- Staff master (admin) ---

export async function saveStaff(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const id = text(formData.get("id"));
    const roleValue = String(formData.get("role"));
    const modeValue = String(formData.get("cleaningMode"));
    const values = {
      name: requiredText(formData.get("name"), "Name"),
      role: (roleValue === "cleaning" || roleValue === "other" ? roleValue : "ustadh") as "ustadh" | "cleaning" | "other",
      phone: text(formData.get("phone")),
      monthlySalary: parseOptionalAmount(formData.get("monthlySalary"), "Monthly salary"),
      joiningDate: parseDate(formData.get("joiningDate")),
      duesFrom: parseOptionalDate(formData.get("duesFrom")),
      cleaningFee: parseOptionalAmount(formData.get("cleaningFee"), "Cleaning fee"),
      cleaningMode: (modeValue === "included" || modeValue === "separate" ? modeValue : "none") as "none" | "included" | "separate",
      notes: text(formData.get("notes")),
    };
    await db.transaction(async (tx) => {
      if (id) {
        const [old] = await tx.select().from(staff).where(and(eq(staff.id, id), eq(staff.tenantId, actor.tenantId))).for("update").limit(1);
        if (!old) throw new UserError("That staff member no longer exists.");
        const [row] = await tx
          .update(staff)
          .set({ ...values, updatedBy: actor.userId, updatedAt: new Date() })
          .where(eq(staff.id, id))
          .returning();
        await writeAudit(tx, actor, "update", "staff", id, old, row);
      } else {
        const [row] = await tx.insert(staff).values({ ...values, tenantId: actor.tenantId, createdBy: actor.userId }).returning();
        await writeAudit(tx, actor, "create", "staff", row.id, null, row);
      }
    });
    refresh();
  });
}

export async function setStaffActive(id: string, isActive: boolean) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [row] = await tx
        .update(staff)
        .set({ isActive, updatedBy: actor.userId, updatedAt: new Date() })
        .where(and(eq(staff.id, id), eq(staff.tenantId, actor.tenantId)))
        .returning({ id: staff.id });
      if (!row) throw new UserError("That staff member no longer exists.");
      await writeAudit(tx, actor, "update", "staff", id, null, { isActive });
    });
    refresh();
  });
}

// --- Salary payments ---

type Lines = { basic: string; cleaning: string; ramadan: string; otherAdditions: string; amount: string };

function readLines(formData: FormData): Lines {
  const basic = parseOptionalAmount(formData.get("basic"), "Basic salary");
  const cleaning = parseOptionalAmount(formData.get("cleaning"), "Cleaning fee");
  const ramadan = parseOptionalAmount(formData.get("ramadan"), "Ramadan allowance");
  const otherAdditions = parseOptionalAmount(formData.get("otherAdditions"), "Other additions");
  const paise = [basic, cleaning, ramadan, otherAdditions].reduce((s, v) => s + Math.round(Number(v) * 100), 0);
  if (paise <= 0) throw new UserError("Amount must be more than zero.");
  return { basic, cleaning, ramadan, otherAdditions, amount: (paise / 100).toFixed(2) };
}

const ledgerFor = async (
  tx: Tx,
  tenantId: string,
  sourceId: string,
  person: string,
  kind: string,
  year: number,
  month: number,
  accountId: string,
  paidDate: string,
  amount: string,
) => ({
  accountId,
  date: paidDate,
  direction: "out" as const,
  kind: "expense" as const,
  amount,
  sourceType: "salary",
  sourceId,
  category: kind === "cleaning" ? "Cleaning fee" : "Salary",
  fundId: await fundIdByName(tx, tenantId, "General Fund"),
  party: person,
  note: `${MONTHS[month - 1]} ${year}`,
});

export async function paySalary(formData: FormData) {
  return run(async () => {
    const { actor } = await requireEntry();
    const staffId = parseId(formData.get("staffId"), "a staff member");
    const { year, month } = parseYearMonth(formData.get("year"), formData.get("month"));
    const kind = formData.get("kind") === "cleaning" ? "cleaning" : "salary";
    const lines = readLines(formData);
    const paidDate = parseDate(formData.get("paidDate"));
    const accountId = parseId(formData.get("accountId"), "Cash or Bank");
    await db.transaction(async (tx) => {
      const [person] = await tx
        .select({ name: staff.name })
        .from(staff)
        .where(and(eq(staff.id, staffId), eq(staff.tenantId, actor.tenantId)))
        .limit(1);
      if (!person) throw new UserError("That staff member no longer exists.");
      const [row] = await tx
        .insert(salaryPayments)
        .values({
          tenantId: actor.tenantId,
          staffId,
          year,
          month,
          kind,
          ...lines,
          otherNote: text(formData.get("otherNote")),
          paidDate,
          accountId,
          note: text(formData.get("note")),
          createdBy: actor.userId,
        })
        .returning();
      await postLedger(tx, actor, await ledgerFor(tx, actor.tenantId, row.id, person.name, kind, year, month, accountId, paidDate, lines.amount));
      await writeAudit(tx, actor, "create", "salary_payments", row.id, null, row);
    });
    refresh();
  }, "This month is already marked as paid.");
}

export async function updateSalaryPayment(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const id = parseId(formData.get("id"), "a payment");
    const lines = readLines(formData);
    const paidDate = parseDate(formData.get("paidDate"));
    const accountId = parseId(formData.get("accountId"), "Cash or Bank");
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select({ payment: salaryPayments, name: staff.name })
        .from(salaryPayments)
        .innerJoin(staff, eq(salaryPayments.staffId, staff.id))
        .where(and(eq(salaryPayments.id, id), eq(salaryPayments.tenantId, actor.tenantId)))
        .for("update", { of: salaryPayments })
        .limit(1);
      if (!old) throw new UserError("That payment no longer exists.");
      const [row] = await tx
        .update(salaryPayments)
        .set({
          ...lines,
          otherNote: text(formData.get("otherNote")),
          paidDate,
          accountId,
          note: text(formData.get("note")),
          updatedBy: actor.userId,
          updatedAt: new Date(),
        })
        .where(eq(salaryPayments.id, id))
        .returning();
      const p = old.payment;
      await replaceLedger(tx, actor, await ledgerFor(tx, actor.tenantId, id, old.name, p.kind, p.year, p.month, accountId, paidDate, lines.amount));
      await writeAudit(tx, actor, "update", "salary_payments", id, p, row);
    });
    refresh();
  });
}

export async function deleteSalaryPayment(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(salaryPayments)
        .where(and(eq(salaryPayments.id, id), eq(salaryPayments.tenantId, actor.tenantId)))
        .for("update")
        .limit(1);
      if (!old) throw new UserError("That payment no longer exists.");
      await removeLedger(tx, "salary", id);
      await tx.delete(salaryPayments).where(eq(salaryPayments.id, id));
      await writeAudit(tx, actor, "delete", "salary_payments", id, old, null);
    });
    refresh();
  });
}

// --- Ramadan allowance (admin) ---

export async function saveAllowance(formData: FormData) {
  return run(async () => {
    const { actor } = await requireAdmin();
    const target = String(formData.get("staffId"));
    const year = Number(formData.get("year"));
    const amount = parseAmount(formData.get("amount"));
    const mode = formData.get("mode") === "split" ? ("split" as const) : ("lump" as const);
    const months = [...new Set(formData.getAll("months").map(Number))].sort((a, b) => a - b);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new UserError("Please select a valid month.");
    if (months.length === 0 || months.some((m) => !Number.isInteger(m) || m < 1 || m > 12)) {
      throw new UserError("Please choose the month or months.");
    }
    if (mode === "lump" && months.length !== 1) throw new UserError("A lump sum is paid in one month.");
    if (mode === "split" && months.length < 2) throw new UserError("Choose at least two months to divide across.");

    await db.transaction(async (tx) => {
      const people =
        target === "all"
          ? await tx
              .select({ id: staff.id, name: staff.name })
              .from(staff)
              .where(and(eq(staff.tenantId, actor.tenantId), eq(staff.role, "ustadh"), eq(staff.isActive, true)))
          : await tx
              .select({ id: staff.id, name: staff.name })
              .from(staff)
              .where(and(eq(staff.tenantId, actor.tenantId), eq(staff.id, parseId(target, "a staff member"))));
      if (people.length === 0) throw new UserError("There are no ustadhs to give this to.");

      // A month that is already paid would never include the new share.
      const [clash] = await tx
        .select({ staffId: salaryPayments.staffId, month: salaryPayments.month })
        .from(salaryPayments)
        .where(
          and(
            inArray(salaryPayments.staffId, people.map((p) => p.id)),
            eq(salaryPayments.year, year),
            eq(salaryPayments.kind, "salary"),
            inArray(salaryPayments.month, months),
          ),
        )
        .limit(1);
      if (clash) {
        const who = people.find((p) => p.id === clash.staffId)?.name;
        throw new UserError(`${who}: ${MONTHS[clash.month - 1]} ${year} is already paid. Un-tick it or choose other months.`);
      }

      const rows = await tx
        .insert(ramadanAllowances)
        .values(
          people.map((p) => ({
            tenantId: actor.tenantId,
            staffId: p.id,
            year,
            amount,
            mode,
            months,
            note: text(formData.get("note")),
            createdBy: actor.userId,
          })),
        )
        .returning();
      for (const row of rows) await writeAudit(tx, actor, "create", "ramadan_allowances", row.id, null, row);
    });
    refresh();
  });
}

export async function deleteAllowance(id: string) {
  return run(async () => {
    const { actor } = await requireAdmin();
    await db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(ramadanAllowances)
        .where(and(eq(ramadanAllowances.id, id), eq(ramadanAllowances.tenantId, actor.tenantId)))
        .for("update")
        .limit(1);
      if (!old) throw new UserError("That allowance no longer exists.");
      const [paid] = await tx
        .select({ n: sql<number>`count(*)::int` })
        .from(salaryPayments)
        .where(
          and(
            eq(salaryPayments.staffId, old.staffId),
            eq(salaryPayments.year, old.year),
            inArray(salaryPayments.month, old.months),
            sql`${salaryPayments.ramadan} > 0`,
          ),
        );
      if (paid.n > 0) throw new UserError("Part of this allowance is already paid. Un-tick those months first.");
      await tx.delete(ramadanAllowances).where(eq(ramadanAllowances.id, id));
      await writeAudit(tx, actor, "delete", "ramadan_allowances", id, old, null);
    });
    refresh();
  });
}
