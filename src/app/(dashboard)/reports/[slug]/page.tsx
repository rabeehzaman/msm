import { notFound } from "next/navigation";
import { ReportView } from "@/components/reports/report-view";
import { findReport } from "@/lib/reports/registry";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const definition = findReport(slug);
  if (!definition) notFound();
  const raw = await searchParams;
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const report = await definition.build(flat);
  if (!report) notFound();
  return <ReportView report={report} />;
}
