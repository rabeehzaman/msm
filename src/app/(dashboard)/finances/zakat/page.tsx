import { getFunds, getIncomeEntries, getExpenseEntries } from "@/lib/queries/finance";
import { getActiveAccounts } from "@/lib/queries/accounts";
import { ZakatClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ZakatPage() {
  const [funds, accounts] = await Promise.all([getFunds(), getActiveAccounts()]);
  const zakatFund = funds.find((f) => f.type === "zakat") || null;
  const [zakatIncome, zakatExpenses] = zakatFund
    ? await Promise.all([getIncomeEntries(zakatFund.id), getExpenseEntries(zakatFund.id)])
    : [[], []];

  return (
    <ZakatClient
      zakatFund={zakatFund}
      income={zakatIncome}
      expenses={zakatExpenses}
      accounts={accounts}
    />
  );
}
