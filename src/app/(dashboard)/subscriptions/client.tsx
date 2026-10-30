"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Printer, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { ConfirmButton } from "@/components/money/confirm-button";
import { AccountPicker, Field, NativeSelect, SaveButton, useAction, type AccountOption } from "@/components/money/form";
import { PageHeader, StatCard } from "@/components/money/page-header";
import { createSubscription } from "@/lib/actions/finance";
import { deleteSubscriptionPayment, paySubscription } from "@/lib/actions/collections";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";

type Period = { key: string; label: string; started: boolean; paid: boolean };

type Plan = {
  id: string;
  houseNumber: string;
  familyName: string;
  planName: string;
  amount: string;
  frequency: string;
  status: string;
  periods: Period[];
  totalPaid: number;
  pendingCount: number;
  payments: {
    id: string;
    amount: string;
    date: string;
    receiptNumber: string | null;
    bookNumber: string | null;
    period: string | null;
    accountName: string | null;
  }[];
};

export function SubscriptionsClient({
  book,
  households,
  accounts,
}: {
  book: Plan[];
  households: { id: string; label: string }[];
  accounts: AccountOption[];
}) {
  const t = useT();
  const { canEnter } = useSession();
  const [search, setSearch] = useState("");
  const [paying, setPaying] = useState<Plan | null>(null);
  const [adding, setAdding] = useState(false);
  const shown = book.filter((p) => `${p.houseNumber} ${p.familyName}`.toLowerCase().includes(search.toLowerCase()));
  const totalPaid = book.reduce((s, p) => s + p.totalPaid, 0);
  const pendingAmount = book.reduce((s, p) => s + p.pendingCount * Number(p.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Subscriptions" subtitle="House-wise: which periods are paid, which are pending, and the total paid.">
        <Button variant="outline" render={<Link href="/reports/receipt-book" />}>
          {t("Listing by receipt book")}
        </Button>
        {canEnter && (
          <Button onClick={() => setAdding(true)}>
            <Plus className="size-4" />
            {t("Add subscription")}
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Houses" value={String(book.length)} />
        <StatCard label="Total paid" value={formatMoney(totalPaid)} tone="stat-icon-gold" />
        <StatCard label="Pending" value={formatMoney(pendingAmount)} tone="stat-icon-rose" />
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          aria-label={t("Search house")}
          placeholder={t("Search house")}
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {shown.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState message={t("No subscriptions yet.")} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {shown.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onPay={() => setPaying(plan)} />
          ))}
        </div>
      )}

      {paying && <PayDialog plan={paying} accounts={accounts} onClose={() => setPaying(null)} />}
      {adding && <AddDialog households={households} onClose={() => setAdding(false)} />}
    </div>
  );
}

function PlanCard({ plan, onPay }: { plan: Plan; onPay: () => void }) {
  const t = useT();
  const router = useRouter();
  const { canEnter, isAdmin } = useSession();
  const remove = useAction(deleteSubscriptionPayment, { success: "Payment deleted. Balance corrected.", onDone: () => router.refresh() });
  const recent = plan.periods.filter((p) => p.started).slice(-12);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate">
            {plan.houseNumber} {plan.familyName}
          </span>
          {plan.pendingCount > 0 ? (
            <Badge variant="destructive">{t("{n} pending", { n: plan.pendingCount })}</Badge>
          ) : (
            <Badge>{t("Up to date")}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          {plan.planName} · {formatMoney(plan.amount)} · {t("Total paid")} {formatMoney(plan.totalPaid)}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {recent.map((p) => (
            <span
              key={p.key}
              className={`rounded-lg px-2 py-1 text-xs font-medium ${p.paid ? "bg-emerald-500 text-white" : "bg-red-500/85 text-white"}`}
            >
              {p.label}
            </span>
          ))}
        </div>
        {plan.payments.length > 0 && (
          <ul className="divide-border divide-y text-sm">
            {plan.payments.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 py-1.5">
                <span className="text-muted-foreground min-w-0 truncate">
                  {formatDate(p.date)} · {t("Book")} {p.bookNumber ?? "-"} · {t("Receipt")} {p.receiptNumber ?? "-"}
                </span>
                <span className="flex shrink-0 items-center gap-0.5">
                  <span className="mr-1 font-medium tabular-nums">{formatMoney(p.amount)}</span>
                  <Button variant="ghost" size="icon" className="size-7" aria-label={t("Receipt")} render={<Link href={`/receipts/subscription/${p.id}`} />}>
                    <Printer className="size-3.5" />
                  </Button>
                  {isAdmin && (
                    <ConfirmButton
                      title="Delete this payment?"
                      description="The amount is taken back out of Cash/Bank. This is logged."
                      onConfirm={() => remove.call(p.id)}
                      trigger={
                        <Button variant="ghost" size="icon" className="size-7" aria-label={t("Delete")}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                    />
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        {canEnter && (
          <Button size="sm" className="self-start" onClick={onPay}>
            {t("Record payment")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function PayDialog({ plan, accounts, onClose }: { plan: Plan; accounts: AccountOption[]; onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const open = plan.periods.filter((p) => !p.paid);
  const [chosen, setChosen] = useState<string[]>(open.filter((p) => p.started).slice(0, 1).map((p) => p.key));
  const [amount, setAmount] = useState(String(Number(plan.amount) * Math.max(chosen.length, 1)));
  const pay = useAction(paySubscription, {
    success: "Payment saved",
    onDone: (id) => {
      onClose();
      if (id) router.push(`/receipts/subscription/${id}`);
    },
  });

  function toggle(key: string) {
    const next = chosen.includes(key) ? chosen.filter((k) => k !== key) : [...chosen, key];
    setChosen(next);
    setAmount(String(Number(plan.amount) * next.length));
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plan.houseNumber} {plan.familyName}
          </DialogTitle>
          <DialogDescription>{plan.planName}</DialogDescription>
        </DialogHeader>
        <form
          action={(formData) => {
            if (chosen.length === 0) {
              toast.error(t("Please choose the periods being paid."));
              return;
            }
            pay.call(formData);
          }}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="subscriptionId" value={plan.id} />
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">{t("Periods being paid")}</legend>
            <div className="flex flex-wrap gap-1.5">
              {open.map((p) => (
                <label
                  key={p.key}
                  className="has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary cursor-pointer rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium"
                >
                  <input
                    type="checkbox"
                    name="periods"
                    value={p.key}
                    checked={chosen.includes(p.key)}
                    onChange={() => toggle(p.key)}
                    className="sr-only"
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("Book number")}>
              <Input name="bookNumber" required />
            </Field>
            <Field label={t("Receipt No.")}>
              <Input name="receiptNumber" required />
            </Field>
            <Field label={t("Amount (₹)")}>
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </Field>
            <Field label={t("Date")}>
              <Input name="date" type="date" defaultValue={todayIST()} required />
            </Field>
          </div>
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

function AddDialog({ households, onClose }: { households: { id: string; label: string }[]; onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const today = useMemo(() => todayIST(), []);

  async function submit(formData: FormData) {
    setSaving(true);
    try {
      formData.set("nextDueDate", String(formData.get("startDate")));
      await createSubscription(formData);
      toast.success(t("Saved"));
      onClose();
      router.refresh();
    } catch {
      toast.error(t("Something went wrong. Nothing was saved."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Add subscription")}</DialogTitle>
        </DialogHeader>
        {households.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("Add households first.")}</p>
        ) : (
          <form action={submit} className="flex flex-col gap-4">
            <Field label={t("House")}>
              <NativeSelect name="householdId" required>
                {households.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.label}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label={t("Plan name")}>
              <Input name="planName" defaultValue={t("Subscription")} required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("Amount per period (₹)")}>
                <Input name="amount" type="number" step="0.01" min="0.01" inputMode="decimal" required />
              </Field>
              <Field label={t("How often")}>
                <NativeSelect name="frequency" defaultValue="monthly">
                  <option value="monthly">{t("Monthly")}</option>
                  <option value="quarterly">{t("Quarterly")}</option>
                  <option value="half_yearly">{t("Half-yearly")}</option>
                  <option value="annual">{t("Yearly")}</option>
                </NativeSelect>
              </Field>
            </div>
            <Field label={t("Start date")}>
              <Input name="startDate" type="date" defaultValue={today} required />
            </Field>
            <SaveButton pending={saving} />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
