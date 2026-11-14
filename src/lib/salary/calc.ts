import { FULL_MONTHS, MONTHS, monthEnd, monthKey, shiftMonth } from "@/lib/format";
import type { CellStatus } from "@/lib/rent/status";

export type Allowance = { amount: string; mode: "lump" | "split"; months: number[]; year: number };

export type YearMonth = { year: number; month: number };

export type StaffFacts = {
  monthlySalary: string;
  cleaningFee: string;
  cleaningMode: "none" | "included" | "separate";
  joiningDate: string;
  duesFrom: string | null;
  isActive: boolean;
  // The day the person was marked inactive. Months after that month take no new salary.
  // NULL on someone inactive (marked before this was recorded) means no month is open, as before.
  inactiveFrom?: string | null;
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

// The amounts that apply to one Salary Month: the person's rate, and that month's Ramadan share.
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

// The first Salary Month that counts: the month of "Count dues from", else of the joining date.
export function firstSalaryMonth(staff: StaffFacts): YearMonth {
  const [year, month] = duesStart(staff).split("-").map(Number);
  return { year, month };
}

// The last Salary Month that can take a salary: the month they were marked inactive.
// undefined = still active (no limit); null = inactive with no recorded date (nothing open).
export function lastSalaryMonth(staff: StaffFacts): YearMonth | null | undefined {
  if (staff.isActive) return undefined;
  if (!staff.inactiveFrom) return null;
  const [year, month] = staff.inactiveFrom.split("-").map(Number);
  return { year, month };
}

// Whether a Salary Month is inside the person's service: on or after the dues start, and not after
// they were marked inactive.
export function isSalaryMonthOpen(staff: StaffFacts, year: number, month: number) {
  if (monthEnd(year, month) < duesStart(staff)) return false;
  const last = lastSalaryMonth(staff);
  if (last === null) return false;
  return last === undefined || monthKey(year, month) <= monthKey(last.year, last.month);
}

export function salaryCellStatus(
  staff: StaffFacts,
  isPaid: boolean,
  year: number,
  month: number,
  now: YearMonth,
): CellStatus {
  if (isPaid) return "paid";
  if (!isSalaryMonthOpen(staff, year, month)) return "vacant";
  return monthKey(year, month) > monthKey(now.year, now.month) ? "upcoming" : "due";
}

// Unpaid months up to the current month, for one salary line of one person.
export function unpaidMonths(
  staff: StaffFacts,
  allowances: Allowance[],
  kind: SalaryKind,
  paid: Set<string>,
  now: YearMonth,
) {
  const last = lastSalaryMonth(staff);
  if (last === null) return [];
  const end = last && monthKey(last.year, last.month) < monthKey(now.year, now.month) ? last : now;
  const result: { year: number; month: number; amount: number }[] = [];
  let cursor = firstSalaryMonth(staff);
  while (monthKey(cursor.year, cursor.month) <= monthKey(end.year, end.month)) {
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

// --- One person with their payments: the grid, the dashboard and the popup all work from this ---

// year + month on a payment is its Salary Month. paidDate is only when the money went out.
export type SalaryPaymentFact = { id: string; year: number; month: number; kind: string; amount: string; paidDate: string };

export type SalaryPerson<P extends SalaryPaymentFact = SalaryPaymentFact> = StaffFacts & {
  id: string;
  name: string;
  allowances: Allowance[];
  payments: P[];
};

// One person can have two lines: their salary, and a separately paid cleaning fee.
export function salaryLines(person: Pick<SalaryPerson, "monthlySalary" | "cleaningMode" | "cleaningFee" | "allowances">) {
  const lines: SalaryKind[] = [];
  const hasSalary = Number(person.monthlySalary) > 0 || person.cleaningMode === "included" || person.allowances.length > 0;
  if (hasSalary) lines.push("salary");
  if (person.cleaningMode === "separate" && Number(person.cleaningFee) > 0) lines.push("cleaning");
  return lines;
}

export function paymentFor<P extends SalaryPaymentFact>(person: SalaryPerson<P>, kind: SalaryKind, year: number, month: number) {
  return person.payments.find((p) => p.kind === kind && p.year === year && p.month === month) ?? null;
}

export function personUnpaidMonths(person: SalaryPerson, kind: SalaryKind, now: YearMonth) {
  const paid = new Set(person.payments.filter((p) => p.kind === kind).map((p) => `${p.year}-${p.month}`));
  return unpaidMonths(person, person.allowances, kind, paid, now);
}

// The Salaries grid for one year. A cell is green when a payment's Salary Month is that month,
// whatever its payment date.
export function salaryGridRows<P extends SalaryPaymentFact, T extends SalaryPerson<P>>(people: T[], year: number, now: YearMonth) {
  const rows = [];
  for (const person of people) {
    const paidKinds = person.payments.filter((p) => p.year === year).map((p) => p.kind as SalaryKind);
    const openThisYear = Array.from({ length: 12 }, (_, i) => isSalaryMonthOpen(person, year, i + 1)).some(Boolean);
    for (const kind of new Set([...salaryLines(person), ...paidKinds])) {
      // Someone inactive is listed only for a year with a payment, or with months before they left.
      if (!person.isActive && !paidKinds.includes(kind) && !openThisYear) continue;
      rows.push({
        person,
        kind,
        months: Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const payment = paymentFor(person, kind, year, month);
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

// This month's figures and everything still owed, all by Salary Month. A February salary paid in
// November clears February, and November stays pending.
export function salarySummary(people: SalaryPerson[], now: YearMonth) {
  let payable = 0;
  let paid = 0;
  let thisMonthPendingCount = 0;
  let thisMonthPending = 0;
  let pendingCount = 0;
  let pendingAmount = 0;
  const paise = (n: number) => Math.round(n * 100);
  for (const person of people) {
    for (const kind of salaryLines(person)) {
      for (const m of personUnpaidMonths(person, kind, now)) {
        pendingCount += 1;
        pendingAmount += paise(m.amount);
      }
      const payment = paymentFor(person, kind, now.year, now.month);
      if (payment) {
        paid += paise(Number(payment.amount));
        payable += paise(Number(payment.amount));
        continue;
      }
      if (salaryCellStatus(person, false, now.year, now.month, now) !== "due") continue;
      const expected = expectedLines(person, person.allowances, now.year, now.month, kind).total;
      payable += paise(expected);
      thisMonthPendingCount += 1;
      thisMonthPending += paise(expected);
    }
  }
  return {
    payable: payable / 100,
    paid: paid / 100,
    thisMonthPendingCount,
    thisMonthPending: thisMonthPending / 100,
    pendingCount,
    pendingAmount: pendingAmount / 100,
  };
}

// Where the popup starts when it is not opened from a month: the oldest unpaid month, else this month.
export function defaultSalaryMonth(person: SalaryPerson, kind: SalaryKind, now: YearMonth): YearMonth {
  const oldest = personUnpaidMonths(person, kind, now)[0];
  return oldest ? { year: oldest.year, month: oldest.month } : { year: now.year, month: now.month };
}

export const periodName = (year: number, month: number) => `${MONTHS[month - 1]} ${year}`;
export const fullPeriodName = (year: number, month: number) => `${FULL_MONTHS[month - 1]} ${year}`;

export type SalaryMonthProblem = {
  code: "before-start" | "after-inactive" | "inactive" | "already-paid";
  // English text with {placeholders}, so the phone can translate it and the server can send it.
  message: string;
  vars: Record<string, string>;
  blocking: boolean;
  paymentId?: string;
};

// Checks one Salary Month for one person before a save. The popup shows this as soon as the month is
// chosen; the server runs the same check inside the save. `editingId` is the payment being edited:
// it does not clash with itself, and a payment already on a month stays editable there.
export function checkSalaryMonth(
  person: SalaryPerson,
  kind: SalaryKind,
  year: number,
  month: number,
  editing?: { id: string; year: number; month: number } | null,
): SalaryMonthProblem | null {
  const period = periodName(year, month);
  const onOwnMonth = !!editing && editing.year === year && editing.month === month;
  if (!onOwnMonth && !isSalaryMonthOpen(person, year, month)) {
    const first = firstSalaryMonth(person);
    if (monthKey(year, month) < monthKey(first.year, first.month)) {
      return {
        code: "before-start",
        message: "Salary for {name} counts from {first} (joining date or \"Count dues from\"). Choose {first} or a later month.",
        vars: { name: person.name, first: periodName(first.year, first.month) },
        blocking: true,
      };
    }
    const last = lastSalaryMonth(person);
    if (last) {
      return {
        code: "after-inactive",
        message: "{name} was marked inactive in {last}. Choose {last} or an earlier month.",
        vars: { name: person.name, last: periodName(last.year, last.month) },
        blocking: true,
      };
    }
    return {
      code: "inactive",
      message: "{name} is marked inactive. Set the date they became inactive on the Staff page to pay earlier months.",
      vars: { name: person.name },
      blocking: true,
    };
  }
  const clash = person.payments.find((p) => p.kind === kind && p.year === year && p.month === month && p.id !== editing?.id);
  if (clash) {
    return {
      code: "already-paid",
      message: kind === "cleaning" ? "Cleaning fee for {month} is already paid for {name}." : "Salary for {month} is already paid for {name}.",
      vars: { month: period, name: person.name },
      blocking: true,
      paymentId: clash.id,
    };
  }
  return null;
}

export function problemText(problem: Pick<SalaryMonthProblem, "message" | "vars">) {
  let out = problem.message;
  for (const [k, v] of Object.entries(problem.vars)) out = out.replaceAll(`{${k}}`, v);
  return out;
}

export type SalarySummary = ReturnType<typeof salarySummary>;
