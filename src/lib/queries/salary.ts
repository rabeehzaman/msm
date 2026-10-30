import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cashAccounts, ramadanAllowances, salaryPayments, staff } from "@/db/schema";
import { currentYearMonth } from "@/lib/format";
import { expectedLines, salaryCellStatus, unpaidMonths, type Allowance, type SalaryKind } from "@/lib/salary/calc";
import { ensureTenant } from "./auth";

export async function getStaffFacts() {
  const tenant = await ensureTenant();
  const [people, allowances, payments] = await Promise.all([
    db.select().from(staff).where(eq(staff.tenantId, tenant.id)).orderBy(asc(staff.role), asc(staff.name)),
    db.select().from(ramadanAllowances).where(eq(ramadanAllowances.tenantId, tenant.id)),
    db
      .select({
        id: salaryPayments.id,
        staffId: salaryPayments.staffId,
        year: salaryPayments.year,
        month: salaryPayments.month,
        kind: salaryPayments.kind,
        basic: salaryPayments.basic,
        cleaning: salaryPayments.cleaning,
        ramadan: salaryPayments.ramadan,
        otherAdditions: salaryPayments.otherAdditions,
        otherNote: salaryPayments.otherNote,
        amount: salaryPayments.amount,
        paidDate: salaryPayments.paidDate,
        accountId: salaryPayments.accountId,
        accountName: cashAccounts.name,
        note: salaryPayments.note,
      })
      .from(salaryPayments)
      .leftJoin(cashAccounts, eq(salaryPayments.accountId, cashAccounts.id))
      .where(eq(salaryPayments.tenantId, tenant.id)),
  ]);
  return people.map((p) => ({
    ...p,
    allowances: allowances.filter((a) => a.staffId === p.id) as (typeof allowances[number] & Allowance)[],
    payments: payments.filter((x) => x.staffId === p.id),
  }));
}

export type StaffRecord = Awaited<ReturnType<typeof getStaffFacts>>[number];

// One person can have two rows: their salary, and a separately paid cleaning fee.
function linesFor(person: StaffRecord): SalaryKind[] {
  const lines: SalaryKind[] = [];
  const hasSalary =
    Number(person.monthlySalary) > 0 || person.cleaningMode === "included" || person.allowances.length > 0;
  if (hasSalary) lines.push("salary");
  if (person.cleaningMode === "separate" && Number(person.cleaningFee) > 0) lines.push("cleaning");
  return lines;
}

export async function getSalaryGrid(year: number) {
  const people = await getStaffFacts();
  const now = currentYearMonth();
  const rows = [];
  for (const person of people) {
    const paidKinds = person.payments.filter((p) => p.year === year).map((p) => p.kind as SalaryKind);
    for (const kind of new Set([...linesFor(person), ...paidKinds])) {
      if (!person.isActive && !paidKinds.includes(kind)) continue;
      rows.push({
        staffId: person.id,
        name: person.name,
        role: person.role,
        phone: person.phone,
        kind,
        months: Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const payment = person.payments.find((p) => p.year === year && p.month === month && p.kind === kind) ?? null;
          return {
            month,
            status: salaryCellStatus(person, !!payment, year, month, now),
            expected: expectedLines(person, person.allowances, year, month, kind),
            payment,
          };
        }),
      });
    }
  }
  return rows;
}

export function personUnpaid(person: StaffRecord, kind: SalaryKind, now = currentYearMonth()) {
  const paid = new Set(person.payments.filter((p) => p.kind === kind).map((p) => `${p.year}-${p.month}`));
  return unpaidMonths(person, person.allowances, kind, paid, now);
}

export async function getSalarySummary() {
  const people = await getStaffFacts();
  const now = currentYearMonth();
  let payable = 0;
  let paid = 0;
  let pendingCount = 0;
  let pendingAmount = 0;
  for (const person of people) {
    for (const kind of linesFor(person)) {
      const payment = person.payments.find((p) => p.year === now.year && p.month === now.month && p.kind === kind);
      if (payment) {
        paid += Number(payment.amount);
        payable += Number(payment.amount);
        continue;
      }
      const status = salaryCellStatus(person, false, now.year, now.month, now);
      if (status !== "due") continue;
      const expected = expectedLines(person, person.allowances, now.year, now.month, kind).total;
      payable += expected;
      pendingCount += 1;
      pendingAmount += expected;
    }
  }
  return { payable, paid, pendingCount, pendingAmount };
}

export async function getAllowances() {
  const tenant = await ensureTenant();
  return db
    .select({
      id: ramadanAllowances.id,
      staffId: ramadanAllowances.staffId,
      staffName: staff.name,
      year: ramadanAllowances.year,
      amount: ramadanAllowances.amount,
      mode: ramadanAllowances.mode,
      months: ramadanAllowances.months,
      note: ramadanAllowances.note,
    })
    .from(ramadanAllowances)
    .innerJoin(staff, eq(ramadanAllowances.staffId, staff.id))
    .where(and(eq(ramadanAllowances.tenantId, tenant.id)))
    .orderBy(asc(ramadanAllowances.year), asc(staff.name));
}
