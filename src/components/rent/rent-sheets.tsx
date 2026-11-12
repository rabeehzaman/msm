"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CircleAlert, Pencil, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ConfirmButton } from "@/components/money/confirm-button";
import { AccountPicker, Field, NativeSelect, SaveButton, useAction, type AccountOption } from "@/components/money/form";
import { deleteRentPayment, payRent, updateRentPayment } from "@/lib/actions/rent";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, MONTHS, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import {
  paymentSlot, roomMonth, suggestedRent, type MonthRentFact, type RentFact, type TenancyFact, type YearMonth,
} from "@/lib/rent/status";

export type RentPayment = {
  id: string;
  tenancyId: string;
  year: number;
  month: number;
  part: number;
  amount: string;
  paidDate: string;
  accountId: string;
  accountName: string | null;
  receiptNumber: string;
  note: string | null;
};

// Everything the popup needs to check any Rental Month for one room, without asking the server.
export type SheetRoom = {
  id: string;
  label: string;
  tenancies: TenancyFact[];
  rents: RentFact[];
  monthRents: MonthRentFact[];
  payments: RentPayment[];
};

export type SheetTarget = { room: SheetRoom; year: number; month: number; paymentId?: string | null };

export function RentSheet({
  target,
  accounts,
  now,
  onClose,
}: {
  target: SheetTarget;
  accounts: AccountOption[];
  now: YearMonth;
  onClose: () => void;
}) {
  const t = useT();
  const { isAdmin, canEnter } = useSession();
  const { room } = target;
  const [ym, setYm] = useState<YearMonth>({ year: target.year, month: target.month });
  const [editingId, setEditingId] = useState<string | null>(() => {
    if (target.paymentId) return target.paymentId;
    const own = room.payments.filter((p) => p.year === target.year && p.month === target.month);
    const opened = roomMonth(room, target.year, target.month, now);
    // A Fixed month holds one payment, so tapping a paid month opens it, as before.
    return opened.type === "fixed" && own.length > 0 ? own[0].id : null;
  });
  // The save itself sends the new page back with it, so there is no second reload.
  const pay = useAction(payRent, { success: "Rent saved", onDone: onClose });
  const update = useAction(updateRentPayment, { success: "Rent updated", onDone: onClose });
  const remove = useAction(deleteRentPayment, { success: "Month un-ticked. The amount was taken back out.", onDone: onClose });

  const editing = editingId ? (room.payments.find((p) => p.id === editingId) ?? null) : null;
  const m = roomMonth(room, ym.year, ym.month, now);
  const monthPayments = room.payments.filter((p) => p.year === ym.year && p.month === ym.month);
  const others = monthPayments.filter((p) => p.id !== editingId);
  const period = `${t(MONTHS[ym.month - 1])} ${ym.year}`;
  const variable = m.type === "variable";
  const canEdit = editing ? isAdmin : canEnter;
  const suggestion = variable && m.due === null ? suggestedRent(room.rents, room.monthRents, ym.year, ym.month) : null;
  // Warnings shown before saving, so nothing is recorded twice or against a vacant month.
  // The server makes the same checks (paymentSlot) inside the save.
  const slot = paymentSlot(room, ym.year, ym.month, editingId ?? undefined);
  // A payment already stored on a month stays editable there, even if the tenant's dates changed since.
  const vacant = !m.tracked && !(editing && editing.year === ym.year && editing.month === ym.month);
  const fixedTaken = !variable && slot.alreadyPaid;
  const variableCovered = variable && slot.alreadyPaid;
  const blocked = vacant || fixedTaken;

  const years = useMemo(() => {
    const starts = room.tenancies.map((x) => Number(x.startDate.slice(0, 4)));
    const first = Math.min(now.year - 1, ...starts, ym.year);
    const last = Math.max(now.year + 1, ym.year);
    return Array.from({ length: last - first + 1 }, (_, i) => last - i);
  }, [room.tenancies, now.year, ym.year]);

  const amountDefault = editing
    ? editing.amount
    : variable
      ? m.balance > 0
        ? String(m.balance)
        : ""
      : m.due
        ? String(m.due)
        : "";
  const fieldKey = `${ym.year}-${ym.month}-${editingId ?? "new"}`;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {period} · {room.label}
          </DialogTitle>
          <DialogDescription>{m.tenancy?.tenantName ?? ""}</DialogDescription>
        </DialogHeader>

        {monthPayments.length > 0 && (
          <ul className="bg-primary/5 flex flex-col gap-1 rounded-xl p-3 text-sm">
            {monthPayments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {t("Paid {amount} on {date}", { amount: formatMoney(p.amount), date: formatDate(p.paidDate) })}
                  {p.accountName ? ` · ${p.accountName}` : ""}
                </span>
                <span className="flex gap-1">
                  {isAdmin && variable && p.id !== editingId && (
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(p.id)}>
                      <Pencil className="size-3.5" />
                      {t("Edit")}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" render={<Link href={`/receipts/rent/${p.id}`} />}>
                    <Printer className="size-3.5" />
                    {t("Receipt")}
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        )}

        {canEdit ? (
          <form onSubmit={editing ? update.submit : pay.submit} className="flex flex-col gap-4">
            {editing ? (
              <input type="hidden" name="id" value={editing.id} />
            ) : (
              <input type="hidden" name="roomId" value={room.id} />
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("Rental Month")} className="col-span-2 sm:col-span-1">
                <div className="grid grid-cols-2 gap-2">
                  <NativeSelect
                    name="month"
                    aria-label={t("Month")}
                    value={ym.month}
                    required
                    onChange={(e) => setYm({ ...ym, month: Number(e.target.value) })}
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
                    onChange={(e) => setYm({ ...ym, year: Number(e.target.value) })}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </Field>
            </div>

            {vacant && (
              <Notice tone="error">
                {t("This room has no tenant for {month}. Choose a month when the room had a tenant.", { month: period })}
              </Notice>
            )}
            {!vacant && fixedTaken && (
              <Notice>
                {t("Rent for {month} is already paid for this room.", { month: period })}{" "}
                {isAdmin && !editing && (
                  <button type="button" className="font-medium underline" onClick={() => setEditingId(others[0].id)}>
                    {t("Open that payment")}
                  </button>
                )}
              </Notice>
            )}
            {!vacant && variableCovered && !editing && (
              <Notice>{t("Rent for {month} is already paid for this room.", { month: period })}</Notice>
            )}

            {variable && !vacant && (
              <div className="flex flex-col gap-2 rounded-xl border border-dashed p-3">
                <Field
                  label={t("Rent for this month (₹)")}
                  hint={
                    m.due === null
                      ? suggestion
                        ? t("Suggested from an earlier month. Change it if needed.")
                        : t("Not set yet.")
                      : !isAdmin
                        ? t("Only an admin can change a month's rent that is already entered.")
                        : undefined
                  }
                >
                  <Input
                    key={`rent-${fieldKey}`}
                    name="monthRent"
                    type="number"
                    step="0.01"
                    min="0.01"
                    inputMode="decimal"
                    defaultValue={m.due ?? suggestion ?? ""}
                    readOnly={m.due !== null && !isAdmin}
                  />
                </Field>
                {m.due !== null && (
                  <p className="text-muted-foreground text-xs">
                    {t("Rent")} {formatMoney(m.due)} · {t("Paid")} {formatMoney(m.paidTotal)} · {t("Balance")}{" "}
                    {formatMoney(m.balance)}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t(variable ? "Amount received (₹)" : "Amount (₹)")}
                hint={variable && !editing ? t("Leave empty to save only this month's rent.") : undefined}
              >
                <Input
                  key={`amount-${fieldKey}`}
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  inputMode="decimal"
                  defaultValue={amountDefault}
                  required={!variable || !!editing}
                />
              </Field>
              <Field label={t("Payment date")}>
                <Input name="paidDate" type="date" defaultValue={editing?.paidDate ?? todayIST()} required />
              </Field>
            </div>
            <AccountPicker accounts={accounts} label={t("Received via")} defaultValue={editing?.accountId} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Receipt No.")} hint={editing ? undefined : t("Leave empty for an automatic number")}>
                <Input key={`receipt-${editingId ?? "new"}`} name="receiptNumber" defaultValue={editing?.receiptNumber ?? ""} />
              </Field>
              <Field label={t("Note")}>
                <Input key={`note-${editingId ?? "new"}`} name="note" defaultValue={editing?.note ?? ""} />
              </Field>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex flex-wrap gap-2">
                <SaveButton pending={pay.pending || update.pending} disabled={pay.pending || update.pending || blocked} />
                {editing && variable && (
                  <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                    {t("New payment")}
                  </Button>
                )}
              </span>
              {editing && (
                <ConfirmButton
                  title="Un-tick this month?"
                  description="The payment is removed and the amount is taken back out of Cash/Bank. This is logged."
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
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Notice({ tone = "warning", children }: { tone?: "warning" | "error"; children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className={`flex items-start gap-2 rounded-xl p-3 text-sm ${
        tone === "error" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-800 dark:text-amber-300"
      }`}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
