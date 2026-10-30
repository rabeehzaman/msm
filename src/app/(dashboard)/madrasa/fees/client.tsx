"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { ConfirmButton } from "@/components/money/confirm-button";
import { AccountPicker, Field, NativeSelect, SaveButton, useAction, type AccountOption } from "@/components/money/form";
import { PageHeader, StatCard } from "@/components/money/page-header";
import { deleteFeePayment, payFee, saveFeeType } from "@/lib/actions/students";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";

type FeeType = { id: string; feeType: string; amount: string; frequency: string | null; classId: string | null; className: string | null };
type Pending = { studentId: string; studentName: string; className: string | null; feeStructureId: string; feeType: string; pending: number };
type Payment = { id: string; studentName: string; feeType: string | null; amount: string; date: string; receiptNumber: string | null; accountName: string | null };
type ClassInfo = { id: string; name: string };
type StudentOption = { id: string; name: string; className: string | null };
type Collect = { studentId?: string; feeStructureId?: string; amount?: number };

export function FeesClient({
  feeTypes,
  pending,
  payments,
  classes,
  students,
  accounts,
}: {
  feeTypes: FeeType[];
  pending: Pending[];
  payments: Payment[];
  classes: ClassInfo[];
  students: StudentOption[];
  accounts: AccountOption[];
}) {
  const t = useT();
  const router = useRouter();
  const { canEnter, isAdmin } = useSession();
  const [editing, setEditing] = useState<FeeType | "new" | null>(null);
  const [collect, setCollect] = useState<Collect | null>(null);
  const remove = useAction(deleteFeePayment, { success: "Payment deleted. Balance corrected.", onDone: () => router.refresh() });
  const total = pending.reduce((s, p) => s + p.pending, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Madrasa fees" subtitle="Fee types, what each student still owes, and collections to Cash or Bank.">
        {isAdmin && (
          <Button variant="outline" onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            {t("Add fee type")}
          </Button>
        )}
        {canEnter && (
          <Button onClick={() => setCollect({})}>
            <Plus className="size-4" />
            {t("Collect fee")}
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Total pending" value={formatMoney(total)} tone="stat-icon-rose" />
        <StatCard label="Fee types" value={String(feeTypes.length)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("Fee types")}</CardTitle>
          </CardHeader>
          <CardContent>
            {feeTypes.length === 0 ? (
              <EmptyState message={t("Add the admission fee first.")} />
            ) : (
              <ul className="divide-border divide-y">
                {feeTypes.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{f.feeType}</p>
                      <p className="text-muted-foreground text-xs">
                        {t(f.frequency === "monthly" ? "Every month" : "One time")} · {f.className ?? t("All classes")}
                      </p>
                    </div>
                    <span className="flex items-center gap-1">
                      <span className="font-medium tabular-nums">{formatMoney(f.amount)}</span>
                      {isAdmin && (
                        <Button variant="ghost" size="icon" className="size-8" aria-label={t("Edit")} onClick={() => setEditing(f)}>
                          <Pencil className="size-4" />
                        </Button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Pending fee list")}</CardTitle>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <EmptyState message={t("No fees pending.")} />
            ) : (
              <ul className="divide-border divide-y">
                {pending.map((p) => (
                  <li key={`${p.studentId}-${p.feeStructureId}`} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.studentName}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {[p.className, p.feeType].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium tabular-nums">{formatMoney(p.pending)}</span>
                      {canEnter && (
                        <Button size="sm" onClick={() => setCollect({ studentId: p.studentId, feeStructureId: p.feeStructureId, amount: p.pending })}>
                          {t("Collect")}
                        </Button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Recent payments")}</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyState message={t("No fee payments yet.")} />
          ) : (
            <ul className="divide-border divide-y">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {p.studentName} · {p.feeType}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {formatDate(p.date)} · {t("Receipt")} {p.receiptNumber} · {p.accountName}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-0.5">
                    <span className="text-success mr-1 font-semibold tabular-nums">{formatMoney(p.amount)}</span>
                    <Button variant="ghost" size="icon" className="size-8" aria-label={t("Receipt")} render={<Link href={`/receipts/fee/${p.id}`} />}>
                      <Printer className="size-4" />
                    </Button>
                    {isAdmin && (
                      <ConfirmButton
                        title="Delete this payment?"
                        description="The amount is taken back out of Cash/Bank. This is logged."
                        onConfirm={() => remove.call(p.id)}
                        trigger={
                          <Button variant="ghost" size="icon" className="size-8" aria-label={t("Delete")}>
                            <Trash2 className="size-4" />
                          </Button>
                        }
                      />
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {editing && <FeeTypeDialog fee={editing === "new" ? null : editing} classes={classes} onClose={() => setEditing(null)} />}
      {collect && (
        <CollectDialog preset={collect} feeTypes={feeTypes} students={students} accounts={accounts} onClose={() => setCollect(null)} />
      )}
    </div>
  );
}

function FeeTypeDialog({ fee, classes, onClose }: { fee: FeeType | null; classes: ClassInfo[]; onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const save = useAction(saveFeeType, {
    success: "Saved",
    onDone: () => {
      onClose();
      router.refresh();
    },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(fee ? "Edit fee type" : "Add fee type")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save.submit} className="flex flex-col gap-4">
          {fee && <input type="hidden" name="id" value={fee.id} />}
          <Field label={t("Fee name")}>
            <Input name="feeType" defaultValue={fee?.feeType} placeholder={t("e.g. Admission fee, Exam fee")} required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("Amount (₹)")}>
              <Input name="amount" type="number" step="0.01" min="0.01" inputMode="decimal" defaultValue={fee?.amount} required />
            </Field>
            <Field label={t("How often")}>
              <NativeSelect name="frequency" defaultValue={fee?.frequency === "monthly" ? "monthly" : "once"}>
                <option value="once">{t("One time")}</option>
                <option value="monthly">{t("Every month")}</option>
              </NativeSelect>
            </Field>
          </div>
          <Field label={t("Class")}>
            <NativeSelect name="classId" defaultValue={fee?.classId ?? ""}>
              <option value="">{t("All classes")}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <SaveButton pending={save.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CollectDialog({
  preset,
  feeTypes,
  students,
  accounts,
  onClose,
}: {
  preset: Collect;
  feeTypes: FeeType[];
  students: StudentOption[];
  accounts: AccountOption[];
  onClose: () => void;
}) {
  const t = useT();
  const router = useRouter();
  const pay = useAction(payFee, {
    success: "Fee saved",
    onDone: (id) => {
      onClose();
      if (id) router.push(`/receipts/fee/${id}`);
    },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("Collect fee")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={pay.submit} className="flex flex-col gap-4">
          <Field label={t("Student")}>
            <NativeSelect name="studentId" defaultValue={preset.studentId ?? ""} required>
              <option value="" disabled>
                {t("Select")}
              </option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.className ? ` (${s.className})` : ""}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("Fee")}>
            <NativeSelect name="feeStructureId" defaultValue={preset.feeStructureId ?? ""} required>
              <option value="" disabled>
                {t("Select")}
              </option>
              {feeTypes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.feeType}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Amount (₹)")}>
              <Input name="amount" type="number" step="0.01" min="0.01" inputMode="decimal" defaultValue={preset.amount} required />
            </Field>
            <Field label={t("Date")}>
              <Input name="date" type="date" defaultValue={todayIST()} required />
            </Field>
          </div>
          <Field label={t("Receipt No.")} hint={t("Leave empty for an automatic number")}>
            <Input name="receiptNumber" />
          </Field>
          <AccountPicker accounts={accounts} label={t("Received via")} />
          <Field label={t("Note")}>
            <Input name="note" />
          </Field>
          <SaveButton pending={pay.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
