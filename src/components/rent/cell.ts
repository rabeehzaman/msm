import type { CellStatus } from "@/lib/rent/status";

// Green paid, red due, grey upcoming or vacant. Salary grids use the same colours.
// Variable rooms add amber "Partially paid" and a pale amber "Amount not set" with a "?".
export const cellClass: Record<CellStatus, string> = {
  paid: "bg-emerald-500 text-white",
  partial: "bg-amber-500 text-white",
  due: "bg-red-500/85 text-white",
  upcoming: "bg-muted-foreground/15 text-muted-foreground",
  vacant: "bg-muted-foreground/15 text-muted-foreground",
  unset: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300 dark:bg-amber-400/15 dark:text-amber-300 dark:ring-amber-400/30",
};

export const statusLabel: Record<CellStatus, string> = {
  paid: "Paid",
  partial: "Partially paid",
  due: "Due",
  upcoming: "Upcoming",
  vacant: "Vacant",
  unset: "Amount not set",
};
