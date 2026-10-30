import { currentYearMonth, monthKey } from "@/lib/format";

export type FeeRule = { id: string; amount: string; frequency: string | null; classId: string | null; createdAt: Date | string };
export type FeeStudent = { classId: string | null; admissionDate: string | null; status: string };

// Anything but "active" shows as Left on the student screens.
export const LEFT_STATUSES = ["inactive", "withdrawn", "transferred", "graduated", "dropout"];

export function feeApplies(fee: FeeRule, student: FeeStudent) {
  return !fee.classId || fee.classId === student.classId;
}

// What a student should have paid so far for a fee, whether one-time or monthly.
export function feeExpected(fee: FeeRule, student: FeeStudent, now = currentYearMonth()) {
  const amount = Number(fee.amount);
  if (fee.frequency !== "monthly") return amount;
  const created = new Date(fee.createdAt).toISOString().slice(0, 10);
  const from = student.admissionDate && student.admissionDate > created ? student.admissionDate : created;
  const [year, month] = from.split("-").map(Number);
  const months = monthKey(now.year, now.month) - monthKey(year, month) + 1;
  return Math.max(months, 0) * amount;
}

export function feePending(fee: FeeRule, student: FeeStudent, paid: number) {
  return Math.max(Math.round((feeExpected(fee, student) - paid) * 100) / 100, 0);
}
