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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Receipt,
  Plus,
  IndianRupee,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

type Fund = {
  id: string;
  name: string;
  type: string;
  balance: string | null;
  isRestricted: boolean;
};

type FinanceStats = {
  totalIncome: number;
  totalExpenses: number;
  incomeCount: number;
  expenseCount: number;
  funds: Fund[];
};

type IncomeEntry = {
  id: string;
  receiptNumber: string | null;
  amount: string;
  donorName: string | null;
  category: string | null;
  description: string | null;
  paymentMethod: string | null;
  date: string | null;
  fundName: string | null;
};

type ExpenseEntry = {
  id: string;
  voucherNumber: string | null;
  amount: string;
  payee: string | null;
  category: string | null;
  description: string | null;
  paymentMethod: string | null;
  status: string | null;
  date: string | null;
  fundName: string | null;
};

export function FinancesClient({
  stats,
  recentIncome,
  recentExpenses,
}: {
  stats: FinanceStats;
  recentIncome: IncomeEntry[];
  recentExpenses: ExpenseEntry[];
}) {
  const netSurplus = stats.totalIncome - stats.totalExpenses;

  // Combine and sort recent transactions
  const recentTransactions = [
    ...recentIncome.slice(0, 5).map((i) => ({
      id: i.id,
      type: "income" as const,
      description: i.description || i.donorName || "Income",
      amount: Number(i.amount),
      fund: i.fundName || "-",
      date: i.date || "",
      method: i.paymentMethod || "cash",
    })),
    ...recentExpenses.slice(0, 5).map((e) => ({
      id: e.id,
      type: "expense" as const,
      description: e.description || e.payee || "Expense",
      amount: Number(e.amount),
      fund: e.fundName || "-",
      date: e.date || "",
      method: e.paymentMethod || "cash",
    })),
  ].sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 8);

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
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <IndianRupee className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {stats.totalIncome.toLocaleString("en-IN")}</div>
            <div className="text-muted-foreground text-xs">
              {stats.incomeCount} entries
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {stats.totalExpenses.toLocaleString("en-IN")}</div>
            <div className="text-muted-foreground text-xs">
              {stats.expenseCount} entries
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Surplus</CardTitle>
            <TrendingUp className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netSurplus >= 0 ? "text-green-600" : "text-red-500"}`}>
              Rs. {netSurplus.toLocaleString("en-IN")}
            </div>
            <p className="text-muted-foreground text-xs">Across all funds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Funds</CardTitle>
            <Receipt className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.funds.length}</div>
            <p className="text-muted-foreground text-xs">{stats.funds.filter(f => f.isRestricted).length} restricted</p>
          </CardContent>
        </Card>
      </div>

      {/* Fund Balances */}
      {stats.funds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fund Balances</CardTitle>
            <CardDescription>
              Current balance across all segregated funds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {stats.funds.map((fund) => (
                <div key={fund.id} className="flex flex-col gap-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{fund.name}</span>
                    {fund.isRestricted && (
                      <Badge variant="secondary" className="text-xs">Restricted</Badge>
                    )}
                  </div>
                  <span className="text-xl font-bold">
                    Rs. {Number(fund.balance || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="text-muted-foreground text-xs capitalize">
                    {fund.type.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest income and expense entries</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No transactions yet</p>
              <p className="text-muted-foreground text-sm">
                Record your first income or expense to get started.
              </p>
            </div>
          ) : (
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
                        {tx.date ? new Date(tx.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-"}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
