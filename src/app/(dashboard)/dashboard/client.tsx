"use client";

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
  CreditCard,
  Banknote,
  Landmark,
  CalendarClock,
  CircleAlert,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { useSession } from "@/lib/auth/session";
import { currentYearMonth, formatDate, formatMoney, MONTHS } from "@/lib/format";
import { useT } from "@/lib/i18n/client";

type DashboardStats = {
  households: number;
  members: number;
  students: number;
};

type FinanceStats = {
  totalIncome: number;
  totalExpenses: number;
  incomeCount: number;
  expenseCount: number;
  funds: {
    id: string;
    name: string;
    type: string;
    balance: string | null;
    isRestricted: boolean;
  }[];
};

type Money = {
  accounts: { id: string; name: string; type: "cash" | "bank"; balance: number }[];
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  rent: { expected: number; collected: number; pendingThisMonth: number; pendingCount: number; pendingAmount: number };
  salary: { payable: number; paid: number; pendingCount: number; pendingAmount: number };
  dueBills: { id: string; accountLabel: string; year: number; month: number; amount: string; dueDate: string | null; state: string }[];
  friday: { date: string; amount: number };
};

export function DashboardClient({
  stats,
  financeStats,
  money,
}: {
  stats: DashboardStats;
  financeStats: FinanceStats;
  money: Money;
}) {
  const t = useT();
  const { canEnter } = useSession();
  const net = financeStats.totalIncome - financeStats.totalExpenses;
  const flowTotal = financeStats.totalIncome + financeStats.totalExpenses;
  const incomeShare = flowTotal > 0 ? (financeStats.totalIncome / flowTotal) * 100 : 0;
  const topFunds = financeStats.funds.slice(0, 8);
  const maxFund = Math.max(1, ...topFunds.map((f) => Math.abs(Number(f.balance || 0))));

  const statCards = [
    { label: "Households", value: stats.households.toLocaleString("en-IN"), icon: Home, tone: "" },
    { label: "Members", value: stats.members.toLocaleString("en-IN"), icon: Users, tone: "stat-icon-lagoon" },
    { label: "Total income", value: formatMoney(financeStats.totalIncome), icon: Wallet, tone: "stat-icon-gold" },
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
              Assalamu Alaikum · <span lang="ml">സ്വാഗതം</span>
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

      {/* Cash and bank */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {money.accounts.map((a) => (
          <Link key={a.id} href={canEnter ? "/cash-bank" : `/reports/cash-book?account=${a.id}`}>
            <Card className="h-full transition-transform hover:-translate-y-0.5">
              <CardContent className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-muted-foreground">{a.type === "cash" ? t("Cash in hand") : a.name}</p>
                  <p className={`font-heading mt-2 truncate text-[1.85rem] leading-none font-semibold tracking-tight ${a.balance < 0 ? "text-destructive" : ""}`}>
                    {formatMoney(a.balance)}
                  </p>
                </div>
                <div className={`stat-icon ${a.type === "cash" ? "stat-icon-gold" : "stat-icon-lagoon"}`}>
                  {a.type === "cash" ? <Banknote className="size-5" /> : <Landmark className="size-5" />}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        <Card className="bg-primary/10">
          <CardContent className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">{t("Total balance")}</p>
              <p className="font-heading mt-2 truncate text-[1.85rem] leading-none font-semibold tracking-tight">{formatMoney(money.totalBalance)}</p>
            </div>
            <div className="stat-icon">
              <Wallet className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What needs attention */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href={canEnter ? "/finances/income" : "/reports/income-expense"}>
          <Card className="h-full">
            <CardContent className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">{t(MONTHS[currentYearMonth().month - 1])} · {t("This month")}</p>
              <p className="flex items-center gap-2 text-lg font-semibold text-success">
                <ArrowDownLeft className="size-4" /> {t("Income")} {formatMoney(money.monthIncome)}
              </p>
              <p className="flex items-center gap-2 text-lg font-semibold text-destructive">
                <ArrowUpRight className="size-4" /> {t("Expense")} {formatMoney(money.monthExpense)}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href={canEnter ? "/rent" : "/reports/pending-rent"}>
          <Card className="h-full">
            <CardContent className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">{t("Rent pending")}</p>
              <p className="font-heading text-2xl font-semibold">{formatMoney(money.rent.pendingAmount)}</p>
              <p className="text-xs text-muted-foreground">
                {t("{n} months", { n: money.rent.pendingCount })} · {t("This month")}: {formatMoney(money.rent.collected)} / {formatMoney(money.rent.expected)}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href={canEnter ? "/salaries" : "/reports/unpaid-salaries"}>
          <Card className="h-full">
            <CardContent className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">{t("Salaries pending this month")}</p>
              <p className="font-heading text-2xl font-semibold">{formatMoney(money.salary.pendingAmount)}</p>
              <p className="text-xs text-muted-foreground">{t("{n} unpaid", { n: money.salary.pendingCount })}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href={canEnter ? "/finances/friday-collections" : "/reports/friday-by-week"}>
          <Card className="h-full">
            <CardContent className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">{t("This week's Friday collection")}</p>
              <p className="font-heading text-2xl font-semibold">{formatMoney(money.friday.amount)}</p>
              <p className="text-xs text-muted-foreground">{formatDate(money.friday.date)}</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="sm:col-span-2 lg:col-span-2">
          <CardContent className="flex flex-col gap-2">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarClock className="size-4" /> {t("Bills due")}
            </p>
            {money.dueBills.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("No bills due soon.")}</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {money.dueBills.slice(0, 4).map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate">
                      {b.state === "overdue" && <CircleAlert className="mr-1 inline size-3.5 text-destructive" />}
                      {b.accountLabel} · {formatDate(b.dueDate)}
                    </span>
                    <span className="font-semibold tabular-nums">{formatMoney(b.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="group/stat">
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
          </Card>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Financial Summary */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>
              Income vs Expenses overview
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Net Surplus</p>
              <p className={`font-heading mt-1 text-3xl font-semibold tracking-tight ${net >= 0 ? "text-success" : "text-destructive"}`}>
                ₹{net.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Share of money flow: income vs expenses */}
            <div
              className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`Income ₹${financeStats.totalIncome.toLocaleString("en-IN")}, expenses ₹${financeStats.totalExpenses.toLocaleString("en-IN")}`}
            >
              {flowTotal > 0 && (
                <>
                  <div className="h-full rounded-l-full bg-chart-1 transition-[width] duration-700" style={{ width: `${incomeShare}%` }} title="Income" />
                  <div className="h-full flex-1 rounded-r-full bg-chart-2" title="Expenses" />
                </>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="size-2.5 rounded-full bg-chart-1" />
                  Total Income
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  ₹{financeStats.totalIncome.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="size-2.5 rounded-full bg-chart-2" />
                  Total Expenses
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  ₹{financeStats.totalExpenses.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <Link href="/finances" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Open finances <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Fund balances chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Fund Overview</CardTitle>
            <CardDescription>
              Current balance across all fund types
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topFunds.length === 0 ? (
              <div className="empty-state py-8">
                <p>No funds yet</p>
                <p className="text-sm text-muted-foreground">Fund balances appear here once funds are set up.</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3.5">
                {topFunds.map((fund) => {
                  const balance = Number(fund.balance || 0);
                  return (
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
                          style={{ width: `${Math.max(2, (Math.abs(balance) / maxFund) * 100)}%` }}
                        />
                      </span>
                      <span className="text-right font-semibold tabular-nums">
                        ₹{balance.toLocaleString("en-IN")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
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
                { label: "Active Funds", value: financeStats.funds.length, icon: Wallet, href: "/finances" },
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
    </div>
  );
}
