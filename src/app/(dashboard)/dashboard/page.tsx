import { getDashboardStats } from "@/lib/queries/lifecycle";
import { getFinanceDashboardStats } from "@/lib/queries/finance";
import { DashboardClient } from "./client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, financeStats] = await Promise.all([
    getDashboardStats(),
    getFinanceDashboardStats(),
  ]);

  return <DashboardClient stats={stats} financeStats={financeStats} />;
}
