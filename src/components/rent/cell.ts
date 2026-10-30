import type { CellStatus } from "@/lib/rent/status";

// Green paid, red due, grey upcoming or vacant. Salary grids use the same colours.
export const cellClass: Record<CellStatus, string> = {
  paid: "bg-emerald-500 text-white",
  due: "bg-red-500/85 text-white",
  upcoming: "bg-muted-foreground/15 text-muted-foreground",
  vacant: "bg-muted-foreground/15 text-muted-foreground",
};
