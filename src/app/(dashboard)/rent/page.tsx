import { getActiveAccounts } from "@/lib/queries/accounts";
import { getRentRooms, getRentSummary } from "@/lib/queries/rent";
import { currentYearMonth } from "@/lib/format";
import { RentClient } from "./client";

export const dynamic = "force-dynamic";

export default async function RentPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const params = await searchParams;
  const now = currentYearMonth();
  const year = Number(params.year) >= 2000 && Number(params.year) <= 2100 ? Number(params.year) : now.year;
  // One load of the room facts serves both the grid and the totals (memoised per request).
  const [rooms, summary, accounts] = await Promise.all([getRentRooms(), getRentSummary(), getActiveAccounts()]);
  return <RentClient initialYear={year} rooms={rooms} summary={summary} accounts={accounts} now={now} />;
}
