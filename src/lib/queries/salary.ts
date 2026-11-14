import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cashAccounts, ramadanAllowances, salaryPayments, staff } from "@/db/schema";
import { currentYearMonth } from "@/lib/format";
import { personUnpaidMonths, salaryGridRows, salarySummary, type Allowance, type SalaryKind } from "@/lib/salary/calc";
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

export async function getSalaryGrid(year: number, people?: StaffRecord[]) {
  const facts = people ?? (await getStaffFacts());
  return salaryGridRows(facts, year, currentYearMonth()).map(({ person, kind, months }) => ({
    staffId: person.id,
    name: person.name,
    role: person.role,
    phone: person.phone,
    kind,
    months,
  }));
}

export function personUnpaid(person: StaffRecord, kind: SalaryKind, now = currentYearMonth()) {
  return personUnpaidMonths(person, kind, now);
}

// All by Salary Month (year + month on the payment), never by payment date.
export async function getSalarySummary(people?: StaffRecord[]) {
  return salarySummary(people ?? (await getStaffFacts()), currentYearMonth());
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
