"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, Trash2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { ConfirmButton } from "@/components/money/confirm-button";
import { AccountPicker, Field, NativeSelect, SaveButton, useAction, type AccountOption } from "@/components/money/form";
import { PageHeader, StatCard } from "@/components/money/page-header";
import { PhotoButton, PhotoField } from "@/components/money/photo";
import { deleteExpense, saveExpense } from "@/lib/actions/expenses";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";

type Entry = {
  id: string;
  voucherNumber: string;
  amount: string;
  payee: string;
  category: string;
  categoryId: string | null;
  description: string | null;
  date: string;
  accountId: string | null;
  accountName: string | null;
  fundId: string;
  fundName: string | null;
  photoPath: string | null;
  sourceType: string | null;
};

type Category = { id: string; name: string; isActive: boolean };
type Fund = { id: string; name: string };

export function ExpensesClient({
  entries,
  categories,
  funds,
  accounts,
  from,
  to,
}: {
  entries: Entry[];
  categories: Category[];
  funds: Fund[];
  accounts: AccountOption[];
  from: string;
  to: string;
}) {
  const t = useT();
  const router = useRouter();
  const { canEnter, isAdmin } = useSession();
  const [editing, setEditing] = useState<Entry | "new" | null>(null);
  const [category, setCategory] = useState("all");
  const remove = useAction(deleteExpense, { success: "Expense deleted. Balance corrected.", onDone: () => router.refresh() });
  const shown = entries.filter((e) => category === "all" || e.category === category);
  const total = shown.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Expenses" subtitle="Every expense comes out of Cash or Bank straight away.">
        <Button variant="outline" render={<Link href="/bills" />}>
          <Zap className="size-4" />
          {t("KSEB & regular bills")}
        </Button>
        {canEnter && (
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            {t("Add expense")}
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardContent>
          <form className="flex flex-wrap items-end gap-3">
            <Field label={t("From")} className="w-full sm:w-44">
              <Input type="date" name="from" defaultValue={from} />
            </Field>
            <Field label={t("To")} className="w-full sm:w-44">
              <Input type="date" name="to" defaultValue={to} />
            </Field>
            <Button type="submit" variant="outline">
              <Search className="size-4" />
              {t("Show")}
            </Button>
            <Field label={t("Category")} className="w-full sm:w-52">
              <NativeSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">{t("All categories")}</option>
                {[...new Set(entries.map((e) => e.category))].map((c) => (
                  <option key={c} value={c}>
                    {t(c)}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Total for this selection" value={formatMoney(total)} />
        <StatCard label="Entries" value={String(shown.length)} />
      </div>

      <Card>
        <CardContent>
          {shown.length === 0 ? (
            <EmptyState message={t("No expenses for this selection.")} />
          ) : (
            <ul className="divide-border divide-y">
              {shown.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.payee}</p>
                    <p className="text-muted-foreground truncate text-sm">
                      {formatDate(e.date)} · {t(e.category)}
                      {e.accountName ? ` · ${e.accountName}` : ""}
                    </p>
                    {e.description && <p className="text-muted-foreground truncate text-xs">{e.description}</p>}
                    {e.sourceType && (
                      <Badge variant="secondary" className="mt-1">
                        {t(e.sourceType === "bill" ? "From a bill" : "From maintenance")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <span className="text-destructive mr-1 font-semibold tabular-nums">{formatMoney(e.amount)}</span>
                    {e.photoPath && <PhotoButton path={e.photoPath} />}
                    {isAdmin && !e.sourceType && (
                      <>
                        <Button variant="ghost" size="icon" className="size-8" aria-label={t("Edit")} onClick={() => setEditing(e)}>
                          <Pencil className="size-4" />
                        </Button>
                        <ConfirmButton
                          title="Delete this expense?"
                          description="The amount goes back into Cash/Bank. This is logged."
                          onConfirm={() => remove.call(e.id)}
                          trigger={
                            <Button variant="ghost" size="icon" className="size-8" aria-label={t("Delete")}>
                              <Trash2 className="size-4" />
                            </Button>
                          }
                        />
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {editing && (
        <ExpenseDialog
          entry={editing === "new" ? null : editing}
          categories={categories.filter((c) => c.isActive)}
          funds={funds}
          accounts={accounts}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ExpenseDialog({
  entry,
  categories,
  funds,
  accounts,
  onClose,
}: {
  entry: Entry | null;
  categories: Category[];
  funds: Fund[];
  accounts: AccountOption[];
  onClose: () => void;
}) {
  const t = useT();
  const router = useRouter();
  const save = useAction(saveExpense, {
    success: "Expense saved",
    onDone: () => {
      onClose();
      router.refresh();
    },
  });
  const general = funds.find((f) => f.name === "General Fund")?.id;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(entry ? "Edit expense" : "Add expense")}</DialogTitle>
          <DialogDescription>{t("The amount is taken out of the account you choose.")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={save.submit} className="flex flex-col gap-4">
          {entry && <input type="hidden" name="id" value={entry.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Date")}>
              <Input name="date" type="date" defaultValue={entry?.date ?? todayIST()} required />
            </Field>
            <Field label={t("Amount (₹)")}>
              <Input name="amount" type="number" step="0.01" min="0.01" inputMode="decimal" defaultValue={entry?.amount} required />
            </Field>
            <Field label={t("Category")}>
              <NativeSelect name="categoryId" defaultValue={entry?.categoryId ?? ""} required>
                <option value="" disabled>
                  {t("Select")}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(c.name)}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label={t("Paid to")}>
              <Input name="payee" defaultValue={entry?.payee} required />
            </Field>
          </div>
          <AccountPicker accounts={accounts} label={t("Paid via")} defaultValue={entry?.accountId} />
          <Field label={t("Fund")}>
            <NativeSelect name="fundId" defaultValue={entry?.fundId ?? general}>
              {funds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("Note")}>
            <Textarea name="description" rows={2} defaultValue={entry?.description ?? ""} />
          </Field>
          <PhotoField folder="bills" label={t(entry?.photoPath ? "Replace the bill photo" : "Photo of the bill")} />
          <SaveButton pending={save.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
