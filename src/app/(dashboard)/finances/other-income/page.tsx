import { getActiveAccounts } from "@/lib/queries/accounts";
import { getIncomeFunds, getIncomeHeads, getOtherIncome } from "@/lib/queries/other-income";
import { dateRange } from "@/lib/reports/helpers";
import { OtherIncomeClient } from "./client";

export const dynamic = "force-dynamic";

export default async function OtherIncomePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; head?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const { from, to } = dateRange(params, 1);
  const headId = /^[0-9a-f-]{36}$/i.test(params.head ?? "") ? params.head! : null;
  const q = (params.q ?? "").slice(0, 100);
  const page = Math.max(1, Math.floor(Number(params.page)) || 1);
  const [list, heads, funds, accounts] = await Promise.all([
    getOtherIncome({ from, to, headId, q, page }),
    getIncomeHeads(),
    getIncomeFunds(),
    getActiveAccounts(),
  ]);
  return (
    <OtherIncomeClient
      list={list}
      heads={heads}
      funds={funds}
      accounts={accounts}
      filter={{ from, to, headId, q, page }}
    />
  );
}
