"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, CircleAlert, Moon, Printer, Trash2, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { ConfirmButton } from "@/components/money/confirm-button";
import { AccountPicker, Field, NativeSelect, SaveButton, useAction, type AccountOption } from "@/components/money/form";
import { PageHeader, StatCard } from "@/components/money/page-header";
import { cellClass } from "@/components/rent/cell";
import { deleteSalaryPayment, paySalary, updateSalaryPayment } from "@/lib/actions/salary";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, MONTHS, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import type { CellStatus } from "@/lib/rent/status";
import { staffRoleLabel } from "@/lib/salary/calc";

type Payment = {
  id: string;
  basic: string;
  cleaning: string;
  ramadan: string;
  otherAdditions: string;
  otherNote: string | null;
  amount: string;
  paidDate: string;
  accountId: string;
  accountName: string | null;
  note: string | null;
};

type Cell = {
  month: number;
  status: CellStatus;
  expected: { basic: number; cleaning: number; ramadan: number; total: number };
  payment: Payment | null;
};

type Row = { staffId: string; name: string; role: string; kind: "salary" | "cleaning"; months: Cell[] };

type Target = { row: Row; cell: Cell };

export function SalariesClient({
  year,
  currentYear,
  rows,
  summary,
  accounts,
}: {
  year: number;
  currentYear: number;
  rows: Row[];
  summary: { payable: number; paid: number; pendingCount: number; pendingAmount: number };
  accounts: AccountOption[];
}) {
  const t = useT();
  const router = useRouter();
  const { canEnter } = useSession();
  const [target, setTarget] = useState<Target | null>(null);

  function openCell(row: Row, cell: Cell) {
    if (cell.status === "vacant") {
      toast.info(t("Nothing is due for this month."));
      return;
    }
    if (canEnter) setTarget({ row, cell });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Salaries" subtitle="Tap a month to pay. The amount is taken out of Cash or Bank.">
        <Button variant="outline" render={<Link href="/salaries/staff" />}>
          <Users className="size-4" />
          {t("Staff")}
        </Button>
        <Button variant="outline" render={<Link href="/salaries/ramadan" />}>
          <Moon className="size-4" />
          {t("Ramadan allowance")}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Payable this month" value={formatMoney(summary.payable)} icon={Wallet} />
        <StatCard label="Paid this month" value={formatMoney(summary.paid)} icon={Check} tone="stat-icon-gold" />
        <StatCard
          label="Pending this month"
          value={formatMoney(summary.pendingAmount)}
          caption={t("{n} unpaid", { n: summary.pendingCount })}
          icon={CircleAlert}
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
            {Array.from({ length: 8 }, (_, i) => currentYear + 1 - i).map((y) => (
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

      {target && <SalarySheet target={target} year={year} accounts={accounts} onClose={() => setTarget(null)} />}
    </div>
  );
}

function SalarySheet({
  target,
  year,
  accounts,
  onClose,
}: {
  target: Target;
  year: number;
  accounts: AccountOption[];
  onClose: () => void;
}) {
  const t = useT();
  const router = useRouter();
  const { isAdmin, canEnter } = useSession();
  const { row, cell } = target;
  const { payment, expected } = cell;
  const isCleaning = row.kind === "cleaning";
  const [lines, setLines] = useState({
    basic: String(payment?.basic ?? expected.basic),
    cleaning: String(payment?.cleaning ?? expected.cleaning),
    ramadan: String(payment?.ramadan ?? expected.ramadan),
    otherAdditions: String(payment?.otherAdditions ?? 0),
  });
  const total = Object.values(lines).reduce((s, v) => s + Math.round(Number(v || 0) * 100), 0) / 100;
  const done = () => {
    onClose();
    router.refresh();
  };
  const pay = useAction(paySalary, { success: "Salary saved", onDone: done });
  const update = useAction(updateSalaryPayment, { success: "Salary updated", onDone: done });
  const remove = useAction(deleteSalaryPayment, { success: "Month un-ticked. The amount was put back.", onDone: done });
  const canEdit = payment ? isAdmin : canEnter;

  const amountField = (key: keyof typeof lines, label: string) => (
    <Field label={t(label)}>
      <Input
        name={key}
        type="number"
        step="0.01"
        min="0"
        inputMode="decimal"
        value={lines[key]}
        onChange={(e) => setLines({ ...lines, [key]: e.target.value })}
      />
    </Field>
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t(MONTHS[cell.month - 1])} {year} · {row.name}
          </DialogTitle>
          <DialogDescription>{t(isCleaning ? "Cleaning fee, paid separately" : "Salary")}</DialogDescription>
        </DialogHeader>

        {payment && (
          <div className="bg-primary/5 flex flex-wrap items-center justify-between gap-2 rounded-xl p-3 text-sm">
            <span>
              {t("Paid {amount} on {date}", { amount: formatMoney(payment.amount), date: formatDate(payment.paidDate) })}
              {payment.accountName ? ` · ${payment.accountName}` : ""}
            </span>
            <Button variant="outline" size="sm" render={<Link href={`/receipts/salary/${payment.id}`} />}>
              <Printer className="size-3.5" />
              {t("Salary slip")}
            </Button>
          </div>
        )}

        {canEdit && (
          <form onSubmit={payment ? update.submit : pay.submit} className="flex flex-col gap-4">
            {payment ? (
              <input type="hidden" name="id" value={payment.id} />
            ) : (
              <>
                <input type="hidden" name="staffId" value={row.staffId} />
                <input type="hidden" name="year" value={year} />
                <input type="hidden" name="month" value={cell.month} />
                <input type="hidden" name="kind" value={row.kind} />
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              {!isCleaning && amountField("basic", "Basic salary")}
              {amountField("cleaning", "Cleaning fee")}
              {!isCleaning && amountField("ramadan", "Ramadan allowance")}
              {amountField("otherAdditions", "Other additions")}
            </div>
            <Field label={t("About the other additions")}>
              <Input name="otherNote" defaultValue={payment?.otherNote ?? ""} />
            </Field>
            <div className="bg-primary/5 flex items-center justify-between rounded-xl p-3">
              <span className="text-sm font-medium">{t("Total")}</span>
              <span className="font-heading text-xl font-semibold tabular-nums">{formatMoney(total)}</span>
            </div>
            <Field label={t("Payment date")}>
              <Input name="paidDate" type="date" defaultValue={payment?.paidDate ?? todayIST()} required />
            </Field>
            <AccountPicker accounts={accounts} label={t("Paid via")} defaultValue={payment?.accountId} />
            <Field label={t("Note")}>
              <Input name="note" defaultValue={payment?.note ?? ""} />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SaveButton pending={pay.pending || update.pending} />
              {payment && (
                <ConfirmButton
                  title="Un-tick this month?"
                  description="The payment is removed and the amount goes back into Cash/Bank. This is logged."
                  confirmLabel="Un-tick"
                  onConfirm={() => remove.call(payment.id)}
                  trigger={
                    <Button type="button" variant="ghost" className="text-destructive" disabled={remove.pending}>
                      <Trash2 className="size-4" />
                      {t("Un-tick")}
                    </Button>
                  }
                />
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
