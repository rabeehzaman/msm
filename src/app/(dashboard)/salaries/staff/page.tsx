import { getStaffFacts } from "@/lib/queries/salary";
import { StaffClient } from "./client";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const people = await getStaffFacts();
  return <StaffClient people={people} />;
}
