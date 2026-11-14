import { getActiveAccounts } from "@/lib/queries/accounts";
import { getSalaryGrid, getSalarySummary, getStaffFacts } from "@/lib/queries/salary";
import { currentYearMonth } from "@/lib/format";
import { SalariesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function SalariesPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const params = await searchParams;
  const now = currentYearMonth();
  const year = Number(params.year) >= 2000 && Number(params.year) <= 2100 ? Number(params.year) : now.year;
  // One load of the staff facts feeds the grid, the figures and the popup (which checks any Salary Month).
  const [people, accounts] = await Promise.all([getStaffFacts(), getActiveAccounts()]);
  const [rows, summary] = await Promise.all([getSalaryGrid(year, people), getSalarySummary(people)]);
  return (
    <SalariesClient
      year={year}
      currentYear={now.year}
      rows={rows.map((r) => ({ ...r, months: r.months.map(({ month, status, payment }) => ({ month, status, payment: payment && { id: payment.id } })) }))}
      people={people}
      summary={summary}
      accounts={accounts}
      now={now}
    />
  );
}
