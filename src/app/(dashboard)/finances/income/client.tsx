"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpenCheck, Landmark, Pencil, Plus, Printer, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { ConfirmButton } from "@/components/money/confirm-button";
import { AccountPicker, Field, NativeSelect, SaveButton, useAction, type AccountOption } from "@/components/money/form";
import { PageHeader, StatCard } from "@/components/money/page-header";
import { deleteCollection, saveCollection } from "@/lib/actions/collections";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";

type Entry = {
  id: string;
  date: string;
  category: string;
  categoryId: string | null;
  amount: string;
  donorName: string | null;
  houseName: string | null;
  receiptNumber: string;
  bookNumber: string | null;
  description: string | null;
  accountId: string | null;
  accountName: string | null;
};

type Category = { id: string; name: string; kind: string; isActive: boolean };

export function CollectionsClient({
  entries,
  categories,
  accounts,
  from,
  to,
}: {
  entries: Entry[];
  categories: Category[];
  accounts: AccountOption[];
  from: string;
  to: string;
}) {
  const t = useT();
  const router = useRouter();
  const { canEnter, isAdmin } = useSession();
  const [editing, setEditing] = useState<Entry | "new" | null>(null);
  const [filter, setFilter] = useState("all");
  const remove = useAction(deleteCollection, { success: "Entry deleted. Balance corrected.", onDone: () => router.refresh() });
  const shown = entries.filter((e) => filter === "all" || e.category === filter);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Collections" subtitle="General Fund, Nercha, donations and more. Each entry goes to Cash or Bank.">
        <Button variant="outline" render={<Link href="/finances/friday-collections" />}>
          <Landmark className="size-4" />
          {t("Friday Collections")}
        </Button>
        <Button variant="outline" render={<Link href="/subscriptions" />}>
          <BookOpenCheck className="size-4" />
          {t("Subscriptions")}
        </Button>
        {canEnter && (
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            {t("Add collection")}
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
              <NativeSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
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
        <StatCard label="Total for this selection" value={formatMoney(shown.reduce((s, e) => s + Number(e.amount), 0))} />
        <StatCard label="Entries" value={String(shown.length)} />
      </div>

      <Card>
        <CardContent>
          {shown.length === 0 ? (
            <EmptyState message={t("No collections for this selection.")} />
          ) : (
            <ul className="divide-border divide-y">
              {shown.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {[e.donorName, e.houseName].filter(Boolean).join(" · ") || t(e.category)}
                    </p>
                    <p className="text-muted-foreground truncate text-sm">
                      {formatDate(e.date)} · {t(e.category)}
                      {e.accountName ? ` · ${e.accountName}` : ""}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {t("Receipt No.")} {e.receiptNumber}
                      {e.bookNumber ? ` · ${t("Book")} ${e.bookNumber}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <span className="text-success mr-1 font-semibold tabular-nums">{formatMoney(e.amount)}</span>
                    <Button variant="ghost" size="icon" className="size-8" aria-label={t("Receipt")} render={<Link href={`/receipts/collection/${e.id}`} />}>
                      <Printer className="size-4" />
                    </Button>
                    {isAdmin && (
                      <>
                        <Button variant="ghost" size="icon" className="size-8" aria-label={t("Edit")} onClick={() => setEditing(e)}>
                          <Pencil className="size-4" />
                        </Button>
                        <ConfirmButton
                          title="Delete this entry?"
                          description="The amount is taken back out of Cash/Bank. This is logged."
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
        <CollectionDialog
          entry={editing === "new" ? null : editing}
          categories={categories.filter((c) => c.isActive && c.kind === "general")}
          accounts={accounts}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function CollectionDialog({
  entry,
  categories,
  accounts,
  onClose,
}: {
  entry: Entry | null;
  categories: Category[];
  accounts: AccountOption[];
  onClose: () => void;
}) {
  const t = useT();
  const router = useRouter();
  const save = useAction(saveCollection, {
    success: "Collection saved",
    onDone: (id) => {
      onClose();
      if (!entry && id) router.push(`/receipts/collection/${id}`);
      else router.refresh();
    },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(entry ? "Edit collection" : "Add collection")}</DialogTitle>
        </DialogHeader>
        <form action={save.call} className="flex flex-col gap-4">
          {entry && <input type="hidden" name="id" value={entry.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Category")}>
              <NativeSelect name="categoryId" defaultValue={entry?.categoryId ?? categories[0]?.id} required>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(c.name)}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label={t("Date")}>
              <Input name="date" type="date" defaultValue={entry?.date ?? todayIST()} required />
            </Field>
            <Field label={t("Amount (₹)")}>
              <Input name="amount" type="number" step="0.01" min="0.01" inputMode="decimal" defaultValue={entry?.amount} required />
            </Field>
            <Field label={t("Payer name")}>
              <Input name="donorName" defaultValue={entry?.donorName ?? ""} />
            </Field>
            <Field label={t("House / family name")}>
              <Input name="houseName" defaultValue={entry?.houseName ?? ""} />
            </Field>
            <Field label={t("Receipt No.")} hint={entry ? undefined : t("Leave empty for an automatic number")}>
              <Input name="receiptNumber" defaultValue={entry?.receiptNumber ?? ""} />
            </Field>
          </div>
          <Field label={t("Book number")}>
            <Input name="bookNumber" defaultValue={entry?.bookNumber ?? ""} />
          </Field>
          <AccountPicker accounts={accounts} label={t("Received via")} defaultValue={entry?.accountId} />
          <Field label={t("Note")}>
            <Input name="description" defaultValue={entry?.description ?? ""} />
          </Field>
          <SaveButton pending={save.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
