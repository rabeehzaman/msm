import { getMembers, getMemberStats } from "@/lib/queries/members";
import { getHouseholds } from "@/lib/queries/households";
import { MembersClient } from "./client";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const [membersData, stats, householdsData] = await Promise.all([
    getMembers(),
    getMemberStats(),
    getHouseholds(),
  ]);

  return (
    <MembersClient
      members={membersData}
      stats={stats}
      households={householdsData}
    />
  );
}
