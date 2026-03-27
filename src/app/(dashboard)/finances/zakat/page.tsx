import { getFunds, getIncomeEntries, getExpenseEntries } from "@/lib/queries/finance";
import { ZakatClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ZakatPage() {
  const [funds, allIncome, allExpenses] = await Promise.all([
    getFunds(),
    getIncomeEntries(),
    getExpenseEntries(),
  ]);

  const zakatFund = funds.find((f) => f.type === "zakat") || null;

  // Filter income/expenses for zakat fund
  const zakatIncome = zakatFund
    ? allIncome.filter((i) => i.fundId === zakatFund.id)
    : [];
  const zakatExpenses = zakatFund
    ? allExpenses.filter((e) => e.fundId === zakatFund.id)
    : [];

  return (
    <ZakatClient
      zakatFund={zakatFund}
      income={zakatIncome}
      expenses={zakatExpenses}
    />
  );
}
