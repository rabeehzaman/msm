import { getAccountsWithBalances, getRecentLedger } from "@/lib/queries/accounts";
import { CashBankClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CashBankPage() {
  const [accounts, recent] = await Promise.all([getAccountsWithBalances(), getRecentLedger(15)]);
  return <CashBankClient accounts={accounts} recent={recent} />;
}
