import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  cashAccounts, classes, feePayments, feeStructures, households, incomeEntries, rentPayments, roomTenancies,
  salaryPayments, staff, students, subscriptionPayments,
} from "@/db/schema";
import { MONTHS } from "@/lib/format";
import { ensureTenant } from "@/lib/queries/auth";
import { getRoomDetail } from "@/lib/queries/rent";

export type ReceiptLine = { label: string; amount: number | string };

export type ReceiptData = {
  kind: "receipt" | "slip";
  title: string;
  number: string;
  date: string;
  partyLabel: string;
  party: string;
  subject: string;
  lines: ReceiptLine[];
  total: number | string;
  via: string | null;
  note: string | null;
  phone: string | null;
  backHref: string;
};

async function rentReceipt(id: string): Promise<ReceiptData | null> {
  const tenant = await ensureTenant();
  const [row] = await db
    .select({ payment: rentPayments, tenancy: roomTenancies, via: cashAccounts.name })
    .from(rentPayments)
    .innerJoin(roomTenancies, eq(rentPayments.tenancyId, roomTenancies.id))
    .leftJoin(cashAccounts, eq(rentPayments.accountId, cashAccounts.id))
    .where(and(eq(rentPayments.id, id), eq(rentPayments.tenantId, tenant.id)))
    .limit(1);
  if (!row) return null;
  const room = await getRoomDetail(row.payment.roomId);
  const period = `${MONTHS[row.payment.month - 1]} ${row.payment.year}`;
  return {
    kind: "receipt",
    title: "Rent Receipt",
    number: row.payment.receiptNumber,
    date: row.payment.paidDate,
    partyLabel: "Received from",
    party: [row.tenancy.tenantName, row.tenancy.shopName].filter(Boolean).join(", "),
    subject: `${room?.label ?? ""}, ${period}`,
    lines: [{ label: `Rent for ${period}`, amount: row.payment.amount }],
    total: row.payment.amount,
    via: row.via,
    note: row.payment.note,
    phone: row.tenancy.phone,
    backHref: `/rent/rooms/${row.payment.roomId}?year=${row.payment.year}`,
  };
}

async function salarySlip(id: string): Promise<ReceiptData | null> {
  const tenant = await ensureTenant();
  const [row] = await db
    .select({ p: salaryPayments, person: staff, via: cashAccounts.name })
    .from(salaryPayments)
    .innerJoin(staff, eq(salaryPayments.staffId, staff.id))
    .leftJoin(cashAccounts, eq(salaryPayments.accountId, cashAccounts.id))
    .where(and(eq(salaryPayments.id, id), eq(salaryPayments.tenantId, tenant.id)))
    .limit(1);
  if (!row) return null;
  const { p, person, via } = row;
  const lines: ReceiptLine[] = [
    { label: "Basic salary", amount: p.basic },
    { label: "Cleaning fee", amount: p.cleaning },
    { label: "Ramadan allowance", amount: p.ramadan },
    { label: p.otherNote ? `Other additions (${p.otherNote})` : "Other additions", amount: p.otherAdditions },
  ].filter((l) => Number(l.amount) > 0);
  return {
    kind: "slip",
    title: "Salary Slip",
    number: `${p.year}-${String(p.month).padStart(2, "0")}`,
    date: p.paidDate,
    partyLabel: "Paid to",
    party: person.name,
    subject: `${MONTHS[p.month - 1]} ${p.year}`,
    lines,
    total: p.amount,
    via,
    note: p.note,
    phone: person.phone,
    backHref: `/salaries?year=${p.year}`,
  };
}

async function collectionReceipt(id: string): Promise<ReceiptData | null> {
  const tenant = await ensureTenant();
  const [row] = await db
    .select({ e: incomeEntries, via: cashAccounts.name })
    .from(incomeEntries)
    .leftJoin(cashAccounts, eq(incomeEntries.accountId, cashAccounts.id))
    .where(and(eq(incomeEntries.id, id), eq(incomeEntries.tenantId, tenant.id)))
    .limit(1);
  if (!row) return null;
  const { e, via } = row;
  return {
    kind: "receipt",
    title: "Collection Receipt",
    number: e.receiptNumber,
    date: e.date,
    partyLabel: "Received from",
    party: [e.donorName, e.houseName].filter(Boolean).join(", ") || "-",
    subject: e.bookNumber ? `Book ${e.bookNumber}` : "",
    lines: [{ label: e.category, amount: e.amount }],
    total: e.amount,
    via,
    note: e.description,
    phone: null,
    backHref: "/finances/income",
  };
}

async function subscriptionReceipt(id: string): Promise<ReceiptData | null> {
  const tenant = await ensureTenant();
  const [row] = await db
    .select({ p: subscriptionPayments, house: households, via: cashAccounts.name })
    .from(subscriptionPayments)
    .innerJoin(households, eq(subscriptionPayments.householdId, households.id))
    .leftJoin(cashAccounts, eq(subscriptionPayments.accountId, cashAccounts.id))
    .where(and(eq(subscriptionPayments.id, id), eq(subscriptionPayments.tenantId, tenant.id)))
    .limit(1);
  if (!row) return null;
  const { p, house, via } = row;
  const periods = p.periods
    .map((key) => {
      const [y, m] = key.split("-").map(Number);
      return `${MONTHS[m - 1]} ${y}`;
    })
    .join(", ");
  return {
    kind: "receipt",
    title: "Subscription Receipt",
    number: p.receiptNumber ?? "-",
    date: p.date,
    partyLabel: "Received from",
    party: `${house.houseNumber} ${house.familyName}`,
    subject: p.bookNumber ? `Book ${p.bookNumber}` : "",
    lines: [{ label: `Subscription: ${periods}`, amount: p.amount }],
    total: p.amount,
    via,
    note: p.note,
    phone: house.primaryPhone,
    backHref: "/subscriptions",
  };
}

async function feeReceipt(id: string): Promise<ReceiptData | null> {
  const tenant = await ensureTenant();
  const [row] = await db
    .select({ p: feePayments, student: students, fee: feeStructures.feeType, className: classes.name, via: cashAccounts.name })
    .from(feePayments)
    .innerJoin(students, eq(feePayments.studentId, students.id))
    .leftJoin(feeStructures, eq(feePayments.feeStructureId, feeStructures.id))
    .leftJoin(classes, eq(students.classId, classes.id))
    .leftJoin(cashAccounts, eq(feePayments.accountId, cashAccounts.id))
    .where(and(eq(feePayments.id, id), eq(feePayments.tenantId, tenant.id)))
    .limit(1);
  if (!row) return null;
  const { p, student, fee, className, via } = row;
  return {
    kind: "receipt",
    title: "Fee Receipt",
    number: p.receiptNumber ?? "-",
    date: p.date,
    partyLabel: "Received from",
    party: student.fullName,
    subject: [student.admissionNumber ? `#${student.admissionNumber}` : null, className].filter(Boolean).join(" · "),
    lines: [{ label: fee ?? "Fee", amount: p.amount }],
    total: p.amount,
    via,
    note: p.note,
    phone: student.parentPhone,
    backHref: "/madrasa/fees",
  };
}

const loaders: Record<string, (id: string) => Promise<ReceiptData | null>> = {
  rent: rentReceipt,
  salary: salarySlip,
  collection: collectionReceipt,
  subscription: subscriptionReceipt,
  fee: feeReceipt,
};

export async function loadReceipt(type: string, id: string) {
  const loader = loaders[type];
  if (!loader || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const receipt = await loader(id);
  if (!receipt) return null;
  const tenant = await ensureTenant();
  return { ...receipt, mahalluName: tenant.name, mahalluAddress: tenant.address, mahalluPhone: tenant.phone };
}
