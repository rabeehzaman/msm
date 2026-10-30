import { getActiveAccounts } from "@/lib/queries/accounts";
import { getMaintenanceLogs } from "@/lib/queries/expenses";
import { getBuildingTree } from "@/lib/queries/rent";
import { MaintenanceClient } from "./client";

export const dynamic = "force-dynamic";

const validId = (v?: string) => (v && /^[0-9a-f-]{36}$/i.test(v) ? v : undefined);

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ building?: string; room?: string }>;
}) {
  const params = await searchParams;
  const building = validId(params.building);
  const room = validId(params.room);
  const [logs, tree, accounts] = await Promise.all([
    getMaintenanceLogs(building, room),
    getBuildingTree(),
    getActiveAccounts(),
  ]);
  return <MaintenanceClient logs={logs} tree={tree} accounts={accounts} building={building ?? ""} room={room ?? ""} />;
}
