"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ConfirmButton } from "@/components/money/confirm-button";
import { AccountPicker, Field, SaveButton, useAction, type AccountOption } from "@/components/money/form";
import { deleteRentPayment, payRent, updateRentPayment } from "@/lib/actions/rent";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, MONTHS, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";

export type RentPayment = {
  id: string;
  amount: string;
  paidDate: string;
  accountId: string;
  accountName: string | null;
  receiptNumber: string;
  note: string | null;
};

export type SheetTarget = {
  roomId: string;
  roomLabel: string;
  tenantName: string | null;
  year: number;
  month: number;
  expected: number;
  payment: RentPayment | null;
};

// The small confirm sheet that opens when a month is tapped.
export function RentSheet({
  target,
  accounts,
  onClose,
}: {
  target: SheetTarget;
  accounts: AccountOption[];
  onClose: () => void;
}) {
  const t = useT();
  const router = useRouter();
  const { isAdmin, canEnter } = useSession();
  const { payment } = target;
  const done = () => {
    onClose();
    router.refresh();
  };
  const pay = useAction(payRent, { success: "Rent saved", onDone: done });
  const update = useAction(updateRentPayment, { success: "Rent updated", onDone: done });
  const remove = useAction(deleteRentPayment, { success: "Month un-ticked. The amount was taken back out.", onDone: done });
  const period = `${t(MONTHS[target.month - 1])} ${target.year}`;
  const canEdit = payment ? isAdmin : canEnter;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {period} · {target.roomLabel}
          </DialogTitle>
          <DialogDescription>{target.tenantName ?? ""}</DialogDescription>
        </DialogHeader>

        {payment && (
          <div className="bg-primary/5 flex flex-wrap items-center justify-between gap-2 rounded-xl p-3 text-sm">
            <span>
              {t("Paid {amount} on {date}", { amount: formatMoney(payment.amount), date: formatDate(payment.paidDate) })}
              {payment.accountName ? ` · ${payment.accountName}` : ""}
            </span>
            <Button variant="outline" size="sm" render={<Link href={`/receipts/rent/${payment.id}`} />}>
              <Printer className="size-3.5" />
              {t("Receipt")}
            </Button>
          </div>
        )}

        {canEdit ? (
          <form action={payment ? update.call : pay.call} className="flex flex-col gap-4">
            {payment ? (
              <input type="hidden" name="id" value={payment.id} />
            ) : (
              <>
                <input type="hidden" name="roomId" value={target.roomId} />
                <input type="hidden" name="year" value={target.year} />
                <input type="hidden" name="month" value={target.month} />
              </>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Amount (₹)")}>
                <Input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  inputMode="decimal"
                  defaultValue={payment?.amount ?? (target.expected || "")}
                  required
                />
              </Field>
              <Field label={t("Payment date")}>
                <Input name="paidDate" type="date" defaultValue={payment?.paidDate ?? todayIST()} required />
              </Field>
            </div>
            <AccountPicker accounts={accounts} label={t("Received via")} defaultValue={payment?.accountId} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Receipt No.")} hint={payment ? undefined : t("Leave empty for an automatic number")}>
                <Input name="receiptNumber" defaultValue={payment?.receiptNumber ?? ""} />
              </Field>
              <Field label={t("Note")}>
                <Input name="note" defaultValue={payment?.note ?? ""} />
              </Field>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SaveButton pending={pay.pending || update.pending} />
              {payment && (
                <ConfirmButton
                  title="Un-tick this month?"
                  description="The payment is removed and the amount is taken back out of Cash/Bank. This is logged."
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
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
