import { getActiveAccounts } from "@/lib/queries/accounts";
import { getExpenseCategories, getExpenses } from "@/lib/queries/expenses";
import { getFunds } from "@/lib/queries/finance";
import { dateRange } from "@/lib/reports/helpers";
import { ExpensesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = dateRange(await searchParams, 1);
  const [entries, categories, funds, accounts] = await Promise.all([
    getExpenses(from, to),
    getExpenseCategories(),
    getFunds(),
    getActiveAccounts(),
  ]);
  return <ExpensesClient entries={entries} categories={categories} funds={funds} accounts={accounts} from={from} to={to} />;
}
