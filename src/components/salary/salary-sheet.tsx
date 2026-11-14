"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ConfirmButton } from "@/components/money/confirm-button";
import { AccountPicker, Field, NativeSelect, SaveButton, useAction, type AccountOption } from "@/components/money/form";
import { Notice } from "@/components/money/notice";
import { deleteSalaryPayment, paySalary, updateSalaryPayment } from "@/lib/actions/salary";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, MONTHS, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import {
  checkSalaryMonth, defaultSalaryMonth, expectedLines, firstSalaryMonth, paymentFor, salaryLines,
  type SalaryKind, type SalaryPerson, type YearMonth,
} from "@/lib/salary/calc";

export type SheetPayment = {
  id: string;
  year: number;
  month: number;
  kind: string;
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

// Everything the popup needs to check any Salary Month for a person, without asking the server.
export type SheetPerson = SalaryPerson<SheetPayment> & { role: string };

export type SalaryLine = { staffId: string; kind: SalaryKind };

// Opened from a month cell: that line and month. Opened from a button: a choice of lines, and the
// Salary Month starts on the oldest unpaid month (else this month).
export type SalarySheetTarget = { lines: SalaryLine[]; year?: number; month?: number };

type Amounts = { basic: string; cleaning: string; ramadan: string; otherAdditions: string };

// Every line that can take a new salary: active staff, and inactive staff with months before they left.
export function payableLines(people: SheetPerson[]): SalaryLine[] {
  return people
    .filter((p) => p.isActive || !!p.inactiveFrom)
    .sort((a, b) => Number(b.isActive) - Number(a.isActive))
    .flatMap((p) => salaryLines(p).map((kind) => ({ staffId: p.id, kind })));
}

const lineKey = (l: SalaryLine) => `${l.staffId}:${l.kind}`;

export function SalarySheet({
  target,
  people,
  accounts,
  now,
  onClose,
  onSaved,
}: {
  target: SalarySheetTarget;
  people: SheetPerson[];
  accounts: AccountOption[];
  now: YearMonth;
  onClose: () => void;
  onSaved?: (salaryMonth: YearMonth) => void;
}) {
  const t = useT();
  const { isAdmin, canEnter } = useSession();
  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const choices = target.lines.filter((l) => byId.has(l.staffId));
  const [line, setLine] = useState<SalaryLine | null>(choices[0] ?? null);
  const person = line ? byId.get(line.staffId) : undefined;
  const kind: SalaryKind = line?.kind ?? "salary";

  const startMonth = (p: SheetPerson | undefined, k: SalaryKind): YearMonth =>
    target.year && target.month ? { year: target.year, month: target.month } : p ? defaultSalaryMonth(p, k, now) : now;
  const [ym, setYm] = useState<YearMonth>(() => startMonth(person, kind));
  // An admin opening a paid month edits that payment, as before. Everyone else starts a new payment.
  const [editingId, setEditingId] = useState<string | null>(() =>
    isAdmin && person ? (paymentFor(person, kind, ym.year, ym.month)?.id ?? null) : null,
  );
  const editing = editingId && person ? (person.payments.find((p) => p.id === editingId) ?? null) : null;

  const amountsFor = (p: SheetPerson | undefined, k: SalaryKind, at: YearMonth, keepOther = "0"): Amounts => {
    const e = p ? expectedLines(p, p.allowances, at.year, at.month, k) : { basic: 0, cleaning: 0, ramadan: 0 };
    return { basic: String(e.basic), cleaning: String(e.cleaning), ramadan: String(e.ramadan), otherAdditions: keepOther };
  };
  const amountsOf = (p: SheetPayment): Amounts => ({
    basic: p.basic,
    cleaning: p.cleaning,
    ramadan: p.ramadan,
    otherAdditions: p.otherAdditions,
  });
  const [amounts, setAmounts] = useState<Amounts>(() => (editing ? amountsOf(editing) : amountsFor(person, kind, ym)));
  const total = Object.values(amounts).reduce((s, v) => s + Math.round(Number(v || 0) * 100), 0) / 100;

  const done = () => {
    onClose();
    onSaved?.(ym);
  };
  const pay = useAction(paySalary, { success: "Salary saved", onDone: done });
  const update = useAction(updateSalaryPayment, { success: "Salary updated", onDone: done });
  const remove = useAction(deleteSalaryPayment, { success: "Month un-ticked. The amount was put back.", onDone: done });

  // A new payment takes the amounts of the chosen month (its rate and Ramadan share). Moving a
  // payment that is being edited keeps what was paid.
  function chooseMonth(next: YearMonth) {
    setYm(next);
    if (!editing) setAmounts(amountsFor(person, kind, next, amounts.otherAdditions));
  }
  function chooseLine(next: SalaryLine) {
    const p = byId.get(next.staffId);
    const at = p ? defaultSalaryMonth(p, next.kind, now) : now;
    setLine(next);
    setEditingId(null);
    setYm(at);
    setAmounts(amountsFor(p, next.kind, at));
  }
  function openPayment(p: SheetPayment) {
    setEditingId(p.id);
    setYm({ year: p.year, month: p.month });
    setAmounts(amountsOf(p));
  }
  function newPayment() {
    setEditingId(null);
    setAmounts(amountsFor(person, kind, ym));
  }

  const years = useMemo(() => {
    const first = person ? firstSalaryMonth(person).year : now.year;
    const from = Math.min(now.year - 1, first, ym.year);
    const to = Math.max(now.year + 1, ym.year);
    return Array.from({ length: to - from + 1 }, (_, i) => to - i);
  }, [person, now.year, ym.year]);

  if (!person || !line) return null;

  const period = `${t(MONTHS[ym.month - 1])} ${ym.year}`;
  const isCleaning = kind === "cleaning";
  const paidHere = paymentFor(person, kind, ym.year, ym.month);
  // Shown as soon as the month is chosen; the server makes the same check inside the save.
  const problem = checkSalaryMonth(person, kind, ym.year, ym.month, editing);
  const canEdit = editing ? isAdmin : canEnter;
  const lineLabel = (l: SalaryLine) => {
    const p = byId.get(l.staffId);
    return `${p?.name ?? ""}${l.kind === "cleaning" ? ` · ${t("Cleaning fee")}` : ""}${p && !p.isActive ? ` (${t("Inactive")})` : ""}`;
  };
  const fieldKey = `${lineKey(line)}-${editingId ?? "new"}`;

  const amountField = (key: keyof Amounts, label: string) => (
    <Field label={t(label)}>
      <Input
        name={key}
        type="number"
        step="0.01"
        min="0"
        inputMode="decimal"
        value={amounts[key]}
        onChange={(e) => setAmounts({ ...amounts, [key]: e.target.value })}
      />
    </Field>
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {period} · {person.name}
          </DialogTitle>
          <DialogDescription>{t(isCleaning ? "Cleaning fee, paid separately" : "Salary")}</DialogDescription>
        </DialogHeader>

        {paidHere && (
          <div className="bg-primary/5 flex flex-wrap items-center justify-between gap-2 rounded-xl p-3 text-sm">
            <span>
              {t("Paid {amount} on {date}", { amount: formatMoney(paidHere.amount), date: formatDate(paidHere.paidDate) })}
              {paidHere.accountName ? ` · ${paidHere.accountName}` : ""}
            </span>
            <span className="flex gap-1">
              {isAdmin && paidHere.id !== editingId && (
                <Button variant="ghost" size="sm" onClick={() => openPayment(paidHere)}>
                  <Pencil className="size-3.5" />
                  {t("Edit")}
                </Button>
              )}
              <Button variant="outline" size="sm" render={<Link href={`/receipts/salary/${paidHere.id}`} />}>
                <Printer className="size-3.5" />
                {t("Salary slip")}
              </Button>
            </span>
          </div>
        )}

        {canEdit && (
          <form onSubmit={editing ? update.submit : pay.submit} className="flex flex-col gap-4">
            {editing ? (
              <input type="hidden" name="id" value={editing.id} />
            ) : (
              <>
                <input type="hidden" name="staffId" value={line.staffId} />
                <input type="hidden" name="kind" value={kind} />
              </>
            )}

            {choices.length > 1 && !editing && (
              <Field label={t("Staff")}>
                <NativeSelect
                  value={lineKey(line)}
                  onChange={(e) => {
                    const next = choices.find((c) => lineKey(c) === e.target.value);
                    if (next) chooseLine(next);
                  }}
                >
                  {choices.map((c) => (
                    <option key={lineKey(c)} value={lineKey(c)}>
                      {lineLabel(c)}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            )}

            {/* The month this salary is for. The grid marks this month, never the payment date. */}
            <Field label={t("Salary Month")}>
              <div className="grid grid-cols-2 gap-2">
                <NativeSelect
                  name="month"
                  aria-label={t("Month")}
                  value={ym.month}
                  required
                  onChange={(e) => chooseMonth({ ...ym, month: Number(e.target.value) })}
                >
                  {MONTHS.map((name, i) => (
                    <option key={name} value={i + 1}>
                      {t(name)}
                    </option>
                  ))}
                </NativeSelect>
                <NativeSelect
                  name="year"
                  aria-label={t("Year")}
                  value={ym.year}
                  required
                  onChange={(e) => chooseMonth({ ...ym, year: Number(e.target.value) })}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </Field>

            {problem && (
              <Notice tone={problem.code === "already-paid" ? "warning" : "error"}>
                {t(problem.message, problem.vars)}{" "}
                {problem.code === "already-paid" && isAdmin && problem.paymentId && paidHere && (
                  <button type="button" className="font-medium underline" onClick={() => openPayment(paidHere)}>
                    {t("Open that payment")}
                  </button>
                )}
              </Notice>
            )}

            <div className="grid grid-cols-2 gap-3">
              {!isCleaning && amountField("basic", "Basic salary")}
              {amountField("cleaning", "Cleaning fee")}
              {!isCleaning && amountField("ramadan", "Ramadan allowance")}
              {amountField("otherAdditions", "Other additions")}
            </div>
            <Field label={t("About the other additions")}>
              <Input key={`other-${fieldKey}`} name="otherNote" defaultValue={editing?.otherNote ?? ""} />
            </Field>
            <div className="bg-primary/5 flex items-center justify-between rounded-xl p-3">
              <span className="text-sm font-medium">{t("Total")}</span>
              <span className="font-heading text-xl font-semibold tabular-nums">{formatMoney(total)}</span>
            </div>
            <Field label={t("Payment date")}>
              <Input key={`date-${fieldKey}`} name="paidDate" type="date" defaultValue={editing?.paidDate ?? todayIST()} required />
            </Field>
            <AccountPicker key={`via-${fieldKey}`} accounts={accounts} label={t("Paid via")} defaultValue={editing?.accountId} />
            <Field label={t("Note")}>
              <Input key={`note-${fieldKey}`} name="note" defaultValue={editing?.note ?? ""} />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex flex-wrap gap-2">
                <SaveButton
                  pending={pay.pending || update.pending}
                  disabled={pay.pending || update.pending || !!problem?.blocking}
                />
                {editing && (
                  <Button type="button" variant="outline" onClick={newPayment}>
                    {t("New payment")}
                  </Button>
                )}
              </span>
              {editing && (
                <ConfirmButton
                  title="Un-tick this month?"
                  description="The payment is removed and the amount goes back into Cash/Bank. This is logged."
                  confirmLabel="Un-tick"
                  onConfirm={() => remove.call(editing.id)}
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
