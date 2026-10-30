import { ReportsHub } from "./client";
import { reports } from "@/lib/reports/registry";

export default function ReportsPage() {
  return (
    <ReportsHub
      reports={reports.map(({ slug, title, description, group }) => ({ slug, title, description, group }))}
    />
  );
}
