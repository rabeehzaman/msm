"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Download, FileText, Loader2, Printer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field, NativeSelect } from "@/components/money/form";
import { PageHeader } from "@/components/money/page-header";
import { formatDate, formatMoney, MONTHS } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import type { ReportColumn, ReportResult } from "@/lib/reports/types";

function cellText(column: ReportColumn, value: unknown, t: (s: string) => string) {
  if (value === null || value === undefined || value === "") return "";
  if (column.kind === "money") return formatMoney(value as number);
  if (column.kind === "date") return formatDate(String(value));
  if (column.translate) return t(String(value));
  return String(value);
}

export function ReportView({ report }: { report: ReportResult }) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const [exporting, setExporting] = useState(false);

  async function exportExcel() {
    setExporting(true);
    try {
      const { default: writeExcelFile } = await import("write-excel-file/browser");
      const header = report.columns.map((c) => ({ value: t(c.label), fontWeight: "bold" as const }));
      const toCell = (c: ReportColumn, value: unknown) =>
        c.kind === "money" && value !== null && value !== undefined && value !== ""
          ? { type: Number, value: Number(value), format: "#,##0.00" }
          : { type: String, value: cellText(c, value, t) };
      const body = report.rows.map((row) => report.columns.map((c) => toCell(c, row[c.key])));
      const footer = report.totals
        ? [report.columns.map((c) => ({ ...toCell(c, report.totals![c.key]), fontWeight: "bold" as const }))]
        : [];
      await writeExcelFile([header, ...body, ...footer], {
        columns: report.columns.map((c) => ({ width: c.kind === "money" ? 14 : c.kind === "date" ? 12 : 26 })),
      }).toFile(`${report.slug}.xlsx`);
    } catch (e) {
      console.error(e);
      toast.error(t("Could not create the Excel file."));
    } finally {
      setExporting(false);
    }
  }

  function applyFilters(formData: FormData) {
    const params = new URLSearchParams();
    for (const [k, v] of formData.entries()) if (v) params.set(k, String(v));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={report.title} subtitle={report.subtitle}>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="size-4" />
          {t("Print")}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.info(t('In the print window, choose "Save as PDF".'));
            window.setTimeout(() => window.print(), 300);
          }}
        >
          <FileText className="size-4" />
          PDF
        </Button>
        <Button variant="outline" onClick={exportExcel} disabled={exporting}>
          {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          Excel
        </Button>
      </PageHeader>

      {report.filters.length > 0 && (
        <Card className="no-print">
          <CardContent>
            <form action={applyFilters} className="flex flex-wrap items-end gap-3">
              {report.filters.map((f) => (
                <Field key={f.name} label={t(f.label)} className="w-full sm:w-44">
                  {f.type === "date" ? (
                    <Input type="date" name={f.name} defaultValue={f.value} />
                  ) : (
                    <NativeSelect name={f.name} defaultValue={f.value} key={f.value}>
                      {(f.type === "month"
                        ? MONTHS.map((m, i) => ({ value: String(i + 1), label: t(m) }))
                        : (f.options ?? [])
                      ).map((o) => (
                        <option key={o.value} value={o.value}>
                          {f.type === "month" ? o.label : t(o.label)}
                        </option>
                      ))}
                    </NativeSelect>
                  )}
                </Field>
              ))}
              <Button type="submit">
                <Search className="size-4" />
                {t("Show")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {report.summary && report.summary.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {report.summary.map((s) => (
            <div key={s.label} data-slot="card" className="glass rounded-2xl p-4">
              <p className="text-muted-foreground text-sm font-medium">{t(s.label)}</p>
              <p className="font-heading mt-1 text-xl font-semibold">
                {typeof s.value === "number" ? formatMoney(s.value) : s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardContent>
          {report.rows.length === 0 ? (
            <EmptyState message={t("Nothing to show for this selection.")} />
          ) : (
            <div className="table-shell overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {report.columns.map((c) => (
                      <TableHead key={c.key} className={c.kind === "money" ? "text-right" : ""}>
                        {t(c.label)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.rows.map((row, i) => (
                    <TableRow key={i}>
                      {report.columns.map((c) => (
                        <TableCell
                          key={c.key}
                          className={`${c.kind === "money" ? "text-right tabular-nums" : ""} ${c.wrap ? "min-w-40 whitespace-normal" : "whitespace-nowrap"}`}
                        >
                          {cellText(c, row[c.key], t)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
                {report.totals && (
                  <TableFooter>
                    <TableRow>
                      {report.columns.map((c) => (
                        <TableCell key={c.key} className={`font-semibold ${c.kind === "money" ? "text-right tabular-nums" : ""}`}>
                          {cellText(c, report.totals![c.key], t)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
