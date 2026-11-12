import { cashReports, expenseReports } from "./cash";
import { collectionReports } from "./collections";
import { madrasaReports } from "./madrasa";
import { otherIncomeReports } from "./other-income";
import { rentReports } from "./rent";
import { salaryReports } from "./salary";
import type { ReportDefinition } from "./types";

export const reports: ReportDefinition[] = [...cashReports, ...rentReports, ...salaryReports, ...expenseReports, ...collectionReports, ...otherIncomeReports, ...madrasaReports];

export const findReport = (slug: string) => reports.find((r) => r.slug === slug);
