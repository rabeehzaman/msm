"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, CircleAlert, DoorOpen, IndianRupee, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect, type AccountOption } from "@/components/money/form";
import { PageHeader, StatCard } from "@/components/money/page-header";
import { RentSheet, type RentPayment, type SheetTarget } from "@/components/rent/rent-sheets";
import { useSession } from "@/lib/auth/session";
import { formatMoney, MONTHS } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import type { CellStatus } from "@/lib/rent/status";
import { cellClass } from "@/components/rent/cell";

type Cell = {
  month: number;
  status: CellStatus;
  expected: number;
  tenantName: string | null;
  payment: RentPayment | null;
};

type Room = {
  id: string;
  label: string;
  name: string;
  buildingName: string;
  floorName: string;
  tenantName: string | null;
  months: Cell[];
};

export function RentClient({
  year,
  rooms,
  summary,
  accounts,
  currentYear,
}: {
  year: number;
  rooms: Room[];
  summary: { expected: number; collected: number; pendingThisMonth: number; pendingCount: number; pendingAmount: number };
  accounts: AccountOption[];
  currentYear: number;
}) {
  const t = useT();
  const router = useRouter();
  const { canEnter } = useSession();
  const [target, setTarget] = useState<SheetTarget | null>(null);
  const groups = [...new Set(rooms.map((r) => `${r.buildingName}|${r.floorName}`))];

  function openCell(room: Room, cell: Cell) {
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
      <PageHeader title="Rent" subtitle="Tap a month to mark it paid. Tap a room to see its calendar.">
        <Button variant="outline" render={<Link href="/rent/rooms" />}>
          <DoorOpen className="size-4" />
          {t("Rooms & Tenants")}
        </Button>
        <Button variant="outline" render={<Link href="/reports/pending-rent" />}>
          {t("Pending rent list")}
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <NativeSelect
              aria-label={t("Year")}
              className="w-28"
              value={year}
              onChange={(e) => router.push(`/rent?year=${e.target.value}`)}
            >
              {Array.from({ length: 8 }, (_, i) => currentYear + 1 - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </NativeSelect>
            <div className="flex flex-wrap gap-3 text-xs">
              <Legend className="bg-emerald-500" label={t("Paid")} />
              <Legend className="bg-red-500" label={t("Due")} />
              <Legend className="bg-muted-foreground/25" label={t("Upcoming or vacant")} />
            </div>
          </div>

          <div className="table-shell overflow-x-auto">
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
                                {room.name}
                                <span className="text-muted-foreground block max-w-32 truncate text-xs font-normal">
                                  {room.tenantName ?? t("Vacant")}
                                </span>
                              </Link>
                            </td>
                            {room.months.map((cell) => (
                              <td key={cell.month} className="p-0">
                                <button
                                  type="button"
                                  onClick={() => openCell(room, cell)}
                                  aria-label={`${room.label}, ${t(MONTHS[cell.month - 1])} ${year}: ${t(statusLabel[cell.status])}`}
                                  className={`flex h-11 w-full min-w-10 items-center justify-center rounded-lg transition-transform active:scale-95 ${cellClass[cell.status]}`}
                                >
                                  {cell.status === "paid" && <Check className="size-4" />}
                                </button>
                              </td>
                            ))}
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

      {target && <RentSheet target={target} accounts={accounts} onClose={() => setTarget(null)} />}
    </div>
  );
}

const statusLabel: Record<CellStatus, string> = {
  paid: "Paid",
  due: "Due",
  upcoming: "Upcoming",
  vacant: "Vacant",
};

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-3 rounded ${className}`} />
      {label}
    </span>
  );
}
