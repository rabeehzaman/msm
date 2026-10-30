import { getFunds, getExpenseEntries } from "@/lib/queries/finance";
import { getActiveAccounts } from "@/lib/queries/accounts";
import { QardHasanClient } from "./client";

export const dynamic = "force-dynamic";

export default async function QardHasanPage() {
  const [funds, accounts] = await Promise.all([getFunds(), getActiveAccounts()]);
  const qardFund = funds.find((f) => f.type === "qard_hasan") || null;
  const disbursements = qardFund ? await getExpenseEntries(qardFund.id) : [];

  return (
    <QardHasanClient
      qardFund={qardFund}
      disbursements={disbursements}
      accounts={accounts}
    />
  );
}
