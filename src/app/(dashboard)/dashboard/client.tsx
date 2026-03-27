"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Home,
  Wallet,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

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

export function DashboardClient({
  stats,
  financeStats,
}: {
  stats: DashboardStats;
  financeStats: FinanceStats;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s an overview of your Mahallu.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Households</CardTitle>
            <Home className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.households.toLocaleString("en-IN")}</div>
            <div className="text-muted-foreground text-xs">registered families</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.members.toLocaleString("en-IN")}</div>
            <div className="text-muted-foreground text-xs">community members</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <Wallet className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {financeStats.totalIncome.toLocaleString("en-IN")}</div>
            <div className="text-muted-foreground text-xs">{financeStats.incomeCount} entries</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Madrasa Students</CardTitle>
            <GraduationCap className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students.toLocaleString("en-IN")}</div>
            <div className="text-muted-foreground text-xs">enrolled</div>
          </CardContent>
        </Card>
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
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Income</span>
                <span className="text-sm font-bold text-green-600">
                  Rs. {financeStats.totalIncome.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Expenses</span>
                <span className="text-sm font-bold text-red-500">
                  Rs. {financeStats.totalExpenses.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-sm font-semibold">Net Surplus</span>
                <span className={`text-sm font-bold ${financeStats.totalIncome - financeStats.totalExpenses >= 0 ? "text-green-600" : "text-red-500"}`}>
                  Rs. {(financeStats.totalIncome - financeStats.totalExpenses).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Community Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
                    <Home className="size-4" />
                  </div>
                  <span className="text-sm font-medium">Households</span>
                </div>
                <Badge variant="secondary">{stats.households}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
                    <Users className="size-4" />
                  </div>
                  <span className="text-sm font-medium">Members</span>
                </div>
                <Badge variant="secondary">{stats.members}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
                    <GraduationCap className="size-4" />
                  </div>
                  <span className="text-sm font-medium">Madrasa Students</span>
                </div>
                <Badge variant="secondary">{stats.students}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
                    <Wallet className="size-4" />
                  </div>
                  <span className="text-sm font-medium">Active Funds</span>
                </div>
                <Badge variant="secondary">{financeStats.funds.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fund Overview */}
      {financeStats.funds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fund Overview</CardTitle>
            <CardDescription>
              Current balance across all fund types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {financeStats.funds.slice(0, 8).map((fund) => (
                <div key={fund.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{fund.name}</span>
                    {fund.isRestricted && (
                      <span className="text-muted-foreground text-xs">Restricted</span>
                    )}
                  </div>
                  <span className="text-lg font-bold">
                    Rs. {Number(fund.balance || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.households === 0 && stats.members === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground text-lg">Getting started</p>
          <p className="text-muted-foreground text-sm">
            Start by adding households and members to see data on the dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
