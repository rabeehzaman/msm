import { getFunds, getExpenseEntries } from "@/lib/queries/finance";
import { QardHasanClient } from "./client";

export const dynamic = "force-dynamic";

export default async function QardHasanPage() {
  const [funds, allExpenses] = await Promise.all([
    getFunds(),
    getExpenseEntries(),
  ]);

  const qardFund = funds.find((f) => f.type === "qard_hasan") || null;

  const disbursements = qardFund
    ? allExpenses.filter((e) => e.fundId === qardFund.id)
    : [];

  return (
    <QardHasanClient
      qardFund={qardFund}
      disbursements={disbursements}
    />
  );
}
