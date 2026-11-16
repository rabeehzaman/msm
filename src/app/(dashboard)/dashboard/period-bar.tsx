"use client";

import { useRef, useState } from "react";
import { CalendarDays, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatDate } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import {
  parseDisplayDate,
  PERIOD_PRESETS,
  periodProblem,
  PRESET_LABELS,
  type Period,
  type ResolvedPeriod,
} from "@/lib/period";

// The period line at the top of the Dashboard: quick chips in one swipeable line, Custom opens a
// bottom sheet with From and To (DD-MM-YYYY), and "Showing: …" always says which dates are counted.
export function PeriodBar({
  period,
  selected,
  pending,
  onChange,
}: {
  period: ResolvedPeriod;
  // The chip tapped last, highlighted at once while its figures load.
  selected: ResolvedPeriod["preset"];
  pending: boolean;
  onChange: (period: Period) => void;
}) {
  const t = useT();
  const [customOpen, setCustomOpen] = useState(false);
  const chips = [...PERIOD_PRESETS, "custom"] as const;

  return (
    <section aria-label={t("Dashboard period")} className="flex flex-col gap-2">
      <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((preset) => {
          const active = selected === preset;
          return (
            <button
              key={preset}
              type="button"
              aria-pressed={active}
              onClick={() => (preset === "custom" ? setCustomOpen(true) : onChange({ preset }))}
              className={`shrink-0 snap-start rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-white/60 text-foreground hover:border-primary/40 hover:bg-white/90 dark:bg-white/5 dark:hover:bg-white/10"
              }`}
            >
              {preset === "custom" && <CalendarDays className="mr-1.5 inline size-3.5 -translate-y-px" />}
              {t(PRESET_LABELS[preset])}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <p className="font-medium" aria-live="polite">
          {period.from === period.to
            ? t("Showing: {date}", { date: formatDate(period.from) })
            : t("Showing: {from} to {to}", { from: formatDate(period.from), to: formatDate(period.to) })}
        </p>
        {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label={t("Loading")} />}
        {period.preset !== "this-month" && (
          <button
            type="button"
            onClick={() => onChange({ preset: "this-month" })}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <RotateCcw className="size-3.5" /> {t("Reset")}
          </button>
        )}
      </div>
      <CustomSheet
        open={customOpen}
        onOpenChange={setCustomOpen}
        initialFrom={period.from}
        initialTo={period.to}
        onApply={(from, to) => {
          setCustomOpen(false);
          onChange({ preset: "custom", from, to });
        }}
      />
    </section>
  );
}

function CustomSheet({
  open,
  onOpenChange,
  initialFrom,
  initialTo,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFrom: string;
  initialTo: string;
  onApply: (from: string, to: string) => void;
}) {
  const t = useT();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[90dvh] w-full max-w-lg rounded-t-3xl pb-[env(safe-area-inset-bottom)]">
        <SheetHeader>
          <SheetTitle>{t("Custom period")}</SheetTitle>
          <SheetDescription>{t("Pick the same date in both to see a single day.")}</SheetDescription>
        </SheetHeader>
        {/* Mounted fresh each time the sheet opens, so it starts from the period on screen. */}
        {open && <CustomForm initialFrom={initialFrom} initialTo={initialTo} onApply={onApply} onCancel={() => onOpenChange(false)} />}
      </SheetContent>
    </Sheet>
  );
}

function CustomForm({
  initialFrom,
  initialTo,
  onApply,
  onCancel,
}: {
  initialFrom: string;
  initialTo: string;
  onApply: (from: string, to: string) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [from, setFrom] = useState(formatDate(initialFrom));
  const [to, setTo] = useState(formatDate(initialTo));
  const [error, setError] = useState<string | null>(null);

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const fromIso = parseDisplayDate(from);
    const toIso = parseDisplayDate(to);
    const problem = periodProblem(fromIso ?? "", toIso ?? "");
    if (problem || !fromIso || !toIso) {
      setError(problem ?? "Please enter a valid date.");
      return;
    }
    onApply(fromIso, toIso);
  }

  return (
    <form onSubmit={apply} className="flex flex-col gap-4 px-4">
      <div className="grid grid-cols-2 gap-3">
        <DateField label={t("From")} value={from} onChange={(v) => { setFrom(v); setError(null); }} />
        <DateField label={t("To")} value={to} onChange={(v) => { setTo(v); setError(null); }} />
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {t(error)}
        </p>
      )}
      <SheetFooter className="flex-row gap-2 px-0">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          {t("Cancel")}
        </Button>
        <Button type="submit" className="flex-1">
          {t("Apply")}
        </Button>
      </SheetFooter>
    </form>
  );
}

// A DD-MM-YYYY box the person can type in, with a calendar button that opens the phone's date picker.
function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const t = useT();
  const picker = useRef<HTMLInputElement>(null);
  const iso = parseDisplayDate(value) ?? "";
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <span className="relative flex">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="DD-MM-YYYY"
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={value !== "" && !iso}
          className="pr-10 tabular-nums"
        />
        <button
          type="button"
          aria-label={t("Open calendar")}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-primary"
          onClick={() => {
            const input = picker.current;
            if (!input) return;
            try {
              input.showPicker();
            } catch {
              input.focus();
            }
          }}
        >
          <CalendarDays className="size-4" />
        </button>
        {/* The phone's own date picker, kept out of sight; its choice fills the box above. */}
        <input
          ref={picker}
          type="date"
          tabIndex={-1}
          aria-hidden
          value={iso}
          onChange={(e) => e.target.value && onChange(formatDate(e.target.value))}
          className="pointer-events-none absolute right-0 bottom-0 h-px w-px opacity-0"
        />
      </span>
    </label>
  );
}
