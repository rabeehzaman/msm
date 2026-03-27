"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  Receipt,
  CreditCard,
  Plus,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";

const monthlyData = [
  { month: "Jul", income: 285000, expenses: 198000 },
  { month: "Aug", income: 312000, expenses: 215000 },
  { month: "Sep", income: 298000, expenses: 223000 },
  { month: "Oct", income: 345000, expenses: 189000 },
  { month: "Nov", income: 378000, expenses: 245000 },
  { month: "Dec", income: 425000, expenses: 267000 },
  { month: "Jan", income: 356000, expenses: 234000 },
  { month: "Feb", income: 389000, expenses: 256000 },
  { month: "Mar", income: 412000, expenses: 278000 },
];

const fundBalances = [
  { name: "General Fund", balance: 452300, color: "hsl(var(--chart-1))", utilized: 65, budget: 700000 },
  { name: "Zakat Fund", balance: 218500, color: "hsl(var(--chart-2))", utilized: 45, budget: 500000 },
  { name: "Madrasa Fund", balance: 185200, color: "hsl(var(--chart-3))", utilized: 72, budget: 250000 },
  { name: "Building Fund", balance: 834100, color: "hsl(var(--chart-4))", utilized: 28, budget: 3000000 },
  { name: "Death/Janazah", balance: 125000, color: "hsl(var(--chart-5))", utilized: 35, budget: 200000 },
  { name: "Sadaqah Fund", balance: 98700, color: "hsl(var(--chart-1))", utilized: 52, budget: 150000 },
  { name: "Marriage Assist.", balance: 67500, color: "hsl(var(--chart-2))", utilized: 40, budget: 100000 },
  { name: "Scholarship", balance: 156000, color: "hsl(var(--chart-3))", utilized: 38, budget: 250000 },
];

const recentTransactions = [
  { id: "1", type: "income", description: "Friday Collection - Juma 12 Mar", amount: 45230, fund: "General", date: "2025-03-12", method: "Cash" },
  { id: "2", type: "expense", description: "Electricity Bill - February", amount: 12500, fund: "General", date: "2025-03-10", method: "Bank Transfer" },
  { id: "3", type: "income", description: "Subscription - 45 Households", amount: 67500, fund: "General", date: "2025-03-08", method: "Mixed" },
  { id: "4", type: "income", description: "Zakat Donation - Anon", amount: 50000, fund: "Zakat", date: "2025-03-07", method: "UPI" },
  { id: "5", type: "expense", description: "Teacher Salary - March", amount: 85000, fund: "Madrasa", date: "2025-03-05", method: "Bank Transfer" },
  { id: "6", type: "income", description: "Building Fund Contribution", amount: 100000, fund: "Building", date: "2025-03-04", method: "Cheque" },
  { id: "7", type: "expense", description: "Funeral Expenses - Ref #J-089", amount: 18500, fund: "Death/Janazah", date: "2025-03-03", method: "Cash" },
  { id: "8", type: "income", description: "Ramadan Special Donation", amount: 25000, fund: "Ramadan", date: "2025-03-01", method: "UPI" },
];

const incomeChartConfig = {
  income: { label: "Income", color: "hsl(var(--chart-1))" },
  expenses: { label: "Expenses", color: "hsl(var(--chart-2))" },
};

const pieData = [
  { name: "Subscriptions", value: 42, fill: "hsl(var(--chart-1))" },
  { name: "Friday Collections", value: 25, fill: "hsl(var(--chart-2))" },
  { name: "Donations", value: 18, fill: "hsl(var(--chart-3))" },
  { name: "Madrasa Fees", value: 10, fill: "hsl(var(--chart-4))" },
  { name: "Rentals", value: 5, fill: "hsl(var(--chart-5))" },
];

export default function FinancesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finances</h1>
          <p className="text-muted-foreground">
            Complete financial overview across all funds
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/finances/income">
            <Button variant="outline">
              <Plus />
              Record Income
            </Button>
          </Link>
          <Link href="/finances/expenses">
            <Button>
              <Plus />
              Record Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income (MTD)</CardTitle>
            <IndianRupee className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. 4,12,000</div>
            <div className="flex items-center gap-1 text-xs text-green-500">
              <ArrowUpRight className="size-3" />
              +8.2% vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses (MTD)</CardTitle>
            <CreditCard className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. 2,78,000</div>
            <div className="flex items-center gap-1 text-xs text-red-500">
              <ArrowDownRight className="size-3" />
              +5.1% vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Surplus</CardTitle>
            <TrendingUp className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs. 1,34,000</div>
            <p className="text-muted-foreground text-xs">Across all funds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Receipt className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-muted-foreground text-xs">5 expenses, 3 transfers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Income vs Expense Trend */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Monthly trend for the current fiscal year</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={incomeChartConfig} className="h-[300px] w-full">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Income Sources Pie */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Income Sources</CardTitle>
            <CardDescription>Revenue distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-col gap-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fund Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Fund Balances</CardTitle>
          <CardDescription>
            Current balance and utilization across all segregated funds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {fundBalances.map((fund) => (
              <div key={fund.name} className="flex flex-col gap-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{fund.name}</span>
                  <Badge variant={fund.utilized > 70 ? "destructive" : "secondary"} className="text-xs">
                    {fund.utilized}%
                  </Badge>
                </div>
                <span className="text-xl font-bold">
                  Rs. {fund.balance.toLocaleString("en-IN")}
                </span>
                <Progress value={fund.utilized} className="h-2" />
                <span className="text-muted-foreground text-xs">
                  Budget: Rs. {fund.budget.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest income and expense entries</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Fund</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(tx.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </TableCell>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.fund}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{tx.method}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={tx.type === "income" ? "text-green-600" : "text-red-500"}>
                        {tx.type === "income" ? "+" : "-"} Rs. {tx.amount.toLocaleString("en-IN")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
