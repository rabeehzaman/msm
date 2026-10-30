import { getActiveAccounts } from "@/lib/queries/accounts";
import { getBillAccounts, getBills, getExpenseCategories } from "@/lib/queries/expenses";
import { BillsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function BillsPage() {
  const [billAccounts, bills, categories, accounts] = await Promise.all([
    getBillAccounts(),
    getBills(),
    getExpenseCategories(),
    getActiveAccounts(),
  ]);
  return <BillsClient billAccounts={billAccounts} bills={bills} categories={categories} accounts={accounts} />;
}
