// Shared display formats: ₹ for money and DD-MM-YYYY for dates. India time for "today".

export function formatMoney(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  const hasPaise = Math.round(Math.abs(n) * 100) % 100 !== 0;
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  if (value instanceof Date) {
    const ist = new Date(value.getTime() + 5.5 * 60 * 60 * 1000);
    return formatDate(ist.toISOString().slice(0, 10));
  }
  const [y, m, d] = value.slice(0, 10).split("-");
  return `${d}-${m}-${y}`;
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  const time = d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${formatDate(d)} ${time}`;
}

export function todayIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function currentYearMonth() {
  const [year, month] = todayIST().split("-").map(Number);
  return { year, month };
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export function monthKey(year: number, month: number) {
  return year * 12 + (month - 1);
}

export function monthStart(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

export function monthEnd(year: number, month: number) {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
}

export function shiftMonth(year: number, month: number, by: number) {
  const key = monthKey(year, month) + by;
  return { year: Math.floor(key / 12), month: (key % 12) + 1 };
}
