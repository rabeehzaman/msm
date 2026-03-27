import { getWards } from "@/lib/queries/wards";
import { WardsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function WardsPage() {
  const wardsData = await getWards();
  return <WardsClient wards={wardsData} />;
}
