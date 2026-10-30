import { getActiveAccounts } from "@/lib/queries/accounts";
import { getFeePayments, getFeeTypes, getPendingFees } from "@/lib/queries/fees";
import { getClasses, getStudents } from "@/lib/queries/madrasa";
import { FeesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function FeesPage() {
  const [feeTypes, pending, payments, classes, students, accounts] = await Promise.all([
    getFeeTypes(),
    getPendingFees(),
    getFeePayments(30),
    getClasses(),
    getStudents(),
    getActiveAccounts(),
  ]);
  return (
    <FeesClient
      feeTypes={feeTypes}
      pending={pending}
      payments={payments}
      classes={classes}
      students={students.map((s) => ({ id: s.id, name: s.fullName, className: s.className }))}
      accounts={accounts}
    />
  );
}
