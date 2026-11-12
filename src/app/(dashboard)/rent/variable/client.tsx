"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { Field, NativeSelect, SaveButton, useAction } from "@/components/money/form";
import { PageHeader } from "@/components/money/page-header";
import { saveVariableRents } from "@/lib/actions/rent";
import { useSession } from "@/lib/auth/session";
import { formatMoney, MONTHS } from "@/lib/format";
import { useT } from "@/lib/i18n/client";

type Row = {
  roomId: string;
  label: string;
  tenantName: string;
  lastAmount: number | null;
  lastMonth: { year: number; month: number } | null;
  usual: number | null;
  amount: number | null;
  paidTotal: number;
};

// "Set Variable Rents": pick a month, see every Variable room, fill this month's rent for all, save once.
export function VariableRentsClient({
  year,
  month,
  rows,
  currentYear,
}: {
  year: number;
  month: number;
  rows: Row[];
  currentYear: number;
}) {
  const t = useT();
  const router = useRouter();
  const { canEnter, isAdmin } = useSession();
  const save = useAction(saveVariableRents, { success: "Saved" });
  const go = (y: number, m: number) => router.push(`/rent/variable?year=${y}&month=${m}`);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Set Variable Rents" subtitle="Each Variable room's rent for the month. Rooms left empty stay as Amount not set.">
        <Button variant="outline" render={<Link href={`/rent?year=${year}`} />}>
          <ArrowLeft className="size-4" />
          {t("Rent")}
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3">
          <Field label={t("Month")} className="w-36">
            <NativeSelect value={month} onChange={(e) => go(year, Number(e.target.value))}>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {t(m)}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("Year")} className="w-28">
            <NativeSelect value={year} onChange={(e) => go(Number(e.target.value), month)}>
              {Array.from({ length: 8 }, (_, i) => currentYear + 1 - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState message={t("No Variable rooms with a tenant in this month.")} />
          ) : (
            <form key={`${year}-${month}`} onSubmit={save.submit} className="flex flex-col gap-4">
              <input type="hidden" name="year" value={year} />
              <input type="hidden" name="month" value={month} />
              <ul className="divide-border divide-y">
                {rows.map((r) => (
                  <li key={r.roomId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <input type="hidden" name="roomId" value={r.roomId} />
                    <div className="min-w-0">
                      <Link href={`/rent/rooms/${r.roomId}?year=${year}`} className="hover:text-primary block truncate font-medium">
                        {r.label}
                      </Link>
                      <p className="text-muted-foreground truncate text-sm">{r.tenantName}</p>
                      <p className="text-muted-foreground text-xs">
                        {r.lastAmount !== null && r.lastMonth
                          ? `${t("Last")}: ${formatMoney(r.lastAmount)} (${t(MONTHS[r.lastMonth.month - 1])} ${r.lastMonth.year})`
                          : r.usual
                            ? `${t("Usual")}: ${formatMoney(r.usual)}`
                            : t("No earlier amount")}
                        {r.paidTotal > 0 ? ` · ${t("Paid")} ${formatMoney(r.paidTotal)}` : ""}
                      </p>
                    </div>
                    <Input
                      name={`rent:${r.roomId}`}
                      aria-label={`${r.label} – ${t("Rent for this month (₹)")}`}
                      type="number"
                      step="0.01"
                      min="0.01"
                      inputMode="decimal"
                      className="w-36"
                      placeholder={r.lastAmount ? String(r.lastAmount) : r.usual ? String(r.usual) : ""}
                      defaultValue={r.amount ?? ""}
                      readOnly={r.amount !== null && !isAdmin}
                    />
                  </li>
                ))}
              </ul>
              {canEnter && <SaveButton pending={save.pending} label="Save all" className="self-start" />}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
