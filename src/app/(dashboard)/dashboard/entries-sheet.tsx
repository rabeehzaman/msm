"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { loadDashboardEntries } from "@/lib/actions/dashboard";
import { formatDate, formatMoney, MONTHS } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import type { DashboardEntries } from "@/lib/queries/dashboard";

export type ListRequest = {
  key: string;
  title: string;
  // Cash/Bank card: links to that account's Cash Book / Bank Book for the same dates.
  account?: { id: string; type: "cash" | "bank" };
};

// The entries behind a card, for the same From–To as the card. The list total equals the card.
export function EntriesSheet({
  request,
  from,
  to,
  onClose,
}: {
  request: ListRequest | null;
  from: string;
  to: string;
  onClose: () => void;
}) {
  const t = useT();
  const period = from === to ? formatDate(from) : `${formatDate(from)} – ${formatDate(to)}`;
  return (
    <Sheet open={!!request} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="mx-auto flex max-h-[88dvh] w-full max-w-2xl flex-col gap-0 rounded-t-3xl pb-[env(safe-area-inset-bottom)]">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>{request ? t(request.title) : ""}</SheetTitle>
          <SheetDescription>{period}</SheetDescription>
        </SheetHeader>
        {request && <EntriesBody key={`${request.key}|${from}|${to}`} request={request} from={from} to={to} />}
      </SheetContent>
    </Sheet>
  );
}

function EntriesBody({ request, from, to }: { request: ListRequest; from: string; to: string }) {
  const t = useT();
  const [state, setState] = useState<{ data?: DashboardEntries; error?: string }>({});

  useEffect(() => {
    let live = true;
    loadDashboardEntries(request.key, from, to)
      .then((res) => {
        if (!live) return;
        setState(res.ok ? { data: res.data } : { error: res.error });
      })
      .catch(() => live && setState({ error: "Something went wrong. Please try again." }));
    return () => {
      live = false;
    };
  }, [request.key, from, to]);

  if (state.error) {
    return <p className="p-6 text-center text-sm text-destructive">{t(state.error)}</p>;
  }
  const data = state.data;
  if (!data) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> {t("Loading")}
      </div>
    );
  }

  const book = data.book;
  const isPending = ["rent-pending", "salary-pending", "bills-due"].includes(request.key);
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {data.rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">{t("No entries")}</p>
        ) : (
          <ul className="divide-y">
            {data.rows.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{translateTitle(r.title, t)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[r.date ? formatDate(r.date) : null, translateDetail(r.detail, t)].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold tabular-nums ${
                    book ? (r.direction === "in" ? "text-success" : "text-destructive") : ""
                  }`}
                >
                  {book ? (r.direction === "in" ? "+" : "−") : ""}
                  {formatMoney(r.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {data.count > data.rows.length && (
          <p className="px-4 py-2 text-center text-xs text-muted-foreground">
            {t("Showing the latest {shown} of {count} entries. The total covers all of them.", { shown: data.rows.length, count: data.count })}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1 border-t bg-muted/40 px-4 py-3 text-sm">
        {book ? (
          <>
            <Row label={t("Opening balance")} value={formatMoney(book.opening)} />
            <Row label={t("Money in")} value={`+${formatMoney(book.in)}`} />
            <Row label={t("Money out")} value={`−${formatMoney(book.out)}`} />
            <Row label={t("Closing balance")} value={formatMoney(book.closing)} strong />
            {request.account && (
              <Link
                href={`/reports/cash-book?account=${request.account.id}&from=${from}&to=${to}`}
                className="mt-1 inline-flex items-center gap-1 self-start font-medium text-primary hover:underline"
              >
                {t(request.account.type === "cash" ? "Open Cash Book" : "Open Bank Book")} <ArrowRight className="size-4" />
              </Link>
            )}
          </>
        ) : (
          <Row
            label={`${t("Total")} · ${t(isPending ? "{n} items" : "{n} entries", { n: data.count })}`}
            value={formatMoney(data.total)}
            strong
          />
        )}
      </div>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${strong ? "text-base font-semibold" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

// Category names and "Nov 2026" style months are shown in the chosen language where known.
function translateTitle(title: string, t: (s: string) => string) {
  return title
    .split(" · ")
    .map((part, i) => (i === 0 ? t(part) : part))
    .join(" · ");
}

function translateDetail(detail: string, t: (s: string) => string) {
  return detail
    .split(" · ")
    .map((part) => {
      const m = /^([A-Z][a-z]{2}) (\d{4})$/.exec(part);
      if (m && (MONTHS as readonly string[]).includes(m[1])) return `${t(m[1])} ${m[2]}`;
      return part === "Cleaning fee" ? t(part) : part;
    })
    .join(" · ");
}
