import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cashAccounts, rentPayments, roomTenancies } from "@/db/schema";
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

const loaders: Record<string, (id: string) => Promise<ReceiptData | null>> = {
  rent: rentReceipt,
};

export async function loadReceipt(type: string, id: string) {
  const loader = loaders[type];
  if (!loader || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const receipt = await loader(id);
  if (!receipt) return null;
  const tenant = await ensureTenant();
  return { ...receipt, mahalluName: tenant.name, mahalluAddress: tenant.address, mahalluPhone: tenant.phone };
}

export const monthLabel = (year: number, month: number) => `${MONTHS[month - 1]} ${year}`;
