import { cashReports } from "./cash";
import { rentReports } from "./rent";
import type { ReportDefinition } from "./types";

export const reports: ReportDefinition[] = [...cashReports, ...rentReports];

export const findReport = (slug: string) => reports.find((r) => r.slug === slug);
