import { monthEnd, monthKey, monthStart, shiftMonth } from "@/lib/format";

export type TenancyFact = {
  id: string;
  tenantName: string;
  startDate: string;
  endDate: string | null;
  duesFrom?: string | null;
};
export type RentType = "fixed" | "variable";
// One row of rent history. For a Variable row the amount is only the usual / approximate rent.
export type RentFact = { amount: string; effectiveFrom: string; rentType?: string | null };
// A Variable room's rent for one month.
export type MonthRentFact = { year: number; month: number; amount: string };
export type PaymentFact = { year: number; month: number; amount: string };
// "partial" and "unset" only happen for Variable rooms. Fixed rooms show exactly what they did before.
export type CellStatus = "paid" | "partial" | "due" | "upcoming" | "vacant" | "unset";
export type YearMonth = { year: number; month: number };

// The tenancy that covers a month. If two overlap (a change mid-month) the newer one counts.
export function tenancyForMonth<T extends TenancyFact>(tenancies: T[], year: number, month: number): T | null {
  const start = monthStart(year, month);
  const end = monthEnd(year, month);
  const overlapping = tenancies.filter((t) => t.startDate <= end && (!t.endDate || t.endDate >= start));
  return overlapping.sort((a, b) => b.startDate.localeCompare(a.startDate))[0] ?? null;
}

function termRow(rents: RentFact[], year: number, month: number) {
  const end = monthEnd(year, month);
  return rents
    .filter((r) => r.effectiveFrom <= end)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
}

// Past months keep their old rent: the latest amount at or before the month wins.
export function rentForMonth(rents: RentFact[], year: number, month: number) {
  return Number(termRow(rents, year, month)?.amount ?? 0);
}

// Fixed or Variable for a month. A switch applies from its month; earlier months keep the old type.
export function rentTypeForMonth(rents: RentFact[], year: number, month: number): RentType {
  return termRow(rents, year, month)?.rentType === "variable" ? "variable" : "fixed";
}

// The type to show on the room's tag: this month's, or the first one set if rent starts later.
export function currentRentType(rents: RentFact[], now: YearMonth): RentType {
  if (termRow(rents, now.year, now.month)) return rentTypeForMonth(rents, now.year, now.month);
  const first = [...rents].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom))[0];
  return first?.rentType === "variable" ? "variable" : "fixed";
}

// The rent owed for a month. Fixed: the rent history amount. Variable: that month's own amount,
// or null while it is not entered yet (never 0 and never the usual rent).
export function dueForMonth(rents: RentFact[], monthRents: MonthRentFact[], year: number, month: number): number | null {
  if (rentTypeForMonth(rents, year, month) === "fixed") return rentForMonth(rents, year, month);
  const own = monthRents.find((r) => r.year === year && r.month === month);
  return own ? Number(own.amount) : null;
}

// Suggestion for a Variable month's rent: the latest earlier month that has one, else the usual rent.
export function suggestedRent(rents: RentFact[], monthRents: MonthRentFact[], year: number, month: number): number | null {
  const key = monthKey(year, month);
  const earlier = monthRents
    .filter((r) => monthKey(r.year, r.month) < key)
    .sort((a, b) => monthKey(b.year, b.month) - monthKey(a.year, a.month))[0];
  if (earlier) return Number(earlier.amount);
  const usual = rentForMonth(rents, year, month);
  return usual > 0 ? usual : null;
}

// Older months are not treated as owed when dues are counted from a later date.
export function isTracked(tenancy: TenancyFact, year: number, month: number) {
  return monthEnd(year, month) >= (tenancy.duesFrom ?? tenancy.startDate);
}

const toCents = (n: number) => Math.round(n * 100);

export function paidForMonth(payments: PaymentFact[], year: number, month: number) {
  const own = payments.filter((p) => p.year === year && p.month === month);
  return { count: own.length, total: own.reduce((s, p) => toCents(Number(p.amount)) + s, 0) / 100 };
}

// Fixed rooms: unchanged from before (any payment = paid).
export function cellStatus(
  isPaid: boolean,
  hasTenancy: boolean,
  year: number,
  month: number,
  now: YearMonth,
): CellStatus {
  if (isPaid) return "paid";
  if (!hasTenancy) return "vacant";
  return monthKey(year, month) > monthKey(now.year, now.month) ? "upcoming" : "due";
}

export function monthStatus(input: {
  type: RentType;
  due: number | null;
  paidCount: number;
  paidTotal: number;
  tracked: boolean;
  year: number;
  month: number;
  now: YearMonth;
}): CellStatus {
  const { type, due, paidCount, paidTotal, tracked, year, month, now } = input;
  if (type === "fixed") return cellStatus(paidCount > 0, tracked, year, month, now);
  if (paidCount > 0) {
    if (due === null || toCents(paidTotal) >= toCents(due)) return "paid";
    return "partial";
  }
  if (!tracked) return "vacant";
  if (monthKey(year, month) > monthKey(now.year, now.month)) return "upcoming";
  return due === null ? "unset" : "due";
}

// Still owed for a month: Fixed = the rent when unpaid; Variable = rent minus what was paid.
export function balanceForMonth(type: RentType, due: number | null, paidCount: number, paidTotal: number) {
  if (due === null) return 0;
  if (type === "fixed") return paidCount > 0 ? 0 : due;
  return Math.max(0, toCents(due) - toCents(paidTotal)) / 100;
}

export type RoomMonthFacts = {
  tenancies: TenancyFact[];
  rents: RentFact[];
  monthRents: MonthRentFact[];
  payments: PaymentFact[];
};

// Everything the grid, the popup and the totals need to know about one room in one month.
export function roomMonth(room: RoomMonthFacts, year: number, month: number, now: YearMonth) {
  const tenancy = tenancyForMonth(room.tenancies, year, month);
  const tracked = !!tenancy && isTracked(tenancy, year, month);
  const type = rentTypeForMonth(room.rents, year, month);
  const due = dueForMonth(room.rents, room.monthRents, year, month);
  const paid = paidForMonth(room.payments, year, month);
  return {
    year,
    month,
    tenancy,
    tracked,
    type,
    due,
    paidCount: paid.count,
    paidTotal: paid.total,
    balance: balanceForMonth(type, due, paid.count, paid.total),
    status: monthStatus({ type, due, paidCount: paid.count, paidTotal: paid.total, tracked, year, month, now }),
  };
}

// Every month still owed from each tenancy's start up to the current month.
// A Variable month counts only once its rent is entered, and only for the unpaid balance.
export function pendingMonths(room: RoomMonthFacts, now: YearMonth) {
  const seen = new Set<string>();
  const result: { year: number; month: number; amount: number; tenancy: TenancyFact }[] = [];
  for (const tenancy of room.tenancies) {
    const [startYear, startMonth] = (tenancy.duesFrom ?? tenancy.startDate).split("-").map(Number);
    let cursor = { year: startYear, month: startMonth };
    while (monthKey(cursor.year, cursor.month) <= monthKey(now.year, now.month)) {
      const key = `${cursor.year}-${cursor.month}`;
      const covering = tenancyForMonth(room.tenancies, cursor.year, cursor.month);
      if (covering?.id === tenancy.id && !seen.has(key)) {
        seen.add(key);
        const m = roomMonth(room, cursor.year, cursor.month, now);
        // Fixed keeps the old rule exactly: any unpaid month counts, even at ₹0.
        const owed = m.type === "fixed" ? m.paidCount === 0 : m.balance > 0;
        if (owed) result.push({ ...cursor, amount: m.balance, tenancy });
      }
      cursor = shiftMonth(cursor.year, cursor.month, 1);
    }
  }
  return result.sort((a, b) => monthKey(a.year, a.month) - monthKey(b.year, b.month));
}

// The month the popup opens on when it is not opened from a month cell:
// the oldest month still owed, else the current month.
export function defaultRentalMonth(room: RoomMonthFacts, now: YearMonth): YearMonth {
  const oldest = pendingMonths(room, now)[0];
  return oldest ? { year: oldest.year, month: oldest.month } : { year: now.year, month: now.month };
}

// Where a new (or moved) payment for a Rental Month would go, and whether it would pay the month twice.
// Fixed: one payment per month, so a second is refused. Variable: parts until the rent is covered,
// then a warning the person can confirm.
export function paymentSlot(
  room: Pick<RoomMonthFacts, "rents" | "monthRents"> & { payments: (PaymentFact & { id: string; part: number })[] },
  year: number,
  month: number,
  exceptId?: string,
) {
  const others = room.payments.filter((p) => p.year === year && p.month === month && p.id !== exceptId);
  const type = rentTypeForMonth(room.rents, year, month);
  if (type === "fixed") return { type, part: 1, alreadyPaid: others.length > 0, canOverride: false };
  const due = dueForMonth(room.rents, room.monthRents, year, month);
  const paid = paidForMonth(others, year, month).total;
  const covered = others.length > 0 && (due === null || toCents(paid) >= toCents(due));
  return { type, part: Math.max(0, ...others.map((p) => p.part)) + 1, alreadyPaid: covered, canOverride: true };
}

export function roomLabel(building: string, floor: string, room: string) {
  return `${building.replace(/ Building$/i, "")} – ${floor} – ${room}`;
}
