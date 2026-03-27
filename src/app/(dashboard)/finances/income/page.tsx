import { getIncomeEntries, getFunds } from "@/lib/queries/finance";
import { IncomeClient } from "./client";

export const dynamic = "force-dynamic";

export default async function IncomePage() {
  const [entries, funds] = await Promise.all([
    getIncomeEntries(),
    getFunds(),
  ]);

  return <IncomeClient entries={entries} funds={funds} />;
}
