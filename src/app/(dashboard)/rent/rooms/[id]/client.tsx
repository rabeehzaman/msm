"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, DoorClosed, IndianRupee, Pencil, Phone, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { Field, NativeSelect, SaveButton, useAction, type AccountOption } from "@/components/money/form";
import { PageHeader } from "@/components/money/page-header";
import { cellClass } from "@/components/rent/cell";
import { RentSheet, type RentPayment, type SheetTarget } from "@/components/rent/rent-sheets";
import { changeRent, endTenancy, saveRoom, startTenancy, updateTenancy } from "@/lib/actions/rent";
import { useSession } from "@/lib/auth/session";
import { currentYearMonth, formatDate, formatMoney, MONTHS, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import type { CellStatus } from "@/lib/rent/status";

type Tenancy = {
  id: string;
  tenantName: string;
  phone: string | null;
  shopName: string | null;
  startDate: string;
  endDate: string | null;
  duesFrom: string | null;
  notes: string | null;
};

type Room = {
  id: string;
  name: string;
  notes: string | null;
  label: string;
  tenancies: Tenancy[];
  rents: { id: string; amount: string; effectiveFrom: string }[];
};

type Cell = {
  month: number;
  status: CellStatus;
  expected: number;
  tenantName: string | null;
  payment: RentPayment | null;
};

type Dialogs = "start" | "edit" | "end" | "rent" | "room" | null;

export function RoomClient({
  room,
  months,
  year,
  currentYear,
  accounts,
}: {
  room: Room;
  months: Cell[];
  year: number;
  currentYear: number;
  accounts: AccountOption[];
}) {
  const t = useT();
  const router = useRouter();
  const { isAdmin, canEnter } = useSession();
  const [dialog, setDialog] = useState<Dialogs>(null);
  const [target, setTarget] = useState<SheetTarget | null>(null);
  const open = room.tenancies.find((x) => !x.endDate);
  const lastEnd = room.tenancies.find((x) => x.endDate)?.endDate;

  function openCell(cell: Cell) {
    if (cell.status === "vacant") {
      toast.info(t("This room has no tenant for that month."));
      return;
    }
    if (!canEnter) return;
    setTarget({
      roomId: room.id,
      roomLabel: room.label,
      tenantName: cell.tenantName,
      year,
      month: cell.month,
      expected: cell.expected,
      payment: cell.payment,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={room.label}>
        <Button variant="outline" render={<Link href="/rent" />}>
          <ArrowLeft className="size-4" />
          {t("Rent")}
        </Button>
        {isAdmin && (
          <Button variant="outline" onClick={() => setDialog("room")}>
            <Pencil className="size-4" />
            {t("Rename")}
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              {t("Tenant")}
              <Badge variant={open ? "default" : "secondary"}>{t(open ? "Occupied" : "Vacant")}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {open ? (
              <>
                <div>
                  <p className="font-heading text-xl font-semibold">{open.tenantName}</p>
                  {open.shopName && <p className="text-muted-foreground text-sm">{open.shopName}</p>}
                  {open.phone && (
                    <a href={`tel:${open.phone}`} className="text-primary mt-1 flex items-center gap-1 text-sm">
                      <Phone className="size-3.5" />
                      {open.phone}
                    </a>
                  )}
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t("Rent start date")}: {formatDate(open.startDate)}
                  </p>
                  {open.notes && <p className="text-muted-foreground mt-1 text-sm">{open.notes}</p>}
                </div>
                {isAdmin && (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDialog("edit")}>
                      <Pencil className="size-3.5" />
                      {t("Edit")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDialog("rent")}>
                      <IndianRupee className="size-3.5" />
                      {t("Change rent")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDialog("end")}>
                      <DoorClosed className="size-3.5" />
                      {t("End tenancy")}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-muted-foreground text-sm">{t("This room has no tenant.")}</p>
                {isAdmin && (
                  <Button size="sm" className="self-start" onClick={() => setDialog("start")}>
                    <UserPlus className="size-4" />
                    {t("Add tenant")}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              {t("Calendar")}
              <NativeSelect
                aria-label={t("Year")}
                className="w-28"
                value={year}
                onChange={(e) => router.push(`/rent/rooms/${room.id}?year=${e.target.value}`)}
              >
                {Array.from({ length: 8 }, (_, i) => currentYear + 1 - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </NativeSelect>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {months.map((cell) => (
                <button
                  key={cell.month}
                  type="button"
                  onClick={() => openCell(cell)}
                  className={`flex min-h-20 flex-col rounded-xl p-2.5 text-left transition-transform active:scale-[0.98] ${cellClass[cell.status]}`}
                >
                  <span className="text-sm font-semibold">{t(MONTHS[cell.month - 1])}</span>
                  {cell.payment ? (
                    <span className="mt-auto text-xs leading-tight">
                      {formatMoney(cell.payment.amount)}
                      <br />
                      {formatDate(cell.payment.paidDate)}
                      <br />
                      {cell.payment.accountName}
                    </span>
                  ) : cell.status === "due" || cell.status === "upcoming" ? (
                    <span className="mt-auto text-xs">{formatMoney(cell.expected)}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("Rent history")}</CardTitle>
          </CardHeader>
          <CardContent>
            {room.rents.length === 0 ? (
              <EmptyState message={t("No rent set yet.")} />
            ) : (
              <ul className="divide-border divide-y text-sm">
                {room.rents.map((r) => (
                  <li key={r.id} className="flex justify-between py-2">
                    <span>{t("From {month}", { month: `${t(MONTHS[Number(r.effectiveFrom.slice(5, 7)) - 1])} ${r.effectiveFrom.slice(0, 4)}` })}</span>
                    <span className="font-medium">{formatMoney(r.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("Tenant history")}</CardTitle>
          </CardHeader>
          <CardContent>
            {room.tenancies.length === 0 ? (
              <EmptyState message={t("No tenants yet.")} />
            ) : (
              <ul className="divide-border divide-y text-sm">
                {room.tenancies.map((x) => (
                  <li key={x.id} className="flex justify-between gap-3 py-2">
                    <span className="min-w-0 truncate">
                      {x.tenantName}
                      {x.shopName ? ` · ${x.shopName}` : ""}
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      {formatDate(x.startDate)} – {x.endDate ? formatDate(x.endDate) : t("Now")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {target && <RentSheet target={target} accounts={accounts} onClose={() => setTarget(null)} />}
      {dialog === "start" && <TenancyDialog roomId={room.id} earliest={lastEnd} onClose={() => setDialog(null)} />}
      {dialog === "edit" && open && <TenancyDialog tenancy={open} roomId={room.id} onClose={() => setDialog(null)} />}
      {dialog === "end" && open && <EndDialog tenancy={open} onClose={() => setDialog(null)} />}
      {dialog === "rent" && <RentDialog roomId={room.id} current={room.rents[0]?.amount} onClose={() => setDialog(null)} />}
      {dialog === "room" && <RoomDialog room={room} onClose={() => setDialog(null)} />}
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

function TenancyDialog({
  tenancy,
  roomId,
  earliest,
  onClose,
}: {
  tenancy?: Tenancy;
  roomId: string;
  earliest?: string | null;
  onClose: () => void;
}) {
  const t = useT();
  const done = useDone(onClose);
  const create = useAction(startTenancy, { success: "Tenant saved", onDone: done });
  const update = useAction(updateTenancy, { success: "Tenant saved", onDone: done });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(tenancy ? "Edit tenant" : "Add tenant")}</DialogTitle>
          
        </DialogHeader>
        <form action={tenancy ? update.call : create.call} className="flex flex-col gap-4">
          {tenancy ? <input type="hidden" name="id" value={tenancy.id} /> : <input type="hidden" name="roomId" value={roomId} />}
          <Field label={t("Tenant name")}>
            <Input name="tenantName" defaultValue={tenancy?.tenantName} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Phone")}>
              <Input name="phone" type="tel" inputMode="tel" defaultValue={tenancy?.phone ?? ""} />
            </Field>
            <Field label={t("Shop name or purpose")}>
              <Input name="shopName" defaultValue={tenancy?.shopName ?? ""} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {!tenancy && (
              <Field label={t("Monthly rent (₹)")}>
                <Input name="rent" type="number" step="0.01" min="0.01" inputMode="decimal" required />
              </Field>
            )}
            <Field label={t("Rent start date")}>
              <Input name="startDate" type="date" min={earliest ?? undefined} defaultValue={tenancy?.startDate ?? todayIST()} required />
            </Field>
            <Field label={t("Count dues from")} hint={t("Optional. Older months are not shown as pending.")}>
              <Input name="duesFrom" type="date" defaultValue={tenancy?.duesFrom ?? ""} />
            </Field>
          </div>
          <Field label={t("Note")}>
            <Textarea name="notes" rows={2} defaultValue={tenancy?.notes ?? ""} />
          </Field>
          <SaveButton pending={create.pending || update.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EndDialog({ tenancy, onClose }: { tenancy: Tenancy; onClose: () => void }) {
  const t = useT();
  const end = useAction(endTenancy, { success: "Tenancy closed", onDone: useDone(onClose) });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("End tenancy")}</DialogTitle>
          <DialogDescription>
            {t("{name} is closed on this date. Their payment history stays.", { name: tenancy.tenantName })}
          </DialogDescription>
        </DialogHeader>
        <form action={end.call} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={tenancy.id} />
          <Field label={t("End date")}>
            <Input name="endDate" type="date" min={tenancy.startDate} defaultValue={todayIST()} required />
          </Field>
          <SaveButton pending={end.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RentDialog({ roomId, current, onClose }: { roomId: string; current?: string; onClose: () => void }) {
  const t = useT();
  const now = currentYearMonth();
  const change = useAction(changeRent, { success: "Rent changed", onDone: useDone(onClose) });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Change rent")}</DialogTitle>
          <DialogDescription>{t("Past months stay at the old rent. The new rent applies from the month you choose.")}</DialogDescription>
        </DialogHeader>
        <form action={change.call} className="flex flex-col gap-4">
          <input type="hidden" name="roomId" value={roomId} />
          <Field label={t("New monthly rent (₹)")}>
            <Input name="rent" type="number" step="0.01" min="0.01" inputMode="decimal" defaultValue={current} required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("From month")}>
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
          <SaveButton pending={change.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RoomDialog({ room, onClose }: { room: Room; onClose: () => void }) {
  const t = useT();
  const save = useAction(saveRoom, { success: "Saved", onDone: useDone(onClose) });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Rename room")}</DialogTitle>
        </DialogHeader>
        <form action={save.call} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={room.id} />
          <Field label={t("Name")}>
            <Input name="name" defaultValue={room.name} required />
          </Field>
          <Field label={t("Note")}>
            <Textarea name="notes" rows={2} defaultValue={room.notes ?? ""} />
          </Field>
          <SaveButton pending={save.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
