import { getActiveAccounts } from "@/lib/queries/accounts";
import { getStaffFacts } from "@/lib/queries/salary";
import { currentYearMonth } from "@/lib/format";
import { StaffClient } from "./client";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const [people, accounts] = await Promise.all([getStaffFacts(), getActiveAccounts()]);
  return <StaffClient people={people} accounts={accounts} now={currentYearMonth()} />;
}
