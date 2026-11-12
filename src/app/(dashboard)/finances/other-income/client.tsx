"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Pencil, Plus, Printer, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { ConfirmButton } from "@/components/money/confirm-button";
import { AccountPicker, Field, NativeSelect, SaveButton, useAction, type AccountOption } from "@/components/money/form";
import { PageHeader, StatCard } from "@/components/money/page-header";
import { deleteOtherIncome, saveIncomeHead, saveOtherIncome } from "@/lib/actions/other-income";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";

type Entry = {
  id: string;
  date: string;
  headId: string;
  headName: string;
  amount: string;
  receivedFrom: string | null;
  receiptNumber: string;
  bookNumber: string | null;
  note: string | null;
  fundId: string;
  fundName: string | null;
  accountId: string;
  accountName: string | null;
};
type Head = { id: string; name: string; isActive: boolean; entries: number };
type Fund = { id: string; name: string; isActive: boolean };
type Filter = { from: string; to: string; headId: string | null; q: string; page: number };

const PAGE_SIZE = 50;
const NEW_HEAD = "__new__";

export function OtherIncomeClient({
  list,
  heads,
  funds,
  accounts,
  filter,
}: {
  list: { rows: Entry[]; total: number; count: number };
  heads: Head[];
  funds: Fund[];
  accounts: AccountOption[];
  filter: Filter;
}) {
  const t = useT();
  const { canEnter, isAdmin } = useSession();
  const [editing, setEditing] = useState<Entry | "new" | null>(null);
  const remove = useAction(deleteOtherIncome, { success: "Entry deleted. Balance corrected." });
  const pages = Math.max(1, Math.ceil(list.count / PAGE_SIZE));
  const pageHref = (page: number) => {
    const p = new URLSearchParams({ from: filter.from, to: filter.to });
    if (filter.headId) p.set("head", filter.headId);
    if (filter.q) p.set("q", filter.q);
    p.set("page", String(page));
    return `/finances/other-income?${p}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Other Income"
        subtitle="Income other than collections – hall hire, sales, interest, fees and more. Each entry goes to Cash or Bank."
      >
        {canEnter && (
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            {t("Add income")}
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardContent>
          <form className="flex flex-wrap items-end gap-3">
            <Field label={t("From")} className="w-full sm:w-44">
              <Input type="date" name="from" defaultValue={filter.from} />
            </Field>
            <Field label={t("To")} className="w-full sm:w-44">
              <Input type="date" name="to" defaultValue={filter.to} />
            </Field>
            <Field label={t("Income head")} className="w-full sm:w-52">
              <NativeSelect name="head" defaultValue={filter.headId ?? ""}>
                <option value="">{t("All")}</option>
                {heads.map((h) => (
                  <option key={h.id} value={h.id}>
                    {t(h.name)}
                    {h.isActive ? "" : ` (${t("hidden")})`}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label={t("Search")} className="w-full sm:w-52">
              <Input name="q" defaultValue={filter.q} placeholder={t("Receipt no., name or note")} />
            </Field>
            <Button type="submit" variant="outline">
              <Search className="size-4" />
              {t("Show")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Total for this selection" value={formatMoney(list.total)} />
        <StatCard label="Entries" value={String(list.count)} />
      </div>

      <Card>
        <CardContent>
          {list.rows.length === 0 ? (
            <EmptyState message={t("No other income for this selection.")} />
          ) : (
            <ul className="divide-border divide-y">
              {list.rows.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {t(e.headName)}
                      {e.receivedFrom ? ` · ${e.receivedFrom}` : ""}
                    </p>
                    <p className="text-muted-foreground truncate text-sm">
                      {formatDate(e.date)}
                      {e.accountName ? ` · ${e.accountName}` : ""}
                      {e.fundName ? ` · ${t(e.fundName)}` : ""}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {t("Receipt No.")} {e.receiptNumber}
                      {e.bookNumber ? ` · ${t("Book")} ${e.bookNumber}` : ""}
                      {e.note ? ` · ${e.note}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <span className="text-success mr-1 font-semibold tabular-nums">{formatMoney(e.amount)}</span>
                    <Button variant="ghost" size="icon" className="size-8" aria-label={t("Receipt")} render={<Link href={`/receipts/other-income/${e.id}`} />}>
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
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-2 text-sm">
              <Button variant="outline" size="sm" disabled={filter.page <= 1} render={filter.page > 1 ? <Link href={pageHref(filter.page - 1)} /> : undefined}>
                <ChevronLeft className="size-4" />
                {t("Previous")}
              </Button>
              <span className="text-muted-foreground">
                {filter.page} / {pages}
              </span>
              <Button variant="outline" size="sm" disabled={filter.page >= pages} render={filter.page < pages ? <Link href={pageHref(filter.page + 1)} /> : undefined}>
                {t("Next")}
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {editing && (
        <IncomeDialog
          entry={editing === "new" ? null : editing}
          heads={heads}
          funds={funds}
          accounts={accounts}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function IncomeDialog({
  entry,
  heads,
  funds,
  accounts,
  onClose,
}: {
  entry: Entry | null;
  heads: Head[];
  funds: Fund[];
  accounts: AccountOption[];
  onClose: () => void;
}) {
  const t = useT();
  const router = useRouter();
  const { isAdmin } = useSession();
  // Heads made with "+ Add new head" join the list at once, without leaving the form.
  const [added, setAdded] = useState<Head[]>([]);
  const options = [...heads, ...added.filter((a) => !heads.some((h) => h.id === a.id))].filter(
    (h) => h.isActive || h.id === entry?.headId,
  );
  const [headId, setHeadId] = useState(entry?.headId ?? options[0]?.id ?? NEW_HEAD);
  const [newName, setNewName] = useState("");
  const save = useAction(saveOtherIncome, {
    success: "Income saved",
    onDone: (id) => {
      onClose();
      if (!entry && id) router.push(`/receipts/other-income/${id}`);
    },
  });
  const addHead = useAction(saveIncomeHead, {
    success: "Saved",
    onDone: (head) => {
      if (!head) return;
      setAdded((list) => [...list, { ...head, isActive: true, entries: 0 }]);
      setHeadId(head.id);
      setNewName("");
    },
  });
  function createHead() {
    const fd = new FormData();
    fd.set("name", newName);
    addHead.call(fd);
  }
  const general = funds.find((f) => f.name === "General Fund")?.id ?? funds.find((f) => f.isActive)?.id;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(entry ? "Edit income" : "Add income")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save.submit} className="flex flex-col gap-4">
          {entry && <input type="hidden" name="id" value={entry.id} />}
          <Field label={t("Income head")}>
            <NativeSelect name="headId" value={headId} onChange={(e) => setHeadId(e.target.value)} required>
              {options.map((h) => (
                <option key={h.id} value={h.id}>
                  {t(h.name)}
                </option>
              ))}
              {isAdmin && <option value={NEW_HEAD}>{t("+ Add new head")}</option>}
            </NativeSelect>
          </Field>
          {headId === NEW_HEAD && (
            <div className="flex items-end gap-2 rounded-xl border border-dashed p-3">
              <Field label={t("New head name")} className="flex-1">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newName.trim()) createHead();
                    }
                  }}
                  autoFocus
                />
              </Field>
              <Button type="button" onClick={createHead} disabled={!newName.trim() || addHead.pending}>
                {t("Add")}
              </Button>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Date")}>
              <Input name="date" type="date" defaultValue={entry?.date ?? todayIST()} required />
            </Field>
            <Field label={t("Amount (₹)")}>
              <Input name="amount" type="number" step="0.01" min="0.01" inputMode="decimal" defaultValue={entry?.amount} required />
            </Field>
            <Field label={t("Received from")}>
              <Input name="receivedFrom" defaultValue={entry?.receivedFrom ?? ""} />
            </Field>
            <Field label={t("Fund")}>
              <NativeSelect name="fundId" defaultValue={entry?.fundId ?? general}>
                {funds
                  .filter((f) => f.isActive || f.id === entry?.fundId)
                  .map((f) => (
                  <option key={f.id} value={f.id}>
                    {t(f.name)}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <AccountPicker accounts={accounts} label={t("Received via")} defaultValue={entry?.accountId} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Receipt No.")} hint={entry ? undefined : t("Leave empty for an automatic number")}>
              <Input name="receiptNumber" defaultValue={entry?.receiptNumber ?? ""} />
            </Field>
            <Field label={t("Book number")}>
              <Input name="bookNumber" defaultValue={entry?.bookNumber ?? ""} />
            </Field>
          </div>
          <Field label={t("Note / Description")}>
            <Input name="note" defaultValue={entry?.note ?? ""} />
          </Field>
          <SaveButton pending={save.pending} disabled={save.pending || headId === NEW_HEAD} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
