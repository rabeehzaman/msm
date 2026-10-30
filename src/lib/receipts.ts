import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cashAccounts, rentPayments, roomTenancies, salaryPayments, staff } from "@/db/schema";
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

const loaders: Record<string, (id: string) => Promise<ReceiptData | null>> = {
  rent: rentReceipt,
  salary: salarySlip,
};

export async function loadReceipt(type: string, id: string) {
  const loader = loaders[type];
  if (!loader || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const receipt = await loader(id);
  if (!receipt) return null;
  const tenant = await ensureTenant();
  return { ...receipt, mahalluName: tenant.name, mahalluAddress: tenant.address, mahalluPhone: tenant.phone };
}
