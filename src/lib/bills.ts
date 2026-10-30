export type BillState = "paid" | "overdue" | "soon" | "unpaid";

const DAY = 24 * 60 * 60 * 1000;

// "Soon" means due within the next 7 days.
export function billState(dueDate: string | null, paidDate: string | null, today: string): BillState {
  if (paidDate) return "paid";
  if (!dueDate) return "unpaid";
  if (dueDate < today) return "overdue";
  const days = (Date.parse(dueDate) - Date.parse(today)) / DAY;
  return days <= 7 ? "soon" : "unpaid";
}
