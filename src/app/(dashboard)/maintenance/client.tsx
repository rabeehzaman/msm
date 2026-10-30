"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { ConfirmButton } from "@/components/money/confirm-button";
import { AccountPicker, Field, NativeSelect, SaveButton, useAction, type AccountOption } from "@/components/money/form";
import { PageHeader } from "@/components/money/page-header";
import { PhotoButton, PhotoField } from "@/components/money/photo";
import { deleteMaintenance, payMaintenance, saveMaintenance, undoMaintenancePayment } from "@/lib/actions/expenses";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";

type Log = {
  id: string;
  date: string;
  buildingId: string | null;
  buildingName: string | null;
  roomId: string | null;
  roomName: string | null;
  area: string | null;
  work: string;
  doneBy: string | null;
  cost: string;
  status: string;
  photoPath: string | null;
  paidDate: string | null;
  paidVia: string | null;
};

type Tree = { id: string; name: string; floors: { id: string; name: string; rooms: { id: string; name: string }[] }[] }[];

const statusLabel: Record<string, string> = { pending: "Pending", in_progress: "In Progress", done: "Done" };

export function MaintenanceClient({
  logs,
  tree,
  accounts,
  building,
  room,
}: {
  logs: Log[];
  tree: Tree;
  accounts: AccountOption[];
  building: string;
  room: string;
}) {
  const t = useT();
  const router = useRouter();
  const { canEnter, isAdmin } = useSession();
  const [editing, setEditing] = useState<Log | "new" | null>(null);
  const [paying, setPaying] = useState<Log | null>(null);
  const refresh = () => router.refresh();
  const remove = useAction(deleteMaintenance, { success: "Entry deleted", onDone: refresh });
  const undo = useAction(undoMaintenancePayment, { success: "Payment undone. Balance corrected.", onDone: refresh });
  const roomsOf = tree.find((b) => b.id === building)?.floors.flatMap((f) => f.rooms.map((r) => ({ ...r, floor: f.name }))) ?? [];

  function go(nextBuilding: string, nextRoom: string) {
    const params = new URLSearchParams();
    if (nextBuilding) params.set("building", nextBuilding);
    if (nextRoom) params.set("room", nextRoom);
    router.push(`/maintenance?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Maintenance" subtitle="When the cost is paid it posts as an expense automatically. No second entry is needed.">
        {canEnter && (
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            {t("Add work")}
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardContent className="flex flex-wrap gap-3">
          <Field label={t("Building")} className="w-full sm:w-56">
            <NativeSelect value={building} onChange={(e) => go(e.target.value, "")}>
              <option value="">{t("All buildings")}</option>
              {tree.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("Room")} className="w-full sm:w-56">
            <NativeSelect value={room} onChange={(e) => go(building, e.target.value)} disabled={!building}>
              <option value="">{t("All rooms")}</option>
              {roomsOf.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.floor} – {r.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {logs.length === 0 ? (
            <EmptyState message={t("No maintenance work recorded.")} />
          ) : (
            <ul className="divide-border divide-y">
              {logs.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{l.work}</p>
                    <p className="text-muted-foreground text-sm">
                      {formatDate(l.date)}
                      {[l.buildingName, l.roomName, l.area].filter(Boolean).map((x) => ` · ${x}`).join("")}
                      {l.doneBy ? ` · ${l.doneBy}` : ""}
                    </p>
                    {l.paidDate && (
                      <p className="text-success text-xs">
                        {t("Paid")} {formatDate(l.paidDate)}
                        {l.paidVia ? ` · ${l.paidVia}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={l.status === "done" ? "default" : "secondary"}>{t(statusLabel[l.status])}</Badge>
                    <span className="mx-1 font-semibold tabular-nums">{formatMoney(l.cost)}</span>
                    {l.photoPath && <PhotoButton path={l.photoPath} />}
                    {!l.paidDate && Number(l.cost) > 0 && canEnter && (
                      <Button size="sm" onClick={() => setPaying(l)}>
                        {t("Pay")}
                      </Button>
                    )}
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="size-8" aria-label={t("Edit")} onClick={() => setEditing(l)}>
                        <Pencil className="size-4" />
                      </Button>
                    )}
                    {isAdmin && !l.paidDate && (
                      <ConfirmButton
                        title="Delete this entry?"
                        description="The entry is removed. No money has moved for it."
                        onConfirm={() => remove.call(l.id)}
                        trigger={
                          <Button variant="ghost" size="icon" className="size-8" aria-label={t("Delete")}>
                            <Trash2 className="size-4" />
                          </Button>
                        }
                      />
                    )}
                    {isAdmin && l.paidDate && (
                      <ConfirmButton
                        title="Undo this payment?"
                        description="The expense is removed and the amount goes back into Cash/Bank. This is logged."
                        confirmLabel="Undo"
                        onConfirm={() => undo.call(l.id)}
                        trigger={
                          <Button variant="ghost" size="icon" className="size-8" aria-label={t("Undo")}>
                            <Undo2 className="size-4" />
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

      {editing && <LogDialog log={editing === "new" ? null : editing} tree={tree} onClose={() => setEditing(null)} />}
      {paying && <PayDialog log={paying} accounts={accounts} onClose={() => setPaying(null)} />}
    </div>
  );
}

function LogDialog({ log, tree, onClose }: { log: Log | null; tree: Tree; onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const [buildingId, setBuildingId] = useState(log?.buildingId ?? "");
  const rooms = tree.find((b) => b.id === buildingId)?.floors.flatMap((f) => f.rooms.map((r) => ({ ...r, floor: f.name }))) ?? [];
  const save = useAction(saveMaintenance, {
    success: "Saved",
    onDone: () => {
      onClose();
      router.refresh();
    },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(log ? "Edit work" : "Add work")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save.submit} className="flex flex-col gap-4">
          {log && <input type="hidden" name="id" value={log.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Date")}>
              <Input name="date" type="date" defaultValue={log?.date ?? todayIST()} required />
            </Field>
            <Field label={t("Status")}>
              <NativeSelect name="status" defaultValue={log?.status ?? "pending"}>
                <option value="pending">{t("Pending")}</option>
                <option value="in_progress">{t("In Progress")}</option>
                <option value="done">{t("Done")}</option>
              </NativeSelect>
            </Field>
            <Field label={t("Building")}>
              <NativeSelect name="buildingId" value={buildingId} onChange={(e) => setBuildingId(e.target.value)}>
                <option value="">{t("None")}</option>
                {tree.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label={t("Room")}>
              <NativeSelect name="roomId" defaultValue={log?.roomId ?? ""} disabled={!buildingId} key={buildingId}>
                <option value="">{t("None")}</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.floor} – {r.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <Field label={t("Area")}>
            <Input name="area" defaultValue={log?.area ?? ""} placeholder={t("e.g. Wudu area, compound")} />
          </Field>
          <Field label={t("Work description")}>
            <Textarea name="work" rows={2} defaultValue={log?.work} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Done by")}>
              <Input name="doneBy" defaultValue={log?.doneBy ?? ""} />
            </Field>
            <Field label={t("Cost (₹)")}>
              <Input name="cost" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={log?.cost ?? ""} />
            </Field>
          </div>
          <PhotoField folder="maintenance" label={t(log?.photoPath ? "Replace the photo" : "Photo")} />
          <SaveButton pending={save.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PayDialog({ log, accounts, onClose }: { log: Log; accounts: AccountOption[]; onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const pay = useAction(payMaintenance, {
    success: "Paid and posted as an expense",
    onDone: () => {
      onClose();
      router.refresh();
    },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("Pay")} {formatMoney(log.cost)}
          </DialogTitle>
          <DialogDescription>{log.work}</DialogDescription>
        </DialogHeader>
        <form onSubmit={pay.submit} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={log.id} />
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
