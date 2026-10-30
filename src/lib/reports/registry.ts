import { cashReports } from "./cash";
import { rentReports } from "./rent";
import { salaryReports } from "./salary";
import type { ReportDefinition } from "./types";

export const reports: ReportDefinition[] = [...cashReports, ...rentReports, ...salaryReports];

export const findReport = (slug: string) => reports.find((r) => r.slug === slug);
