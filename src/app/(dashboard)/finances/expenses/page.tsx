import { getExpenseEntries, getFunds } from "@/lib/queries/finance";
import { ExpensesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const [entries, funds] = await Promise.all([
    getExpenseEntries(),
    getFunds(),
  ]);

  return <ExpensesClient entries={entries} funds={funds} />;
}
