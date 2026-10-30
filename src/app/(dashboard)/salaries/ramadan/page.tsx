import { getAllowances, getStaffFacts } from "@/lib/queries/salary";
import { RamadanClient } from "./client";

export const dynamic = "force-dynamic";

export default async function RamadanPage() {
  const [allowances, people] = await Promise.all([getAllowances(), getStaffFacts()]);
  return (
    <RamadanClient
      allowances={allowances}
      staff={people.filter((p) => p.isActive).map((p) => ({ id: p.id, name: p.name }))}
    />
  );
}
