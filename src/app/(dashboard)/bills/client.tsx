"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CircleAlert, Pencil, Plus, Trash2, Undo2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { ConfirmButton } from "@/components/money/confirm-button";
import { AccountPicker, Field, NativeSelect, SaveButton, useAction, type AccountOption } from "@/components/money/form";
import { PageHeader, StatCard } from "@/components/money/page-header";
import { deleteBill, payBill, saveBill, saveBillAccount, undoBillPayment } from "@/lib/actions/expenses";
import { useSession } from "@/lib/auth/session";
import { billState } from "@/lib/bills";
import { currentYearMonth, formatDate, formatMoney, MONTHS, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";

type BillAccount = {
  id: string;
  name: string;
  consumerNumber: string | null;
  categoryId: string | null;
  categoryName: string | null;
  notes: string | null;
};

type Bill = {
  id: string;
  billAccountId: string;
  accountLabel: string;
  consumerNumber: string | null;
  year: number;
  month: number;
  amount: string;
  dueDate: string | null;
  paidDate: string | null;
  paidVia: string | null;
  note: string | null;
};

type Category = { id: string; name: string };

const stateBadge = {
  paid: { label: "Paid", variant: "default" },
  overdue: { label: "Overdue", variant: "destructive" },
  soon: { label: "Due soon", variant: "secondary" },
  unpaid: { label: "Not paid", variant: "outline" },
} as const;

export function BillsClient({
  billAccounts,
  bills,
  categories,
  accounts,
}: {
  billAccounts: BillAccount[];
  bills: Bill[];
  categories: Category[];
  accounts: AccountOption[];
}) {
  const t = useT();
  const router = useRouter();
  const { canEnter, isAdmin } = useSession();
  const [editingAccount, setEditingAccount] = useState<BillAccount | "new" | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | "new" | null>(null);
  const [paying, setPaying] = useState<Bill | null>(null);
  const undo = useAction(undoBillPayment, { success: "Payment undone. Balance corrected.", onDone: () => router.refresh() });
  const remove = useAction(deleteBill, { success: "Bill deleted", onDone: () => router.refresh() });
  const today = todayIST();
  const unpaid = bills.filter((b) => !b.paidDate);
  const overdue = unpaid.filter((b) => billState(b.dueDate, b.paidDate, today) === "overdue");
  const soon = unpaid.filter((b) => billState(b.dueDate, b.paidDate, today) === "soon");
  const sum = (list: Bill[]) => list.reduce((s, b) => s + Number(b.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="KSEB & regular bills" subtitle="Enter each bill when it arrives. Paying it takes the amount out of Cash or Bank.">
        {isAdmin && (
          <Button variant="outline" onClick={() => setEditingAccount("new")}>
            <Zap className="size-4" />
            {t("Add consumer number")}
          </Button>
        )}
        {canEnter && (
          <Button onClick={() => setEditingBill("new")} disabled={billAccounts.length === 0}>
            <Plus className="size-4" />
            {t("Add bill")}
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Overdue" value={formatMoney(sum(overdue))} caption={t("{n} bills", { n: overdue.length })} icon={CircleAlert} tone="stat-icon-rose" />
        <StatCard label="Due soon" value={formatMoney(sum(soon))} caption={t("{n} bills", { n: soon.length })} icon={CalendarClock} tone="stat-icon-gold" />
        <StatCard label="All unpaid" value={formatMoney(sum(unpaid))} caption={t("{n} bills", { n: unpaid.length })} icon={Zap} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("Consumer numbers")}</CardTitle>
          </CardHeader>
          <CardContent>
            {billAccounts.length === 0 ? (
              <EmptyState message={t("Add a consumer number first, e.g. the Pally KSEB meter.")} />
            ) : (
              <ul className="divide-border divide-y">
                {billAccounts.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {[a.consumerNumber, a.categoryName ? t(a.categoryName) : null].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="size-8" aria-label={t("Edit")} onClick={() => setEditingAccount(a)}>
                        <Pencil className="size-4" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("Bills")}</CardTitle>
          </CardHeader>
          <CardContent>
            {bills.length === 0 ? (
              <EmptyState message={t("No bills entered yet.")} />
            ) : (
              <ul className="divide-border divide-y">
                {bills.map((b) => {
                  const state = stateBadge[billState(b.dueDate, b.paidDate, today)];
                  return (
                    <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {b.accountLabel} · {t(MONTHS[b.month - 1])} {b.year}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {b.paidDate
                            ? `${t("Paid")} ${formatDate(b.paidDate)}${b.paidVia ? ` · ${b.paidVia}` : ""}`
                            : b.dueDate
                              ? `${t("Due date")} ${formatDate(b.dueDate)}`
                              : t("No due date")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={state.variant}>{t(state.label)}</Badge>
                        <span className="mx-1 font-semibold tabular-nums">{formatMoney(b.amount)}</span>
                        {!b.paidDate && canEnter && (
                          <Button size="sm" onClick={() => setPaying(b)}>
                            {t("Pay")}
                          </Button>
                        )}
                        {!b.paidDate && isAdmin && (
                          <>
                            <Button variant="ghost" size="icon" className="size-8" aria-label={t("Edit")} onClick={() => setEditingBill(b)}>
                              <Pencil className="size-4" />
                            </Button>
                            <ConfirmButton
                              title="Delete this bill?"
                              description="The bill is removed. No money has moved for it."
                              onConfirm={() => remove.call(b.id)}
                              trigger={
                                <Button variant="ghost" size="icon" className="size-8" aria-label={t("Delete")}>
                                  <Trash2 className="size-4" />
                                </Button>
                              }
                            />
                          </>
                        )}
                        {b.paidDate && isAdmin && (
                          <ConfirmButton
                            title="Undo this payment?"
                            description="The expense is removed and the amount goes back into Cash/Bank. This is logged."
                            confirmLabel="Undo"
                            onConfirm={() => undo.call(b.id)}
                            trigger={
                              <Button variant="ghost" size="icon" className="size-8" aria-label={t("Undo")}>
                                <Undo2 className="size-4" />
                              </Button>
                            }
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {editingAccount && (
        <AccountDialog account={editingAccount === "new" ? null : editingAccount} categories={categories} onClose={() => setEditingAccount(null)} />
      )}
      {editingBill && (
        <BillDialog bill={editingBill === "new" ? null : editingBill} billAccounts={billAccounts} onClose={() => setEditingBill(null)} />
      )}
      {paying && <PayDialog bill={paying} accounts={accounts} onClose={() => setPaying(null)} />}
    </div>
  );
}

function useDone(onClose: () => void) {
  const router = useRouter();
  return () => {
    onClose();
    router.refresh();
  };
}

function AccountDialog({ account, categories, onClose }: { account: BillAccount | null; categories: Category[]; onClose: () => void }) {
  const t = useT();
  const save = useAction(saveBillAccount, { success: "Saved", onDone: useDone(onClose) });
  const electricity = categories.find((c) => c.name.startsWith("Electricity"))?.id;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(account ? "Edit consumer number" : "Add consumer number")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save.submit} className="flex flex-col gap-4">
          {account && <input type="hidden" name="id" value={account.id} />}
          <Field label={t("Name")}>
            <Input name="name" defaultValue={account?.name} placeholder={t("e.g. KSEB Pally")} required />
          </Field>
          <Field label={t("Consumer number")}>
            <Input name="consumerNumber" defaultValue={account?.consumerNumber ?? ""} />
          </Field>
          <Field label={t("Expense category")}>
            <NativeSelect name="categoryId" defaultValue={account?.categoryId ?? electricity}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {t(c.name)}
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

function BillDialog({ bill, billAccounts, onClose }: { bill: Bill | null; billAccounts: BillAccount[]; onClose: () => void }) {
  const t = useT();
  const now = currentYearMonth();
  const save = useAction(saveBill, { success: "Bill saved", onDone: useDone(onClose) });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(bill ? "Edit bill" : "Add bill")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save.submit} className="flex flex-col gap-4">
          {bill ? (
            <input type="hidden" name="id" value={bill.id} />
          ) : (
            <>
              <Field label={t("Consumer number")}>
                <NativeSelect name="billAccountId" required>
                  {billAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t("Bill month")}>
                  <NativeSelect name="month" defaultValue={now.month}>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1}>
                        {t(m)}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label={t("Year")}>
                  <Input name="year" type="number" defaultValue={now.year} required />
                </Field>
              </div>
            </>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Amount (₹)")}>
              <Input name="amount" type="number" step="0.01" min="0.01" inputMode="decimal" defaultValue={bill?.amount} required />
            </Field>
            <Field label={t("Due date")}>
              <Input name="dueDate" type="date" defaultValue={bill?.dueDate ?? ""} />
            </Field>
          </div>
          <Field label={t("Note")}>
            <Input name="note" defaultValue={bill?.note ?? ""} />
          </Field>
          <SaveButton pending={save.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PayDialog({ bill, accounts, onClose }: { bill: Bill; accounts: AccountOption[]; onClose: () => void }) {
  const t = useT();
  const pay = useAction(payBill, { success: "Bill paid", onDone: useDone(onClose) });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("Pay")} {bill.accountLabel} · {formatMoney(bill.amount)}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={pay.submit} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={bill.id} />
          <Field label={t("Paid date")}>
            <Input name="paidDate" type="date" defaultValue={todayIST()} required />
          </Field>
          <AccountPicker accounts={accounts} label={t("Paid via")} />
          <SaveButton pending={pay.pending} label="Pay" />
        </form>
      </DialogContent>
    </Dialog>
  );
}
