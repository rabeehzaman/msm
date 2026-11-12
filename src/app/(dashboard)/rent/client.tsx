"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, CircleAlert, DoorOpen, IndianRupee, ListChecks, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect, type AccountOption } from "@/components/money/form";
import { PageHeader, StatCard } from "@/components/money/page-header";
import { RentSheet, type SheetRoom, type SheetTarget } from "@/components/rent/rent-sheets";
import { UnsetNote, VariableTag } from "@/components/rent/tags";
import { cellClass, statusLabel } from "@/components/rent/cell";
import { useSession } from "@/lib/auth/session";
import { formatMoney, MONTHS } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import { roomMonth, type RentType, type YearMonth } from "@/lib/rent/status";

type Room = SheetRoom & {
  name: string;
  buildingName: string;
  floorName: string;
  tenantName: string | null;
  rentType: RentType;
};

export type RentSummary = {
  expected: number;
  collected: number;
  pendingThisMonth: number;
  pendingCount: number;
  pendingAmount: number;
  unsetRooms: number;
};

export function RentClient({
  initialYear,
  rooms,
  summary,
  accounts,
  now,
}: {
  initialYear: number;
  rooms: Room[];
  summary: RentSummary;
  accounts: AccountOption[];
  now: YearMonth;
}) {
  const t = useT();
  const { canEnter } = useSession();
  const [year, setYear] = useState(initialYear);
  const [target, setTarget] = useState<SheetTarget | null>(null);
  const groups = [...new Set(rooms.map((r) => `${r.buildingName}|${r.floorName}`))];
  const hasVariable = rooms.some((r) => r.rentType === "variable" || r.rents.some((x) => x.rentType === "variable"));

  // Every year is worked out here from data already on the phone, so the year switch is instant.
  const grid = useMemo(
    () => new Map(rooms.map((room) => [room.id, Array.from({ length: 12 }, (_, i) => roomMonth(room, year, i + 1, now))])),
    [rooms, year, now],
  );

  function changeYear(value: number) {
    setYear(value);
    window.history.replaceState(null, "", `/rent?year=${value}`);
  }

  function openCell(room: Room, month: number) {
    const cell = grid.get(room.id)![month - 1];
    if (cell.status === "vacant" && cell.paidCount === 0) {
      toast.info(t("This room has no tenant for that month."));
      return;
    }
    if (!canEnter) return;
    setTarget({ room, year, month });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Rent" subtitle="Tap a month to mark it paid. Tap a room to see its calendar.">
        <Button variant="outline" render={<Link href="/rent/rooms" />}>
          <DoorOpen className="size-4" />
          {t("Rooms & Tenants")}
        </Button>
        {hasVariable && (
          <Button variant="outline" render={<Link href="/rent/variable" />}>
            <ListChecks className="size-4" />
            {t("Set Variable Rents")}
          </Button>
        )}
        <Button variant="outline" render={<Link href="/reports/pending-rent" />}>
          {t("Pending rent list")}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Expected this month" value={formatMoney(summary.expected)} icon={IndianRupee} />
        <StatCard label="Collected this month" value={formatMoney(summary.collected)} icon={Wallet} tone="stat-icon-gold" />
        <StatCard label="Pending this month" value={formatMoney(summary.pendingThisMonth)} icon={CircleAlert} tone="stat-icon-rose" />
        <StatCard
          label="All months pending"
          value={formatMoney(summary.pendingAmount)}
          caption={t("{n} months", { n: summary.pendingCount })}
          icon={CircleAlert}
          tone="stat-icon-rose"
        />
      </div>
      {summary.unsetRooms > 0 && <UnsetNote count={summary.unsetRooms} />}

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
            <div className="flex flex-wrap gap-3 text-xs">
              <Legend className="bg-emerald-500" label={t("Paid")} />
              <Legend className="bg-red-500" label={t("Due")} />
              <Legend className="bg-muted-foreground/25" label={t("Upcoming or vacant")} />
              {hasVariable && (
                <>
                  <Legend className="bg-amber-500" label={t("Partially paid")} />
                  <Legend className="bg-amber-100 ring-1 ring-amber-300" label={t("Amount not set")} />
                </>
              )}
            </div>
          </div>

          <div className="table-shell overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[760px] border-separate border-spacing-1 text-sm">
              <thead>
                <tr>
                  <th className="bg-surface sticky left-0 z-10 min-w-36 px-2 py-1 text-left font-medium">{t("Room")}</th>
                  {MONTHS.map((m) => (
                    <th key={m} className="text-muted-foreground px-1 py-1 text-center text-xs font-medium">
                      {t(m)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const [building, floor] = group.split("|");
                  return (
                    <Fragment key={group}>
                      <tr>
                        <td colSpan={13} className="text-primary px-2 pt-3 text-xs font-semibold tracking-wide uppercase">
                          {building.replace(/ Building$/i, "")} – {floor}
                        </td>
                      </tr>
                      {rooms
                        .filter((r) => r.buildingName === building && r.floorName === floor)
                        .map((room) => (
                          <tr key={room.id}>
                            <td className="bg-surface sticky left-0 z-10 px-2 py-1">
                              <Link href={`/rent/rooms/${room.id}?year=${year}`} className="hover:text-primary block font-medium">
                                <span className="flex items-center gap-1.5">
                                  {room.name}
                                  {room.rentType === "variable" && <VariableTag />}
                                </span>
                                <span className="text-muted-foreground block max-w-32 truncate text-xs font-normal">
                                  {room.tenantName ?? t("Vacant")}
                                </span>
                              </Link>
                            </td>
                            {grid.get(room.id)!.map((cell) => {
                              const hint =
                                cell.status === "partial"
                                  ? `${t("Partially paid")} · ${t("Balance")} ${formatMoney(cell.balance)}`
                                  : cell.status === "due" || (cell.status === "upcoming" && cell.due)
                                    ? `${t(statusLabel[cell.status])} ${formatMoney(cell.due)}`
                                    : t(statusLabel[cell.status]);
                              return (
                                <td key={cell.month} className="p-0">
                                  <button
                                    type="button"
                                    onClick={() => openCell(room, cell.month)}
                                    title={hint}
                                    aria-label={`${room.label}, ${t(MONTHS[cell.month - 1])} ${year}: ${hint}`}
                                    className={`flex h-11 w-full min-w-10 items-center justify-center rounded-lg text-xs font-semibold transition-transform active:scale-95 ${cellClass[cell.status]}`}
                                  >
                                    {cell.status === "paid" && <Check className="size-4" />}
                                    {cell.status === "unset" && "?"}
                                    {cell.status === "partial" && "½"}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {target && <RentSheet target={target} accounts={accounts} now={now} onClose={() => setTarget(null)} />}
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-3 rounded ${className}`} />
      {label}
    </span>
  );
}
