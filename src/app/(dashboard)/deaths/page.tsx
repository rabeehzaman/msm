import { getDeaths } from "@/lib/queries/lifecycle";
import { DeathsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function DeathsPage() {
  const deaths = await getDeaths();

  return <DeathsClient deaths={deaths} />;
}
