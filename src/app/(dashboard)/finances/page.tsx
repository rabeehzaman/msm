import { getFinanceDashboardStats, getIncomeEntries, getExpenseEntries } from "@/lib/queries/finance";
import { FinancesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function FinancesPage() {
  const [stats, recentIncome, recentExpenses] = await Promise.all([
    getFinanceDashboardStats(),
    getIncomeEntries(),
    getExpenseEntries(),
  ]);

  return (
    <FinancesClient
      stats={stats}
      recentIncome={recentIncome}
      recentExpenses={recentExpenses}
    />
  );
}
