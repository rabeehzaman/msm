import { getMonthlyAttendance, getPendingFees } from "@/lib/queries/fees";
import { getClasses } from "@/lib/queries/madrasa";
import { MONTHS } from "@/lib/format";
import { monthFilter, sumBy, yearFilter } from "./helpers";
import type { ReportDefinition, ReportRow } from "./types";

export const madrasaReports: ReportDefinition[] = [
  {
    slug: "attendance-monthly",
    title: "Monthly attendance",
    description: "Days present, total days and percentage, per student and class",
    group: "Madrasa",
    build: async (params) => {
      const classes = await getClasses();
      const classId = classes.find((c) => c.id === params.class)?.id ?? classes[0]?.id;
      const { year, filter: yearF } = yearFilter(params);
      const { month, filter: monthF } = monthFilter(params);
      const columns = [
        { key: "admission", label: "Admission number" },
        { key: "name", label: "Name" },
        { key: "present", label: "Days present" },
        { key: "total", label: "Total days" },
        { key: "percent", label: "Percentage" },
      ];
      if (!classId) return { slug: "attendance-monthly", title: "Monthly attendance", filters: [], columns, rows: [] };
      const { rows: list, totalDays } = await getMonthlyAttendance(classId, year, month);
      const rows: ReportRow[] = list.map((r) => ({
        admission: r.admissionNumber,
        name: r.fullName,
        present: r.present,
        total: r.marked,
        percent: r.percent === null ? null : `${r.percent}%`,
      }));
      const present = list.reduce((s, r) => s + r.present, 0);
      const marked = list.reduce((s, r) => s + r.marked, 0);
      return {
        slug: "attendance-monthly",
        title: "Monthly attendance",
        subtitle: `${classes.find((c) => c.id === classId)?.name} · ${MONTHS[month - 1]} ${year}`,
        filters: [
          { name: "class", label: "Class", type: "select", value: classId, options: classes.map((c) => ({ value: c.id, label: c.name })) },
          monthF,
          yearF,
        ],
        columns,
        rows,
        totals: { name: "Class", present, total: marked, percent: marked ? `${Math.round((present / marked) * 1000) / 10}%` : null },
        summary: [{ label: "Days the register was taken", value: String(totalDays) }],
      };
    },
  },
  {
    slug: "pending-fees",
    title: "Pending fee list",
    description: "What each student still owes",
    group: "Madrasa",
    build: async () => {
      const list = await getPendingFees();
      const rows: ReportRow[] = list.map((p) => ({
        admission: p.admissionNumber,
        name: p.studentName,
        className: p.className,
        fee: p.feeType,
        pending: p.pending,
      }));
      return {
        slug: "pending-fees",
        title: "Pending fee list",
        filters: [],
        columns: [
          { key: "admission", label: "Admission number" },
          { key: "name", label: "Name" },
          { key: "className", label: "Class" },
          { key: "fee", label: "Fee" },
          { key: "pending", label: "Pending", kind: "money" },
        ],
        rows,
        totals: { name: "Total", pending: sumBy(rows, "pending") },
      };
    },
  },
];
