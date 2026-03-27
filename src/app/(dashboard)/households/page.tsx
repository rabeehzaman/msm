import { getHouseholds, getHouseholdStats } from "@/lib/queries/households";
import { getWards } from "@/lib/queries/wards";
import { HouseholdsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function HouseholdsPage() {
  const [householdsData, stats, wardsData] = await Promise.all([
    getHouseholds(),
    getHouseholdStats(),
    getWards(),
  ]);

  return (
    <HouseholdsClient
      households={householdsData}
      stats={stats}
      wards={wardsData}
    />
  );
}
