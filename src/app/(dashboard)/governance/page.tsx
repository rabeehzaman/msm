import { getCommittees, getMeetings } from "@/lib/queries/lifecycle";
import { GovernanceClient } from "./client";

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const [committees, meetings] = await Promise.all([
    getCommittees(),
    getMeetings(),
  ]);

  return <GovernanceClient committees={committees} meetings={meetings} />;
}
