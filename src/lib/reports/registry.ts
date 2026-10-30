import { cashReports } from "./cash";
import type { ReportDefinition } from "./types";

export const reports: ReportDefinition[] = [...cashReports];

export const findReport = (slug: string) => reports.find((r) => r.slug === slug);
