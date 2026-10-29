import { getBloodDonors } from "@/lib/queries/community";
import { BloodDonorsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function BloodDonorsPage() {
  const donors = await getBloodDonors();

  return <BloodDonorsClient donors={donors} />;
}
