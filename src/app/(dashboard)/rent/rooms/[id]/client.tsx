"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, DoorClosed, IndianRupee, Pencil, Phone, ReceiptIndianRupee, UserPlus } from "lucide-react";
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
import { RentSheet, type SheetRoom, type SheetTarget } from "@/components/rent/rent-sheets";
import { VariableTag } from "@/components/rent/tags";
import { changeRent, endTenancy, saveRoom, startTenancy, updateTenancy } from "@/lib/actions/rent";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, MONTHS, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import { currentRentType, defaultRentalMonth, roomMonth, type YearMonth } from "@/lib/rent/status";

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

type Room = Omit<SheetRoom, "tenancies" | "rents"> & {
  name: string;
  notes: string | null;
  tenancies: Tenancy[];
  rents: { id: string; amount: string; effectiveFrom: string; rentType: string }[];
};

type Dialogs = "start" | "edit" | "end" | "rent" | "room" | null;

export function RoomClient({
  room,
  initialYear,
  now,
  accounts,
}: {
  room: Room;
  initialYear: number;
  now: YearMonth;
  accounts: AccountOption[];
}) {
  const t = useT();
  const { isAdmin, canEnter } = useSession();
  const [dialog, setDialog] = useState<Dialogs>(null);
  const [target, setTarget] = useState<SheetTarget | null>(null);
  const [year, setYear] = useState(initialYear);
  const open = room.tenancies.find((x) => !x.endDate);
  const lastEnd = room.tenancies.find((x) => x.endDate)?.endDate;
  const rentType = currentRentType(room.rents, now);
  const everVariable = room.rents.some((r) => r.rentType === "variable");
  // Worked out on the phone from the room's facts, so the year switch needs no new request.
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => roomMonth(room, year, i + 1, now)), [room, year, now]);

  function changeYear(value: number) {
    setYear(value);
    window.history.replaceState(null, "", `/rent/rooms/${room.id}?year=${value}`);
  }

  function openCell(cell: (typeof months)[number]) {
    if (cell.status === "vacant" && cell.paidCount === 0) {
      toast.info(t("This room has no tenant for that month."));
      return;
    }
    if (!canEnter) return;
    setTarget({ room, year, month: cell.month });
  }

  // Not opened from a month: start on the oldest month still owed, else this month.
  function recordRent() {
    const start = defaultRentalMonth(room, now);
    setTarget({ room, year: start.year, month: start.month });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={room.label}>
        {rentType === "variable" && <VariableTag />}
        {canEnter && open && (
          <Button onClick={recordRent}>
            <ReceiptIndianRupee className="size-4" />
            {t("Record rent")}
          </Button>
        )}
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
                onChange={(e) => changeYear(Number(e.target.value))}
              >
                {Array.from({ length: 8 }, (_, i) => now.year + 1 - i).map((y) => (
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
                  <MonthDetail room={room} cell={cell} />
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
                    {r.rentType === "variable" ? (
                      <span className="font-medium">
                        {t("Variable")}
                        {Number(r.amount) > 0 && (
                          <span className="text-muted-foreground font-normal"> · {t("usual")} {formatMoney(r.amount)}</span>
                        )}
                      </span>
                    ) : (
                      <span className="font-medium">{formatMoney(r.amount)}</span>
                    )}
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

      {everVariable && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("Month by month")} · {year}
            </CardTitle>
          </CardHeader>
          <CardContent className="table-shell overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-left text-xs">
                  <th className="py-2 font-medium">{t("Rental Month")}</th>
                  <th className="py-2 text-right font-medium">{t("Rent")}</th>
                  <th className="py-2 text-right font-medium">{t("Paid")}</th>
                  <th className="py-2 text-right font-medium">{t("Balance")}</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {months
                  .filter((c) => c.tenancy)
                  .map((c) => (
                    <tr key={c.month}>
                      <td className="py-2">
                        {t(MONTHS[c.month - 1])} {year}
                        {c.type === "variable" && <span className="text-muted-foreground text-xs"> · {t("Variable")}</span>}
                      </td>
                      <td className="py-2 text-right tabular-nums">{c.due === null ? t("Amount not set") : formatMoney(c.due)}</td>
                      <td className="py-2 text-right tabular-nums">{formatMoney(c.paidTotal)}</td>
                      <td className="py-2 text-right tabular-nums">{c.due === null ? "-" : formatMoney(c.balance)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {target && <RentSheet target={target} accounts={accounts} now={now} onClose={() => setTarget(null)} />}
      {dialog === "start" && <TenancyDialog roomId={room.id} earliest={lastEnd} onClose={() => setDialog(null)} />}
      {dialog === "edit" && open && <TenancyDialog tenancy={open} roomId={room.id} onClose={() => setDialog(null)} />}
      {dialog === "end" && open && <EndDialog tenancy={open} onClose={() => setDialog(null)} />}
      {dialog === "rent" && (
        <RentDialog roomId={room.id} current={room.rents[0]} now={now} onClose={() => setDialog(null)} />
      )}
      {dialog === "room" && <RoomDialog room={room} onClose={() => setDialog(null)} />}
    </div>
  );
}

// Rent actions revalidate /rent, and the save's own response carries the new page, so no second reload.
function useDone(onClose: () => void) {
  return onClose;
}

function MonthDetail({ room, cell }: { room: Room; cell: ReturnType<typeof roomMonth> }) {
  const t = useT();
  const own = room.payments.filter((p) => p.year === cell.year && p.month === cell.month);
  const last = own[own.length - 1];
  if (cell.status === "unset") return <span className="mt-auto text-xs">? {t("Amount not set")}</span>;
  if (last) {
    return (
      <span className="mt-auto text-xs leading-tight">
        {formatMoney(cell.paidTotal)}
        <br />
        {formatDate(last.paidDate)}
        <br />
        {cell.status === "partial" ? `${t("Balance")} ${formatMoney(cell.balance)}` : last.accountName}
      </span>
    );
  }
  if ((cell.status === "due" || cell.status === "upcoming") && cell.due !== null) {
    return <span className="mt-auto text-xs">{formatMoney(cell.due)}</span>;
  }
  return null;
}

// Rent Type: Fixed works as before; Variable makes the monthly rent an optional suggestion only.
function RentTypeFields({ defaultType = "fixed", defaultRent }: { defaultType?: string; defaultRent?: string }) {
  const t = useT();
  const [type, setType] = useState(defaultType === "variable" ? "variable" : "fixed");
  return (
    <>
      <fieldset className="flex flex-col gap-1.5 sm:col-span-2">
        <legend className="mb-1.5 text-sm font-medium">{t("Rent Type")}</legend>
        <div className="grid grid-cols-2 gap-2">
          {(["fixed", "variable"] as const).map((value) => (
            <label
              key={value}
              className="has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary flex min-h-11 cursor-pointer items-center rounded-xl border border-input bg-white/50 px-3 py-2 text-sm font-medium transition-colors dark:bg-white/5"
            >
              <input
                type="radio"
                name="rentType"
                value={value}
                checked={type === value}
                onChange={() => setType(value)}
                className="sr-only"
              />
              {t(value === "fixed" ? "Fixed rent" : "Variable rent (changes every month)")}
            </label>
          ))}
        </div>
      </fieldset>
      <Field
        label={t(type === "fixed" ? "Monthly rent (₹)" : "Usual / approximate rent (₹)")}
        hint={type === "variable" ? t("Optional. Only a suggestion, never the amount due.") : undefined}
      >
        <Input
          key={type}
          name="rent"
          type="number"
          step="0.01"
          min={type === "fixed" ? "0.01" : "0"}
          inputMode="decimal"
          defaultValue={defaultRent && Number(defaultRent) > 0 ? defaultRent : undefined}
          required={type === "fixed"}
        />
      </Field>
    </>
  );
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
        <form onSubmit={tenancy ? update.submit : create.submit} className="flex flex-col gap-4">
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
            {!tenancy && <RentTypeFields />}
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
        <form onSubmit={end.submit} className="flex flex-col gap-4">
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

function RentDialog({
  roomId,
  current,
  now,
  onClose,
}: {
  roomId: string;
  current?: { amount: string; rentType: string };
  now: YearMonth;
  onClose: () => void;
}) {
  const t = useT();
  const change = useAction(changeRent, { success: "Rent changed", onDone: useDone(onClose) });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("Change rent")}</DialogTitle>
          <DialogDescription>{t("Past months stay at the old rent. The new rent applies from the month you choose.")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={change.submit} className="flex flex-col gap-4">
          <input type="hidden" name="roomId" value={roomId} />
          <div className="grid gap-4 sm:grid-cols-2">
            <RentTypeFields defaultType={current?.rentType} defaultRent={current?.amount} />
          </div>
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
        <form onSubmit={save.submit} className="flex flex-col gap-4">
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
