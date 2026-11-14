"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, CircleAlert, HandCoins, Hourglass, Moon, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { NativeSelect, type AccountOption } from "@/components/money/form";
import { PageHeader, StatCard } from "@/components/money/page-header";
import { cellClass } from "@/components/rent/cell";
import { payableLines, SalarySheet, type SalarySheetTarget, type SheetPerson } from "@/components/salary/salary-sheet";
import { useSession } from "@/lib/auth/session";
import { formatMoney, MONTHS } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import type { CellStatus } from "@/lib/rent/status";
import { checkSalaryMonth, isSalaryMonthOpen, staffRoleLabel, type SalarySummary, type YearMonth } from "@/lib/salary/calc";

type Cell = { month: number; status: CellStatus; payment: { id: string } | null };

type Row = { staffId: string; name: string; role: string; kind: "salary" | "cleaning"; months: Cell[] };

export function SalariesClient({
  year,
  currentYear,
  rows,
  people,
  summary,
  accounts,
  now,
}: {
  year: number;
  currentYear: number;
  rows: Row[];
  people: SheetPerson[];
  summary: SalarySummary;
  accounts: AccountOption[];
  now: YearMonth;
}) {
  const t = useT();
  const router = useRouter();
  const { canEnter } = useSession();
  const [target, setTarget] = useState<SalarySheetTarget | null>(null);

  function openCell(row: Row, cell: Cell) {
    const person = people.find((p) => p.id === row.staffId);
    if (cell.status === "vacant" && !cell.payment) {
      // Before joining / "Count dues from", or after they were marked inactive: say which.
      const problem = person && !isSalaryMonthOpen(person, year, cell.month) ? checkSalaryMonth(person, row.kind, year, cell.month) : null;
      toast.info(problem ? t(problem.message, problem.vars) : t("Nothing is due for this month."));
      return;
    }
    if (canEnter) setTarget({ lines: [{ staffId: row.staffId, kind: row.kind }], year, month: cell.month });
  }

  // A Salary Month saved in another year shows under that year.
  function saved(salaryMonth: YearMonth) {
    if (salaryMonth.year !== year) router.push(`/salaries?year=${salaryMonth.year}`);
    else router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Salaries" subtitle="Tap a month to pay. The amount is taken out of Cash or Bank.">
        {canEnter && payableLines(people).length > 0 && (
          <Button onClick={() => setTarget({ lines: payableLines(people) })}>
            <HandCoins className="size-4" />
            {t("Pay salary")}
          </Button>
        )}
        <Button variant="outline" render={<Link href="/salaries/staff" />}>
          <Users className="size-4" />
          {t("Staff")}
        </Button>
        <Button variant="outline" render={<Link href="/salaries/ramadan" />}>
          <Moon className="size-4" />
          {t("Ramadan allowance")}
        </Button>
      </PageHeader>

      {/* All by Salary Month: a February salary paid in November counts for February. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Payable this month" value={formatMoney(summary.payable)} icon={Wallet} />
        <StatCard label="Paid this month" value={formatMoney(summary.paid)} icon={Check} tone="stat-icon-gold" />
        <StatCard
          label="Pending this month"
          value={formatMoney(summary.thisMonthPending)}
          caption={t("{n} unpaid", { n: summary.thisMonthPendingCount })}
          icon={CircleAlert}
          tone="stat-icon-rose"
        />
        <StatCard
          label="Salaries pending"
          value={formatMoney(summary.pendingAmount)}
          caption={t("{n} months", { n: summary.pendingCount })}
          icon={Hourglass}
          tone="stat-icon-rose"
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <NativeSelect
            aria-label={t("Year")}
            className="w-28"
            value={year}
            onChange={(e) => router.push(`/salaries?year=${e.target.value}`)}
          >
            {[...new Set([...Array.from({ length: 8 }, (_, i) => currentYear + 1 - i), year])].sort((a, b) => b - a).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </NativeSelect>

          {rows.length === 0 ? (
            <EmptyState message={t("Add staff first, then salaries appear here.")} />
          ) : (
            <div className="table-shell overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-1 text-sm">
                <thead>
                  <tr>
                    <th className="bg-surface sticky left-0 z-10 min-w-36 px-2 py-1 text-left font-medium">{t("Staff")}</th>
                    {MONTHS.map((m) => (
                      <th key={m} className="text-muted-foreground px-1 py-1 text-center text-xs font-medium">
                        {t(m)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={`${row.staffId}-${row.kind}`}>
                      <td className="bg-surface sticky left-0 z-10 px-2 py-1">
                        <span className="block max-w-36 truncate font-medium">{row.name}</span>
                        <span className="text-muted-foreground block text-xs">
                          {t(row.kind === "cleaning" ? "Cleaning fee" : (staffRoleLabel[row.role] ?? "Other"))}
                        </span>
                      </td>
                      {row.months.map((cell) => (
                        <td key={cell.month} className="p-0">
                          <button
                            type="button"
                            onClick={() => openCell(row, cell)}
                            aria-label={`${row.name}, ${t(MONTHS[cell.month - 1])} ${year}`}
                            className={`flex h-11 w-full min-w-10 items-center justify-center rounded-lg transition-transform active:scale-95 ${cellClass[cell.status]}`}
                          >
                            {cell.status === "paid" && <Check className="size-4" />}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {target && (
        <SalarySheet
          target={target}
          people={people}
          accounts={accounts}
          now={now}
          onClose={() => setTarget(null)}
          onSaved={saved}
        />
      )}
    </div>
  );
}
