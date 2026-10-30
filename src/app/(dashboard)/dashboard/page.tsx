import { getDashboardStats } from "@/lib/queries/lifecycle";
import { getFinanceDashboardStats } from "@/lib/queries/finance";
import { getTreasurerDashboard } from "@/lib/queries/dashboard";
import { DashboardClient } from "./client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, financeStats, money] = await Promise.all([
    getDashboardStats(),
    getFinanceDashboardStats(),
    getTreasurerDashboard(),
  ]);

  return <DashboardClient stats={stats} financeStats={financeStats} money={money} />;
}
