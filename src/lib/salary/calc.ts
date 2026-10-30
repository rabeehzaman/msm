import { monthEnd, monthKey, shiftMonth } from "@/lib/format";
import type { CellStatus } from "@/lib/rent/status";

export type Allowance = { amount: string; mode: "lump" | "split"; months: number[]; year: number };

export type StaffFacts = {
  monthlySalary: string;
  cleaningFee: string;
  cleaningMode: "none" | "included" | "separate";
  joiningDate: string;
  duesFrom: string | null;
  isActive: boolean;
};

// Shares are worked out in paise so they always add back up to the full allowance.
export function allowanceShare(allowance: Allowance, month: number) {
  const months = [...allowance.months].sort((a, b) => a - b);
  const index = months.indexOf(month);
  if (index === -1) return 0;
  const paise = Math.round(Number(allowance.amount) * 100);
  const share = Math.floor(paise / months.length);
  return (index === months.length - 1 ? paise - share * (months.length - 1) : share) / 100;
}

export function ramadanForMonth(allowances: Allowance[], year: number, month: number) {
  const total = allowances
    .filter((a) => a.year === year)
    .reduce((sum, a) => sum + Math.round(allowanceShare(a, month) * 100), 0);
  return total / 100;
}

export type SalaryKind = "salary" | "cleaning";

export function expectedLines(staff: StaffFacts, allowances: Allowance[], year: number, month: number, kind: SalaryKind) {
  const fee = Number(staff.cleaningFee);
  if (kind === "cleaning") {
    const cleaning = staff.cleaningMode === "separate" ? fee : 0;
    return { basic: 0, cleaning, ramadan: 0, total: cleaning };
  }
  const basic = Number(staff.monthlySalary);
  const cleaning = staff.cleaningMode === "included" ? fee : 0;
  const ramadan = ramadanForMonth(allowances, year, month);
  return { basic, cleaning, ramadan, total: Math.round((basic + cleaning + ramadan) * 100) / 100 };
}

function duesStart(staff: StaffFacts) {
  return staff.duesFrom ?? staff.joiningDate;
}

export function salaryCellStatus(
  staff: StaffFacts,
  isPaid: boolean,
  year: number,
  month: number,
  now: { year: number; month: number },
): CellStatus {
  if (isPaid) return "paid";
  if (!staff.isActive || monthEnd(year, month) < duesStart(staff)) return "vacant";
  return monthKey(year, month) > monthKey(now.year, now.month) ? "upcoming" : "due";
}

// Unpaid months up to the current month, for one salary line of one person.
export function unpaidMonths(
  staff: StaffFacts,
  allowances: Allowance[],
  kind: SalaryKind,
  paid: Set<string>,
  now: { year: number; month: number },
) {
  if (!staff.isActive) return [];
  const [y, m] = duesStart(staff).split("-").map(Number);
  const result: { year: number; month: number; amount: number }[] = [];
  let cursor = { year: y, month: m };
  while (monthKey(cursor.year, cursor.month) <= monthKey(now.year, now.month)) {
    const amount = expectedLines(staff, allowances, cursor.year, cursor.month, kind).total;
    if (amount > 0 && !paid.has(`${cursor.year}-${cursor.month}`)) result.push({ ...cursor, amount });
    cursor = shiftMonth(cursor.year, cursor.month, 1);
  }
  return result;
}

export const staffRoleLabel: Record<string, string> = {
  ustadh: "Ustadh",
  cleaning: "Cleaning staff",
  other: "Other",
};
