import { monthEnd, monthKey, monthStart, shiftMonth } from "@/lib/format";

export type TenancyFact = {
  id: string;
  tenantName: string;
  startDate: string;
  endDate: string | null;
  duesFrom?: string | null;
};
export type RentFact = { amount: string; effectiveFrom: string };
export type CellStatus = "paid" | "due" | "upcoming" | "vacant";

// The tenancy that covers a month. If two overlap (a change mid-month) the newer one counts.
export function tenancyForMonth<T extends TenancyFact>(tenancies: T[], year: number, month: number): T | null {
  const start = monthStart(year, month);
  const end = monthEnd(year, month);
  const overlapping = tenancies.filter((t) => t.startDate <= end && (!t.endDate || t.endDate >= start));
  return overlapping.sort((a, b) => b.startDate.localeCompare(a.startDate))[0] ?? null;
}

// Past months keep their old rent: the latest amount at or before the month wins.
export function rentForMonth(rents: RentFact[], year: number, month: number) {
  const end = monthEnd(year, month);
  const applicable = rents
    .filter((r) => r.effectiveFrom <= end)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  return Number(applicable[0]?.amount ?? 0);
}

// Older months are not treated as owed when dues are counted from a later date.
export function isTracked(tenancy: TenancyFact, year: number, month: number) {
  return monthEnd(year, month) >= (tenancy.duesFrom ?? tenancy.startDate);
}

export function cellStatus(
  isPaid: boolean,
  hasTenancy: boolean,
  year: number,
  month: number,
  now: { year: number; month: number },
): CellStatus {
  if (isPaid) return "paid";
  if (!hasTenancy) return "vacant";
  return monthKey(year, month) > monthKey(now.year, now.month) ? "upcoming" : "due";
}

// Every unpaid month from each tenancy's start up to the current month.
export function pendingMonths(
  tenancies: TenancyFact[],
  rents: RentFact[],
  paid: Set<string>,
  now: { year: number; month: number },
) {
  const seen = new Set<string>();
  const result: { year: number; month: number; amount: number; tenancy: TenancyFact }[] = [];
  for (const tenancy of tenancies) {
    const [startYear, startMonth] = (tenancy.duesFrom ?? tenancy.startDate).split("-").map(Number);
    let cursor = { year: startYear, month: startMonth };
    while (monthKey(cursor.year, cursor.month) <= monthKey(now.year, now.month)) {
      const key = `${cursor.year}-${cursor.month}`;
      const covering = tenancyForMonth(tenancies, cursor.year, cursor.month);
      if (covering?.id === tenancy.id && !paid.has(key) && !seen.has(key)) {
        seen.add(key);
        result.push({ ...cursor, amount: rentForMonth(rents, cursor.year, cursor.month), tenancy });
      }
      cursor = shiftMonth(cursor.year, cursor.month, 1);
    }
  }
  return result.sort((a, b) => monthKey(a.year, a.month) - monthKey(b.year, b.month));
}

export function roomLabel(building: string, floor: string, room: string) {
  return `${building.replace(/ Building$/i, "")} – ${floor} – ${room}`;
}
