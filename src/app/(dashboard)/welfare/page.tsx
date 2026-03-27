import { getWelfareApplications } from "@/lib/queries/lifecycle";
import { WelfareClient } from "./client";

export const dynamic = "force-dynamic";

export default async function WelfarePage() {
  const applications = await getWelfareApplications();

  return <WelfareClient applications={applications} />;
}
