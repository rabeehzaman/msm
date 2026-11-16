import { cookies } from "next/headers";
import { getDashboardStats } from "@/lib/queries/lifecycle";
import { getFunds } from "@/lib/queries/finance";
import { getDashboardPeriod } from "@/lib/queries/dashboard";
import { todayIST } from "@/lib/format";
import { DEFAULT_PERIOD, parsePeriod, PERIOD_COOKIE, resolvePeriod } from "@/lib/period";
import { DashboardClient } from "./client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // The period chosen earlier in this session, else This Month.
  const saved = parsePeriod((await cookies()).get(PERIOD_COOKIE)?.value);
  const period = resolvePeriod(saved ?? DEFAULT_PERIOD, todayIST());
  const [stats, money] = await Promise.all([
    getDashboardStats(),
    getDashboardPeriod(period.from, period.to),
    // Sets up the standard funds the first time a Mahallu opens the app, as before.
    getFunds(),
  ]);

  return <DashboardClient stats={stats} initialPeriod={period} initialMoney={money} />;
}
