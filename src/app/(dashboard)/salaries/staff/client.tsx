"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { Field, NativeSelect, SaveButton, useAction } from "@/components/money/form";
import { PageHeader } from "@/components/money/page-header";
import { saveStaff, setStaffActive } from "@/lib/actions/salary";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import { staffRoleLabel } from "@/lib/salary/calc";

type Person = {
  id: string;
  name: string;
  role: "ustadh" | "cleaning" | "other";
  phone: string | null;
  monthlySalary: string;
  joiningDate: string;
  duesFrom: string | null;
  isActive: boolean;
  cleaningFee: string;
  cleaningMode: "none" | "included" | "separate";
  notes: string | null;
};

export function StaffClient({ people }: { people: Person[] }) {
  const t = useT();
  const { isAdmin } = useSession();
  const [editing, setEditing] = useState<Person | "new" | null>(null);
  const toggle = useAction(setStaffActive);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Staff" subtitle="Ustadhs, cleaning staff and others.">
        {isAdmin && (
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            {t("Add staff")}
          </Button>
        )}
      </PageHeader>
      {people.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState message={t("No staff added yet.")} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {people.map((p) => (
            <Card key={p.id} className={p.isActive ? "" : "opacity-60"}>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading truncate text-lg font-semibold">{p.name}</p>
                    <p className="text-muted-foreground text-sm">{t(staffRoleLabel[p.role])}</p>
                  </div>
                  {!p.isActive && <Badge variant="secondary">{t("Inactive")}</Badge>}
                </div>
                <p className="text-sm">
                  {formatMoney(p.monthlySalary)} {t("per month")}
                </p>
                {p.cleaningMode !== "none" && (
                  <p className="text-muted-foreground text-sm">
                    {t("Cleaning")} {formatMoney(p.cleaningFee)} · {t(p.cleaningMode === "included" ? "in the same payment" : "paid separately")}
                  </p>
                )}
                <p className="text-muted-foreground text-xs">
                  {t("Joined")} {formatDate(p.joiningDate)}
                  {p.phone ? ` · ${p.phone}` : ""}
                </p>
                {isAdmin && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(p)}>
                      <Pencil className="size-3.5" />
                      {t("Edit")}
                    </Button>
                    <Button variant="ghost" size="sm" disabled={toggle.pending} onClick={() => toggle.call(p.id, !p.isActive)}>
                      {t(p.isActive ? "Mark inactive" : "Mark active")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {editing && <StaffDialog person={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function StaffDialog({ person, onClose }: { person: Person | null; onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const [mode, setMode] = useState(person?.cleaningMode ?? "none");
  const save = useAction(saveStaff, {
    success: "Staff saved",
    onDone: () => {
      onClose();
      router.refresh();
    },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(person ? "Edit staff" : "Add staff")}</DialogTitle>
        </DialogHeader>
        <form action={save.call} className="flex flex-col gap-4">
          {person && <input type="hidden" name="id" value={person.id} />}
          <Field label={t("Name")}>
            <Input name="name" defaultValue={person?.name} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Role")}>
              <NativeSelect name="role" defaultValue={person?.role ?? "ustadh"}>
                <option value="ustadh">{t("Ustadh")}</option>
                <option value="cleaning">{t("Cleaning staff")}</option>
                <option value="other">{t("Other")}</option>
              </NativeSelect>
            </Field>
            <Field label={t("Phone")}>
              <Input name="phone" type="tel" inputMode="tel" defaultValue={person?.phone ?? ""} />
            </Field>
            <Field label={t("Monthly salary (₹)")}>
              <Input name="monthlySalary" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={person?.monthlySalary ?? ""} />
            </Field>
            <Field label={t("Joining date")}>
              <Input name="joiningDate" type="date" defaultValue={person?.joiningDate ?? todayIST()} required />
            </Field>
          </div>
          <Field label={t("Count dues from")} hint={t("Optional. Older months are not shown as pending.")}>
            <Input name="duesFrom" type="date" defaultValue={person?.duesFrom ?? ""} />
          </Field>
          <Field label={t("Cleaning fee")}>
            <NativeSelect name="cleaningMode" value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
              <option value="none">{t("No cleaning fee")}</option>
              <option value="included">{t("Included: shown as a separate line in the same payment")}</option>
              <option value="separate">{t("Separate: paid and tracked as its own monthly payment")}</option>
            </NativeSelect>
          </Field>
          {mode !== "none" && (
            <Field label={t("Cleaning fee per month (₹)")}>
              <Input name="cleaningFee" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={person?.cleaningFee ?? ""} required />
            </Field>
          )}
          <Field label={t("Note")}>
            <Textarea name="notes" rows={2} defaultValue={person?.notes ?? ""} />
          </Field>
          <SaveButton pending={save.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
