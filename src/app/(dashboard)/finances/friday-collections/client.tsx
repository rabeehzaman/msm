"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, IndianRupee, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { ConfirmButton } from "@/components/money/confirm-button";
import { AccountPicker, Field, SaveButton, useAction, type AccountOption } from "@/components/money/form";
import { PageHeader, StatCard } from "@/components/money/page-header";
import { deleteFriday, saveFriday } from "@/lib/actions/collections";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";

type Entry = {
  id: string;
  date: string;
  totalAmount: string;
  countedBy: string | null;
  notes: string | null;
  accountId: string | null;
  accountName: string | null;
};

export function FridayCollectionsClient({ collections, accounts }: { collections: Entry[]; accounts: AccountOption[] }) {
  const t = useT();
  const router = useRouter();
  const { canEnter, isAdmin } = useSession();
  const [editing, setEditing] = useState<Entry | "new" | null>(null);
  const remove = useAction(deleteFriday, { success: "Entry deleted. Balance corrected.", onDone: () => router.refresh() });
  const month = todayIST().slice(0, 7);
  const thisMonth = collections.filter((c) => c.date.startsWith(month));
  const sum = (list: Entry[]) => list.reduce((s, c) => s + Number(c.totalAmount), 0);
  const average = collections.length ? sum(collections) / collections.length : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Friday Collections" subtitle="Jumu'ah collection, with who counted it. It goes straight to Cash or Bank.">
        {canEnter && (
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            {t("Add Friday collection")}
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="This month" value={formatMoney(sum(thisMonth))} icon={IndianRupee} tone="stat-icon-gold" />
        <StatCard label="Average per Friday" value={formatMoney(Math.round(average))} icon={CalendarDays} />
        <StatCard label="Fridays recorded" value={String(collections.length)} icon={CalendarDays} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("History")}</CardTitle>
        </CardHeader>
        <CardContent>
          {collections.length === 0 ? (
            <EmptyState message={t("No Friday collections yet.")} />
          ) : (
            <ul className="divide-border divide-y">
              {collections.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{formatDate(c.date)}</p>
                    <p className="text-muted-foreground truncate text-sm">
                      {[c.countedBy ? `${t("Counted by")} ${c.countedBy}` : null, c.accountName].filter(Boolean).join(" · ")}
                    </p>
                    {c.notes && <p className="text-muted-foreground truncate text-xs">{c.notes}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <span className="text-success mr-1 font-semibold tabular-nums">{formatMoney(c.totalAmount)}</span>
                    {isAdmin && (
                      <>
                        <Button variant="ghost" size="icon" className="size-8" aria-label={t("Edit")} onClick={() => setEditing(c)}>
                          <Pencil className="size-4" />
                        </Button>
                        <ConfirmButton
                          title="Delete this entry?"
                          description="The amount is taken back out of Cash/Bank. This is logged."
                          onConfirm={() => remove.call(c.id)}
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

      {editing && <FridayDialog entry={editing === "new" ? null : editing} accounts={accounts} onClose={() => setEditing(null)} />}
    </div>
  );
}

// The most recent Friday, or today if today is Friday.
function lastFriday() {
  const today = new Date(`${todayIST()}T00:00:00Z`);
  const back = (today.getUTCDay() + 2) % 7;
  return new Date(today.getTime() - back * 86400000).toISOString().slice(0, 10);
}

function FridayDialog({ entry, accounts, onClose }: { entry: Entry | null; accounts: AccountOption[]; onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const save = useAction(saveFriday, {
    success: "Collection saved",
    onDone: () => {
      onClose();
      router.refresh();
    },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(entry ? "Edit Friday collection" : "Add Friday collection")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save.submit} className="flex flex-col gap-4">
          {entry && <input type="hidden" name="id" value={entry.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Date")}>
              <Input name="date" type="date" defaultValue={entry?.date ?? lastFriday()} required />
            </Field>
            <Field label={t("Amount (₹)")}>
              <Input name="amount" type="number" step="0.01" min="0.01" inputMode="decimal" defaultValue={entry?.totalAmount} required />
            </Field>
          </div>
          <Field label={t("Counted by (names)")}>
            <Input name="countedBy" defaultValue={entry?.countedBy ?? ""} />
          </Field>
          <AccountPicker accounts={accounts} label={t("Received via")} defaultValue={entry?.accountId} />
          <Field label={t("Note")}>
            <Input name="notes" defaultValue={entry?.notes ?? ""} />
          </Field>
          <SaveButton pending={save.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
