import { MONTHS, monthKey, shiftMonth } from "@/lib/format";

export type Frequency = "monthly" | "quarterly" | "half_yearly" | "annual";

const STEP: Record<Frequency, number> = { monthly: 1, quarterly: 3, half_yearly: 6, annual: 12 };

export type Period = { key: string; label: string; started: boolean };

// Periods from the plan's start. Includes a few upcoming ones so people can pay in advance.
export function subscriptionPeriods(
  startDate: string,
  frequency: Frequency,
  now: { year: number; month: number },
  ahead = 3,
): Period[] {
  const step = STEP[frequency];
  const [year, month] = startDate.split("-").map(Number);
  const periods: Period[] = [];
  let cursor = { year, month };
  let extra = 0;
  while (true) {
    const started = monthKey(cursor.year, cursor.month) <= monthKey(now.year, now.month);
    if (!started && ++extra > ahead) break;
    const end = shiftMonth(cursor.year, cursor.month, step - 1);
    const key = `${cursor.year}-${String(cursor.month).padStart(2, "0")}`;
    const first = `${MONTHS[cursor.month - 1]} ${cursor.year}`;
    const label = step === 1 ? first : `${first} – ${MONTHS[end.month - 1]} ${end.year}`;
    periods.push({ key, label, started });
    cursor = shiftMonth(cursor.year, cursor.month, step);
  }
  return periods;
}
