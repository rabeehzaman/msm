import { currentYearMonth } from "@/lib/format";
import { getVariableRentSheet } from "@/lib/queries/rent";
import { VariableRentsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function VariableRentsPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
  const params = await searchParams;
  const now = currentYearMonth();
  const year = Number(params.year) >= 2000 && Number(params.year) <= 2100 ? Number(params.year) : now.year;
  const month = Number(params.month) >= 1 && Number(params.month) <= 12 ? Number(params.month) : now.month;
  const rows = await getVariableRentSheet(year, month);
  return <VariableRentsClient year={year} month={month} rows={rows} currentYear={now.year} />;
}
