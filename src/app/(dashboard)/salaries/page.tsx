import { getActiveAccounts } from "@/lib/queries/accounts";
import { getSalaryGrid, getSalarySummary } from "@/lib/queries/salary";
import { currentYearMonth } from "@/lib/format";
import { SalariesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function SalariesPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const params = await searchParams;
  const now = currentYearMonth();
  const year = Number(params.year) >= 2000 && Number(params.year) <= 2100 ? Number(params.year) : now.year;
  const [rows, summary, accounts] = await Promise.all([getSalaryGrid(year), getSalarySummary(), getActiveAccounts()]);
  return <SalariesClient year={year} currentYear={now.year} rows={rows} summary={summary} accounts={accounts} />;
}
