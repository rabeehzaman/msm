"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, ArrowRight, Banknote, Landmark, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { ConfirmButton } from "@/components/money/confirm-button";
import { Field, NativeSelect, SaveButton, useAction } from "@/components/money/form";
import { PageHeader, StatCard } from "@/components/money/page-header";
import { createTransfer, deleteTransfer, saveAccount, setAccountActive } from "@/lib/actions/accounts";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";

type Account = {
  id: string;
  name: string;
  type: "cash" | "bank";
  bankName: string | null;
  accountNumber: string | null;
  openingBalance: string;
  openingDate: string;
  isActive: boolean;
  notes: string | null;
  balance: number;
};

type LedgerLine = {
  id: string;
  date: string;
  direction: "in" | "out";
  kind: string;
  amount: string;
  category: string;
  party: string | null;
  note: string | null;
  sourceType: string;
  sourceId: string;
  accountId: string;
  createdByName: string | null;
};

export function CashBankClient({ accounts, recent }: { accounts: Account[]; recent: LedgerLine[] }) {
  const t = useT();
  const { isAdmin, canEnter } = useSession();
  const [editing, setEditing] = useState<Account | "new" | null>(null);
  const [transfer, setTransfer] = useState<"deposit" | "withdraw" | null>(null);
  const active = accounts.filter((a) => a.isActive);
  const cash = active.filter((a) => a.type === "cash").reduce((s, a) => s + a.balance, 0);
  const bank = active.filter((a) => a.type === "bank").reduce((s, a) => s + a.balance, 0);
  const accountName = new Map(accounts.map((a) => [a.id, a.name]));
  const remove = useAction(deleteTransfer, { success: "Transfer deleted. Balances corrected." });
  const toggle = useAction(setAccountActive);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Cash & Bank" subtitle="Live balances. Every payment in the app updates these automatically.">
        {canEnter && (
          <>
            <Button variant="outline" onClick={() => setTransfer("deposit")}>
              <ArrowLeftRight className="size-4" />
              {t("Deposit to bank")}
            </Button>
            <Button variant="outline" onClick={() => setTransfer("withdraw")}>
              <ArrowLeftRight className="size-4" />
              {t("Withdraw to cash")}
            </Button>
          </>
        )}
        {isAdmin && (
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            {t("Add account")}
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Cash in hand" value={formatMoney(cash)} icon={Banknote} tone="stat-icon-gold" />
        <StatCard label="Bank" value={formatMoney(bank)} icon={Landmark} tone="stat-icon-lagoon" />
        <StatCard label="Total balance" value={formatMoney(cash + bank)} icon={Wallet} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((a) => (
          <Card key={a.id} className={a.isActive ? "" : "opacity-60"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {a.type === "cash" ? <Banknote className="size-4" /> : <Landmark className="size-4" />}
                {a.name}
                {!a.isActive && <Badge variant="secondary">{t("Hidden")}</Badge>}
              </CardTitle>
              <CardDescription>
                {[a.bankName, a.accountNumber].filter(Boolean).join(" · ") ||
                  t("Opening {amount} on {date}", { amount: formatMoney(a.openingBalance), date: formatDate(a.openingDate) })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className={`font-heading text-3xl font-semibold tracking-tight ${a.balance < 0 ? "text-destructive" : ""}`}>
                {formatMoney(a.balance)}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" render={<Link href={`/reports/cash-book?account=${a.id}`} />}>
                  {t(a.type === "cash" ? "Open Cash Book" : "Open Bank Book")}
                  <ArrowRight className="size-3.5" />
                </Button>
                {isAdmin && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(a)}>
                      <Pencil className="size-3.5" />
                      {t("Edit")}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggle.call(a.id, !a.isActive)} disabled={toggle.pending}>
                      {t(a.isActive ? "Hide" : "Show")}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Latest movements")}</CardTitle>
          <CardDescription>{t("The newest entries across all accounts")}</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState message={t("No money entries yet.")} />
          ) : (
            <ul className="divide-border flex flex-col divide-y">
              {recent.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {t(l.category)}
                      {l.party ? ` · ${l.party}` : ""}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {formatDate(l.date)} · {accountName.get(l.accountId)}
                      {l.createdByName ? ` · ${l.createdByName}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className={`text-sm font-semibold tabular-nums ${l.direction === "in" ? "text-success" : "text-destructive"}`}>
                      {l.direction === "in" ? "+" : "−"}
                      {formatMoney(l.amount)}
                    </span>
                    {isAdmin && l.sourceType === "transfer" && l.direction === "in" && (
                      <ConfirmButton
                        title="Delete this transfer?"
                        description="Both sides of the transfer are removed and the balances are corrected. This is logged."
                        onConfirm={() => remove.call(l.sourceId)}
                        trigger={
                          <Button variant="ghost" size="icon" className="size-8" aria-label={t("Delete")}>
                            <Trash2 className="size-4" />
                          </Button>
                        }
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {editing && <AccountDialog account={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      {transfer && <TransferDialog mode={transfer} accounts={active} onClose={() => setTransfer(null)} />}
    </div>
  );
}

function AccountDialog({ account, onClose }: { account: Account | null; onClose: () => void }) {
  const t = useT();
  const [type, setType] = useState<"cash" | "bank">(account?.type ?? "bank");
  const save = useAction(saveAccount, { success: "Account saved", onDone: onClose });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(account ? "Edit account" : "Add account")}</DialogTitle>
          <DialogDescription>{t("The opening balance is the amount held on the opening date.")}</DialogDescription>
        </DialogHeader>
        <form action={save.call} className="flex flex-col gap-4">
          {account && <input type="hidden" name="id" value={account.id} />}
          <Field label={t("Type")}>
            <NativeSelect name="type" value={type} onChange={(e) => setType(e.target.value as "cash" | "bank")}>
              <option value="bank">{t("Bank")}</option>
              <option value="cash">{t("Cash")}</option>
            </NativeSelect>
          </Field>
          <Field label={t("Account name")}>
            <Input name="name" defaultValue={account?.name} placeholder={t("e.g. Federal Bank Current")} required />
          </Field>
          {type === "bank" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Bank name")}>
                <Input name="bankName" defaultValue={account?.bankName ?? ""} />
              </Field>
              <Field label={t("Account number")}>
                <Input name="accountNumber" defaultValue={account?.accountNumber ?? ""} />
              </Field>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Opening balance (₹)")}>
              <Input name="openingBalance" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={account?.openingBalance ?? "0"} />
            </Field>
            <Field label={t("Opening date")}>
              <Input name="openingDate" type="date" defaultValue={account?.openingDate ?? todayIST()} required />
            </Field>
          </div>
          <Field label={t("Note")}>
            <Textarea name="notes" rows={2} defaultValue={account?.notes ?? ""} />
          </Field>
          <SaveButton pending={save.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TransferDialog({
  mode,
  accounts,
  onClose,
}: {
  mode: "deposit" | "withdraw";
  accounts: Account[];
  onClose: () => void;
}) {
  const t = useT();
  const cash = accounts.filter((a) => a.type === "cash");
  const bank = accounts.filter((a) => a.type === "bank");
  const from = mode === "deposit" ? cash : bank;
  const to = mode === "deposit" ? bank : cash;
  const save = useAction(createTransfer, { success: "Transfer saved", onDone: onClose });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(mode === "deposit" ? "Deposit to bank" : "Withdraw to cash")}</DialogTitle>
          <DialogDescription>{t("Moves money between accounts. It is not counted as income or expense.")}</DialogDescription>
        </DialogHeader>
        {bank.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("Add a bank account first.")}</p>
        ) : (
          <form action={save.call} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("From")}>
                <NativeSelect name="fromAccountId" required>
                  {from.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatMoney(a.balance)})
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={t("To")}>
                <NativeSelect name="toAccountId" required>
                  {to.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatMoney(a.balance)})
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Amount (₹)")}>
                <Input name="amount" type="number" step="0.01" min="0.01" inputMode="decimal" required />
              </Field>
              <Field label={t("Date")}>
                <Input name="date" type="date" defaultValue={todayIST()} required />
              </Field>
            </div>
            <Field label={t("Note")}>
              <Input name="note" />
            </Field>
            <SaveButton pending={save.pending} />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
