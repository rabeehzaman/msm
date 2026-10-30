"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { ConfirmButton } from "@/components/money/confirm-button";
import { Field, NativeSelect, SaveButton, useAction } from "@/components/money/form";
import { PageHeader } from "@/components/money/page-header";
import { deleteAllowance, saveAllowance } from "@/lib/actions/salary";
import { useSession } from "@/lib/auth/session";
import { currentYearMonth, formatMoney, MONTHS } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import { allowanceShare } from "@/lib/salary/calc";

type Allowance = {
  id: string;
  staffName: string;
  year: number;
  amount: string;
  mode: "lump" | "split";
  months: number[];
  note: string | null;
};

export function RamadanClient({ allowances, staff }: { allowances: Allowance[]; staff: { id: string; name: string }[] }) {
  const t = useT();
  const router = useRouter();
  const { isAdmin } = useSession();
  const [open, setOpen] = useState(false);
  const remove = useAction(deleteAllowance, { success: "Allowance deleted", onDone: () => router.refresh() });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Ramadan allowance" subtitle="Paid as a lump sum in one month, or divided equally across months and added to the salary.">
        {isAdmin && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            {t("Add allowance")}
          </Button>
        )}
      </PageHeader>
      <Card>
        <CardContent>
          {allowances.length === 0 ? (
            <EmptyState message={t("No allowances added yet.")} />
          ) : (
            <ul className="divide-border divide-y">
              {allowances.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {a.staffName} · {formatMoney(a.amount)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {a.year} ·{" "}
                      {a.months.map((m) => `${t(MONTHS[m - 1])} ${formatMoney(allowanceShare(a, m))}`).join(", ")}
                    </p>
                  </div>
                  {isAdmin && (
                    <ConfirmButton
                      title="Delete this allowance?"
                      description="It is removed from the months that are not paid yet."
                      onConfirm={() => remove.call(a.id)}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label={t("Delete")} disabled={remove.pending}>
                          <Trash2 className="size-4" />
                        </Button>
                      }
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      {open && <AllowanceDialog staff={staff} onClose={() => setOpen(false)} />}
    </div>
  );
}

function AllowanceDialog({ staff, onClose }: { staff: { id: string; name: string }[]; onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const now = currentYearMonth();
  const [mode, setMode] = useState<"lump" | "split">("lump");
  const save = useAction(saveAllowance, {
    success: "Allowance saved",
    onDone: () => {
      onClose();
      router.refresh();
    },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("Add allowance")}</DialogTitle>
          <DialogDescription>{t("For all ustadhs, each person gets the full amount entered here.")}</DialogDescription>
        </DialogHeader>
        <form action={save.call} className="flex flex-col gap-4">
          <Field label={t("For")}>
            <NativeSelect name="staffId" defaultValue="all">
              <option value="all">{t("All ustadhs")}</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("Amount (₹)")}>
              <Input name="amount" type="number" step="0.01" min="0.01" inputMode="decimal" required />
            </Field>
            <Field label={t("Year")}>
              <Input name="year" type="number" defaultValue={now.year} required />
            </Field>
          </div>
          <Field label={t("How is it paid?")}>
            <NativeSelect name="mode" value={mode} onChange={(e) => setMode(e.target.value as "lump" | "split")}>
              <option value="lump">{t("Lump sum in one month")}</option>
              <option value="split">{t("Divided equally across months")}</option>
            </NativeSelect>
          </Field>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">{t(mode === "lump" ? "Month" : "Months")}</legend>
            <div className="grid grid-cols-4 gap-2" key={mode}>
              {MONTHS.map((m, i) => (
                <label
                  key={m}
                  className="has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary flex h-10 cursor-pointer items-center justify-center rounded-xl border border-input text-sm"
                >
                  <input type={mode === "lump" ? "radio" : "checkbox"} name="months" value={i + 1} className="sr-only" />
                  {t(m)}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label={t("Note")}>
            <Input name="note" />
          </Field>
          <SaveButton pending={save.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
