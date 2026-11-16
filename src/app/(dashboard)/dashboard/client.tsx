"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Users,
  Home,
  Wallet,
  GraduationCap,
  ArrowRight,
  Plus,
  TrendingUp,
  KeyRound,
  HandCoins,
  Coins,
  CreditCard,
  Banknote,
  Landmark,
  CalendarClock,
  CircleAlert,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Receipt,
  HeartHandshake,
} from "lucide-react";
import { useSession } from "@/lib/auth/session";
import { formatDate, formatMoney, MONTHS, todayIST } from "@/lib/format";
import { useLang, useT } from "@/lib/i18n/client";
import { UnsetNote } from "@/components/rent/tags";
import { loadDashboardPeriod } from "@/lib/actions/dashboard";
import {
  parsePeriod,
  PERIOD_COOKIE,
  pendingMonthsFor,
  periodKey,
  type Period,
  type ResolvedPeriod,
} from "@/lib/period";
import type { DashboardPeriod } from "@/lib/queries/dashboard";
import { PeriodBar } from "./period-bar";
import { EntriesSheet, type ListRequest } from "./entries-sheet";

type DashboardStats = {
  households: number;
  members: number;
  students: number;
};

function readCookie(name: string) {
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1) : null;
}

export function DashboardClient({
  stats,
  initialPeriod,
  initialMoney,
}: {
  stats: DashboardStats;
  initialPeriod: ResolvedPeriod;
  initialMoney: DashboardPeriod;
}) {
  const t = useT();
  const lang = useLang();
  const { canEnter } = useSession();

  // The figures on screen and the period they are for. They change together, so a card never shows
  // one period's amount under another period's dates.
  const [view, setView] = useState({ period: initialPeriod, money: initialMoney });
  const [selected, setSelected] = useState<ResolvedPeriod["preset"]>(initialPeriod.preset);
  const [pending, startTransition] = useTransition();
  const latest = useRef(0);
  const [list, setList] = useState<ListRequest | null>(null);

  // Fresh figures from the server (after any save) replace what is on screen.
  const [seen, setSeen] = useState(initialMoney);
  if (seen !== initialMoney) {
    setSeen(initialMoney);
    setView({ period: initialPeriod, money: initialMoney });
    setSelected(initialPeriod.preset);
  }

  // A session cookie: kept while the app is open, gone on sign in / sign out.
  const remember = (key: string) => {
    document.cookie = `${PERIOD_COOKIE}=${key}; path=/; samesite=lax`;
  };

  function apply(period: Period) {
    const key = periodKey(period);
    remember(key);
    setSelected(period.preset);
    const id = ++latest.current;
    startTransition(async () => {
      // A lost connection shows a message instead of breaking the page.
      const res = await loadDashboardPeriod(key).catch(() => ({ ok: false as const, error: "Something went wrong. Please try again." }));
      if (id !== latest.current) return;
      if (res.ok && res.data) {
        const next = res.data;
        startTransition(() => setView({ period: next.period, money: next.data }));
      } else {
        toast.error(t(res.ok ? "Something went wrong. Please try again." : res.error));
        // Back to the period still on screen.
        remember(view.period.key);
        setSelected(view.period.preset);
      }
    });
  }

  // Coming back to a Dashboard the phone kept in memory: load the period chosen since then.
  const restoreSaved = useEffectEvent(() => {
    const saved = parsePeriod(readCookie(PERIOD_COOKIE));
    if (saved && periodKey(saved) !== initialPeriod.key) apply(saved);
  });
  useEffect(() => {
    restoreSaved();
  }, [initialPeriod.key]);

  const { period, money } = view;
  const open = (request: ListRequest) => setList(request);
  const months = pendingMonthsFor(money.from, money.to);
  const monthName = (m: { year: number; month: number }) => `${t(MONTHS[m.month - 1])} ${m.year}`;
  const pendingFor = months.length === 1 ? monthName(months[0]) : `${monthName(months[0])} – ${monthName(months[months.length - 1])}`;

  const flowTotal = money.income + money.expense;
  const incomeShare = flowTotal > 0 ? (money.income / flowTotal) * 100 : 0;
  const topFunds = money.funds.slice(0, 8);
  const maxFund = Math.max(1, ...topFunds.map((f) => Math.abs(f.balance)));
  const regularIncome = money.incomeByCategory.filter((c) => !c.other);
  const otherIncome = money.incomeByCategory.filter((c) => c.other);

  const statCards = [
    { label: "Households", value: stats.households.toLocaleString("en-IN"), icon: Home, tone: "" },
    { label: "Members", value: stats.members.toLocaleString("en-IN"), icon: Users, tone: "stat-icon-lagoon" },
    { label: "Total income", value: formatMoney(money.income), icon: Wallet, tone: "stat-icon-gold", list: "income" },
    { label: "Students", value: stats.students.toLocaleString("en-IN"), icon: GraduationCap, tone: "stat-icon-indigo" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <section className="relative isolate overflow-hidden rounded-[1.75rem] shadow-glass-lg ring-1 ring-white/40 dark:ring-white/10">
        <Image
          src="/images/village-banner.webp"
          alt="A Kerala village with a mosque among coconut palms at dusk"
          fill
          priority
          sizes="(min-width: 1400px) 1400px, 100vw"
          className="-z-10 animate-slow-zoom object-cover object-[center_75%]"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-emerald-950/85 via-emerald-950/55 to-emerald-950/5" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-emerald-950/60 to-transparent" />
        <div className="flex min-h-[15rem] flex-col justify-between gap-8 p-6 text-white md:min-h-[17rem] md:p-9">
          <div className="max-w-xl">
            <p className="text-sm font-medium tracking-wide text-amber-200">
              Assalamu Alaikum · <span lang="ml" className={lang === "ml" ? undefined : "font-system-ml"}>സ്വാഗതം</span>
            </p>
            <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight md:text-[2.6rem] md:leading-[1.1]">
              {t("Your Mahallu at a glance")}
            </h1>
            <p className="mt-3 max-w-md text-sm text-white/80 md:text-base">
              {t("Cash, bank and everything due, in one place.")}
            </p>
          </div>
          {canEnter && (
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Rent", href: "/rent", icon: KeyRound },
                { label: "Collection", href: "/finances/income", icon: TrendingUp },
                { label: "Other Income", href: "/finances/other-income", icon: Coins },
                { label: "Expense", href: "/finances/expenses", icon: CreditCard },
                { label: "Salary", href: "/salaries", icon: HandCoins },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                  <Plus className="size-3.5 text-amber-200" />
                  <action.icon className="size-4 text-amber-200" />
                  {t(action.label)}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <PeriodBar period={period} selected={selected} pending={pending} onChange={apply} />

      <div className={`flex flex-col gap-6 transition-opacity ${pending ? "opacity-60" : ""}`} aria-busy={pending}>
        {/* Cash and bank: opening as on From, in and out during the period, closing as on To */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {money.accounts.map((a) => (
            <TapCard
              key={a.id}
              onClick={() =>
                open({ key: `acct:${a.id}`, title: a.type === "cash" ? "Cash in hand" : a.name, account: { id: a.id, type: a.type } })
              }
            >
              <CardContent className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-muted-foreground">{a.type === "cash" ? t("Cash in hand") : a.name}</p>
                  <p className={`font-heading mt-2 truncate text-[1.85rem] leading-none font-semibold tracking-tight ${a.closing < 0 ? "text-destructive" : ""}`}>
                    {formatMoney(a.closing)}
                  </p>
                  <BalanceLine opening={a.opening} moneyIn={a.in} moneyOut={a.out} />
                </div>
                <div className={`stat-icon ${a.type === "cash" ? "stat-icon-gold" : "stat-icon-lagoon"}`}>
                  {a.type === "cash" ? <Banknote className="size-5" /> : <Landmark className="size-5" />}
                </div>
              </CardContent>
            </TapCard>
          ))}
          <TapCard className="bg-primary/10" onClick={() => open({ key: "acct:all", title: "Total balance" })}>
            <CardContent className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{t("Total balance")}</p>
                <p className="font-heading mt-2 truncate text-[1.85rem] leading-none font-semibold tracking-tight">{formatMoney(money.totals.closing)}</p>
                <BalanceLine opening={money.totals.opening} moneyIn={money.totals.in} moneyOut={money.totals.out} />
              </div>
              <div className="stat-icon">
                <Wallet className="size-5" />
              </div>
            </CardContent>
          </TapCard>
        </div>

        {/* Income, expense and what is still due */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="h-full">
            <CardContent className="flex flex-col gap-1">
              <Figure
                label={t("Income")}
                amount={money.income}
                tone="text-success"
                icon={<ArrowDownLeft className="size-4" />}
                onClick={() => open({ key: "income", title: "Total income" })}
              />
              <Figure
                label={t("Expense")}
                amount={money.expense}
                tone="text-destructive"
                icon={<ArrowUpRight className="size-4" />}
                onClick={() => open({ key: "expense", title: "Total expense" })}
              />
              <div className="flex items-center justify-between gap-2 border-t pt-2 text-sm">
                <span className="font-medium text-muted-foreground">{t(money.net >= 0 ? "Surplus" : "Deficit")}</span>
                <span className={`font-heading text-xl font-semibold tabular-nums ${money.net >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatMoney(money.net)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Card className="h-full flex-1">
              <CardContent className="flex flex-col gap-1">
                <CardLabel icon={<KeyRound className="size-4" />}>{t("Rent")}</CardLabel>
                <Figure
                  label={t("Collected")}
                  amount={money.rent.collected}
                  sub={t("{n} entries", { n: money.rent.collectedCount })}
                  onClick={() => open({ key: "rent", title: "Rent collected" })}
                />
                <Figure
                  label={t("Rent pending")}
                  amount={money.rent.pendingAmount}
                  tone={money.rent.pendingAmount > 0 ? "text-destructive" : undefined}
                  sub={`${t("{n} months", { n: money.rent.pendingCount })} · ${pendingFor}`}
                  onClick={() => open({ key: "rent-pending", title: "Rent pending" })}
                />
              </CardContent>
            </Card>
            {canEnter && money.rent.unsetRooms > 0 && <UnsetNote count={money.rent.unsetRooms} />}
          </div>

          <Card className="h-full">
            <CardContent className="flex flex-col gap-1">
              {/* Paid: by payment date. Pending: by Salary Month, so a February salary paid in November clears February. */}
              <CardLabel icon={<HandCoins className="size-4" />}>{t("Salaries")}</CardLabel>
              <Figure
                label={t("Paid")}
                amount={money.salary.paid}
                sub={t("{n} entries", { n: money.salary.paidCount })}
                onClick={() => open({ key: "salary", title: "Salaries paid" })}
              />
              <Figure
                label={t("Salaries pending")}
                amount={money.salary.pendingAmount}
                tone={money.salary.pendingAmount > 0 ? "text-destructive" : undefined}
                sub={`${t("{n} months", { n: money.salary.pendingCount })} · ${pendingFor}`}
                onClick={() => open({ key: "salary-pending", title: "Salaries pending" })}
              />
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="flex flex-col gap-1">
              <CardLabel icon={<TrendingUp className="size-4" />}>{t("Friday collection")}</CardLabel>
              <Figure
                label={t("All Fridays in this period")}
                amount={money.friday.amount}
                sub={t("{n} entries", { n: money.friday.count })}
                onClick={() => open({ key: "friday", title: "Friday collection" })}
              />
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="flex flex-col gap-1">
              <CardLabel icon={<CalendarClock className="size-4" />}>{t("Bills")}</CardLabel>
              <Figure
                label={t("Bills paid")}
                amount={money.bills.paid}
                sub={t("{n} entries", { n: money.bills.paidCount })}
                onClick={() => open({ key: "bills", title: "Bills paid" })}
              />
              <Figure
                label={t("Bills due")}
                amount={money.bills.dueAmount}
                tone={money.bills.dueAmount > 0 ? "text-destructive" : undefined}
                sub={t("{n} bills, due date in this period", { n: money.bills.dueCount })}
                onClick={() => open({ key: "bills-due", title: "Bills due" })}
              />
              {money.bills.due.length > 0 && (
                <ul className="mt-1 flex flex-col gap-1 border-t pt-2">
                  {money.bills.due.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate">
                        {b.dueDate && b.dueDate < todayIST() && <CircleAlert className="mr-1 inline size-3.5 text-destructive" />}
                        {b.accountLabel} · {formatDate(b.dueDate)}
                      </span>
                      <span className="font-semibold tabular-nums">{formatMoney(b.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {money.qard && (
            <Card className="h-full">
              <CardContent className="flex flex-col gap-1">
                <CardLabel icon={<HeartHandshake className="size-4" />}>{t("Qard Hasan")}</CardLabel>
                <Figure
                  label={t("Given")}
                  amount={money.qard.given}
                  sub={t("{n} entries", { n: money.qard.givenCount })}
                  onClick={() => open({ key: "qard-given", title: "Qard Hasan given" })}
                />
                <Figure
                  label={t("Repaid")}
                  amount={money.qard.repaid}
                  sub={t("{n} entries", { n: money.qard.repaidCount })}
                  onClick={() => open({ key: "qard-repaid", title: "Qard Hasan repaid" })}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Collections and expenses by category */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="size-4 text-primary" /> {t("Collections by category")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {money.incomeByCategory.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">{formatMoney(0)} · {t("No entries")}</p>
              ) : (
                <ul className="flex flex-col">
                  {regularIncome.map((c) => (
                    <CategoryRow key={c.key} label={t(c.category)} amount={c.amount} count={c.count} onClick={() => open({ key: c.key, title: c.category })} />
                  ))}
                  {otherIncome.length > 0 && (
                    <li className="mt-2 border-t pt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{t("Other Income")}</li>
                  )}
                  {otherIncome.map((c) => (
                    <CategoryRow key={c.key} label={t(c.category)} amount={c.amount} count={c.count} onClick={() => open({ key: c.key, title: c.category })} />
                  ))}
                  <li className="mt-1 flex items-center justify-between border-t pt-2 text-sm font-semibold">
                    <span>{t("Total income")}</span>
                    <span className="tabular-nums">{formatMoney(money.income)}</span>
                  </li>
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="size-4 text-primary" /> {t("Expenses by category")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {money.expenseByCategory.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">{formatMoney(0)} · {t("No entries")}</p>
              ) : (
                <ul className="flex flex-col">
                  {money.expenseByCategory.map((c) => (
                    <CategoryRow key={c.key} label={t(c.category)} amount={c.amount} count={c.count} onClick={() => open({ key: c.key, title: c.category })} />
                  ))}
                  <li className="mt-1 flex items-center justify-between border-t pt-2 text-sm font-semibold">
                    <span>{t("Total expense")}</span>
                    <span className="tabular-nums">{formatMoney(money.expense)}</span>
                  </li>
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const body = (
              <CardContent className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{t(card.label)}</p>
                  <p className="font-heading mt-2 truncate text-[1.85rem] leading-none font-semibold tracking-tight">
                    {card.value}
                  </p>
                </div>
                <div className={`stat-icon transition-transform duration-300 group-hover/stat:scale-110 ${card.tone}`}>
                  <card.icon className="size-5" />
                </div>
              </CardContent>
            );
            return card.list ? (
              <TapCard key={card.label} className="group/stat" onClick={() => open({ key: card.list, title: card.label })}>
                {body}
              </TapCard>
            ) : (
              <Card key={card.label} className="group/stat">
                {body}
              </Card>
            );
          })}
        </div>

        {/* Two column layout */}
        <div className="grid gap-4 lg:grid-cols-7">
          {/* Financial Summary for the period */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>{t("Financial Summary")}</CardTitle>
              <CardDescription>{t("Income vs Expenses in this period")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{t("Surplus / deficit")}</p>
                <p className={`font-heading mt-1 text-3xl font-semibold tracking-tight ${money.net >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatMoney(money.net)}
                </p>
              </div>

              {/* Share of money flow: income vs expenses */}
              <div
                className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={`${t("Income")} ${formatMoney(money.income)}, ${t("Expense")} ${formatMoney(money.expense)}`}
              >
                {flowTotal > 0 && (
                  <>
                    <div className="h-full rounded-l-full bg-chart-1 transition-[width] duration-700" style={{ width: `${incomeShare}%` }} title={t("Income")} />
                    <div className="h-full flex-1 rounded-r-full bg-chart-2" title={t("Expense")} />
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="size-2.5 rounded-full bg-chart-1" />
                    {t("Total income")}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{formatMoney(money.income)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="size-2.5 rounded-full bg-chart-2" />
                    {t("Total expense")}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{formatMoney(money.expense)}</span>
                </div>
              </div>
              <Link href="/finances" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                {t("Open finances")} <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>

          {/* Fund balances as on the To date */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>{t("Fund Overview")}</CardTitle>
              <CardDescription>{t("Fund balances as on {date}", { date: formatDate(money.to) })}</CardDescription>
            </CardHeader>
            <CardContent>
              {topFunds.length === 0 ? (
                <div className="empty-state py-8">
                  <p>No funds yet</p>
                  <p className="text-sm text-muted-foreground">Fund balances appear here once funds are set up.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-3.5">
                  {topFunds.map((fund) => (
                    <li key={fund.id} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[minmax(0,12rem)_1fr_auto]">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate font-medium" title={fund.name}>{fund.name}</span>
                        {fund.isRestricted && (
                          <Badge variant="secondary" className="h-4.5 px-1.5 text-[10px]">Restricted</Badge>
                        )}
                      </span>
                      <span className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-linear-to-r from-chart-1/70 to-chart-1 transition-[width] duration-700"
                          style={{ width: `${Math.max(2, (Math.abs(fund.balance) / maxFund) * 100)}%` }}
                        />
                      </span>
                      <span className="text-right font-semibold tabular-nums">{formatMoney(fund.balance)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Community overview */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Community Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Households", value: stats.households, icon: Home, href: "/households" },
                { label: "Members", value: stats.members, icon: Users, href: "/members" },
                { label: "Madrasa Students", value: stats.students, icon: GraduationCap, href: "/madrasa/students" },
                { label: "Active Funds", value: money.funds.length, icon: Wallet, href: "/finances" },
              ].map((row) => (
                <Link
                  key={row.label}
                  href={row.href}
                  className="flex items-center justify-between rounded-xl border bg-white/40 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-white/80 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                >
                  <span className="flex items-center gap-3">
                    <span className="stat-icon size-8 rounded-lg">
                      <row.icon className="size-4" />
                    </span>
                    <span className="text-sm font-medium">{row.label}</span>
                  </span>
                  <Badge variant="secondary" className="tabular-nums">{row.value}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="relative isolate min-h-56 overflow-hidden rounded-2xl shadow-glass ring-1 ring-white/40 lg:col-span-3 dark:ring-white/10">
          <Image
            src="/images/prayer-hall.webp"
            alt="Sunlight streaming into a wooden prayer hall"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="-z-10 object-cover object-[center_60%]"
          />
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
          <div className="flex h-full flex-col justify-end p-6 text-white">
            {stats.households === 0 && stats.members === 0 ? (
              <>
                <p className="font-heading text-xl font-semibold">Getting started</p>
                <p className="mt-1 text-sm text-white/80">
                  Start by adding households and members to see data on the dashboard.
                </p>
                <Link href="/households" className="glass-dark mt-4 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium hover:bg-white/20">
                  Add your first household <ArrowRight className="size-4" />
                </Link>
              </>
            ) : (
              <>
                <p className="font-heading text-xl font-semibold">Serving the community</p>
                <p className="mt-1 text-sm text-white/80">
                  {stats.households.toLocaleString("en-IN")} families and {stats.members.toLocaleString("en-IN")} members are part of your Mahallu.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <EntriesSheet request={list} from={money.from} to={money.to} onClose={() => setList(null)} />
    </div>
  );
}

// A whole card that opens its list when tapped.
function TapCard({ className = "", onClick, children }: { className?: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="h-full rounded-[inherit] text-left focus-visible:outline-none">
      <Card className={`h-full transition-transform hover:-translate-y-0.5 ${className}`}>{children}</Card>
    </button>
  );
}

function CardLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">{icon} {children}</p>;
}

// One tappable figure inside a card: label, amount and a small note.
function Figure({
  label,
  amount,
  sub,
  tone,
  icon,
  onClick,
}: {
  label: string;
  amount: number;
  sub?: string;
  tone?: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-primary/5 focus-visible:bg-primary/5 focus-visible:outline-none"
    >
      <span className="min-w-0">
        <span className={`flex items-center gap-1.5 text-sm font-medium ${tone ?? ""}`}>
          {icon}
          {label}
        </span>
        {sub && <span className="block truncate text-xs text-muted-foreground">{sub}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-1">
        <span className={`font-heading text-xl font-semibold tabular-nums ${tone ?? ""}`}>{formatMoney(amount)}</span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </span>
    </button>
  );
}

function CategoryRow({ label, amount, count, onClick }: { label: string; amount: number; count: number; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-primary/5"
      >
        <span className="min-w-0 truncate font-medium">
          {label} <span className="text-xs font-normal text-muted-foreground">({count})</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 font-semibold tabular-nums">
          {formatMoney(amount)}
          <ChevronRight className="size-3.5 text-muted-foreground" />
        </span>
      </button>
    </li>
  );
}

function BalanceLine({ opening, moneyIn, moneyOut }: { opening: number; moneyIn: number; moneyOut: number }) {
  const t = useT();
  return (
    <p className="mt-2 flex flex-wrap gap-x-2 text-xs text-muted-foreground tabular-nums">
      <span>{t("Opening")} {formatMoney(opening)}</span>
      <span className="text-success">+{formatMoney(moneyIn)}</span>
      <span className="text-destructive">−{formatMoney(moneyOut)}</span>
    </p>
  );
}
