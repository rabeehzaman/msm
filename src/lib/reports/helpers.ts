import { currentYearMonth, monthEnd, shiftMonth, monthStart, todayIST } from "@/lib/format";
import type { ReportFilter, ReportParams, ReportRow } from "./types";

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function sumBy(rows: ReportRow[], key: string) {
  return round2(rows.reduce((s, r) => s + Number(r[key] ?? 0), 0));
}

export function dateRange(params: ReportParams, monthsBack = 2) {
  const { year, month } = currentYearMonth();
  const start = shiftMonth(year, month, -monthsBack);
  const from = /^\d{4}-\d{2}-\d{2}$/.test(params.from ?? "") ? params.from! : monthStart(start.year, start.month);
  const to = /^\d{4}-\d{2}-\d{2}$/.test(params.to ?? "") ? params.to! : todayIST();
  const filters: ReportFilter[] = [
    { name: "from", label: "From", type: "date", value: from },
    { name: "to", label: "To", type: "date", value: to },
  ];
  return { from, to, filters };
}

export function yearFilter(params: ReportParams) {
  const now = currentYearMonth().year;
  const parsed = Number(params.year);
  const year = Number.isInteger(parsed) && parsed >= 2000 && parsed <= 2100 ? parsed : now;
  const options: { value: string; label: string }[] = [];
  for (let y = now + 1; y >= now - 9; y--) options.push({ value: String(y), label: String(y) });
  const filter: ReportFilter = { name: "year", label: "Year", type: "select", value: String(year), options };
  return { year, filter };
}

export function monthFilter(params: ReportParams) {
  const parsed = Number(params.month);
  const month = Number.isInteger(parsed) && parsed >= 1 && parsed <= 12 ? parsed : currentYearMonth().month;
  const filter: ReportFilter = { name: "month", label: "Month", type: "month", value: String(month) };
  return { month, filter };
}

export { monthEnd, monthStart };
