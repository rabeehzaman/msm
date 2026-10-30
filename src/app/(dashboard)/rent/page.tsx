import { getActiveAccounts } from "@/lib/queries/accounts";
import { getRentGrid, getRentSummary } from "@/lib/queries/rent";
import { currentYearMonth } from "@/lib/format";
import { RentClient } from "./client";

export const dynamic = "force-dynamic";

export default async function RentPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const params = await searchParams;
  const now = currentYearMonth();
  const year = Number(params.year) >= 2000 && Number(params.year) <= 2100 ? Number(params.year) : now.year;
  const [rooms, summary, accounts] = await Promise.all([getRentGrid(year), getRentSummary(), getActiveAccounts()]);
  return <RentClient year={year} rooms={rooms} summary={summary} accounts={accounts} currentYear={now.year} />;
}
