// The Dashboard's date filter: quick periods, a custom From–To, and the months a period covers.
// Pure functions shared by the phone and the server, so both always agree on the dates.
import { monthEnd, monthKey, monthStart, shiftMonth } from "@/lib/format";

export const PERIOD_PRESETS = ["today", "yesterday", "this-week", "this-month", "last-month", "this-fy"] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];
export type Period = { preset: PeriodPreset } | { preset: "custom"; from: string; to: string };
export type ResolvedPeriod = { preset: PeriodPreset | "custom"; from: string; to: string; key: string };

export const DEFAULT_PERIOD: Period = { preset: "this-month" };

// Kept for the browser session only: no expiry, and cleared on sign in and sign out,
// so a fresh login always starts at This Month.
export const PERIOD_COOKIE = "msm_dash_period";

export const PRESET_LABELS: Record<PeriodPreset | "custom", string> = {
  today: "Today",
  yesterday: "Yesterday",
  "this-week": "This Week",
  "this-month": "This Month",
  "last-month": "Last Month",
  "this-fy": "This Financial Year",
  custom: "Custom",
};

const DAY = 86400000;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string | null | undefined): value is string {
  if (!value || !ISO.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function addDays(iso: string, days: number) {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);
}

function ym(iso: string) {
  const [year, month] = iso.split("-").map(Number);
  return { year, month };
}

// The same day one month later, clamped to the month's last day (31 Jan -> 28/29 Feb).
function addOneMonth(iso: string) {
  const { year, month } = ym(iso);
  const next = shiftMonth(year, month, 1);
  const day = Number(iso.slice(8, 10));
  const last = Number(monthEnd(next.year, next.month).slice(8, 10));
  return `${next.year}-${String(next.month).padStart(2, "0")}-${String(Math.min(day, last)).padStart(2, "0")}`;
}

// Quick periods end today (This Month = the 1st to today). Weeks start on Monday.
// The financial year runs 1 April to 31 March.
export function resolvePeriod(period: Period, today: string): ResolvedPeriod {
  if (period.preset === "custom") {
    return { preset: "custom", from: period.from, to: period.to, key: `custom:${period.from}:${period.to}` };
  }
  const { year, month } = ym(today);
  let from = today;
  let to = today;
  switch (period.preset) {
    case "today":
      break;
    case "yesterday":
      from = to = addDays(today, -1);
      break;
    case "this-week": {
      const weekday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday = 0
      from = addDays(today, -weekday);
      break;
    }
    case "this-month":
      from = monthStart(year, month);
      break;
    case "last-month": {
      const last = shiftMonth(year, month, -1);
      from = monthStart(last.year, last.month);
      to = monthEnd(last.year, last.month);
      break;
    }
    case "this-fy":
      from = monthStart(month >= 4 ? year : year - 1, 4);
      break;
  }
  return { preset: period.preset, from, to, key: period.preset };
}

// "this-month" or "custom:2026-10-01:2026-10-31". Anything else is not a period.
export function parsePeriod(value: string | null | undefined): Period | null {
  if (!value) return null;
  if ((PERIOD_PRESETS as readonly string[]).includes(value)) return { preset: value as PeriodPreset };
  const m = /^custom:(\d{4}-\d{2}-\d{2}):(\d{4}-\d{2}-\d{2})$/.exec(value);
  if (!m || !isIsoDate(m[1]) || !isIsoDate(m[2]) || m[1] > m[2]) return null;
  return { preset: "custom", from: m[1], to: m[2] };
}

export function periodKey(period: Period) {
  return period.preset === "custom" ? `custom:${period.from}:${period.to}` : period.preset;
}

// Checks a custom From–To typed by the person. Returns the English message to show, or null.
export function periodProblem(from: string, to: string) {
  if (!isIsoDate(from) || !isIsoDate(to)) return "Please enter a valid date.";
  if (from > to) return "The From date cannot be after the To date.";
  return null;
}

// DD-MM-YYYY (as typed) to YYYY-MM-DD, or null.
export function parseDisplayDate(value: string) {
  const m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(value.trim());
  if (!m) return null;
  const iso = `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return isIsoDate(iso) ? iso : null;
}

// The Rental / Salary Months a period's pending cards look at. A period shorter than a month uses
// the month its To date falls in; a longer one uses every month it touches.
export function pendingMonthsFor(from: string, to: string) {
  const end = ym(to);
  if (to < addDays(addOneMonth(from), -1)) return [end];
  const months: { year: number; month: number }[] = [];
  let cursor = ym(from);
  while (monthKey(cursor.year, cursor.month) <= monthKey(end.year, end.month)) {
    months.push(cursor);
    cursor = shiftMonth(cursor.year, cursor.month, 1);
  }
  return months;
}
