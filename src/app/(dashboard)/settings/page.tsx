import { ensureTenant } from "@/lib/queries/auth";
import { SettingsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const tenant = await ensureTenant();

  return <SettingsClient tenant={tenant} />;
}
