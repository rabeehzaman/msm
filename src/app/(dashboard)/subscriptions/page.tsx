"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Download,
  IndianRupee,
  Bell,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

const householdSubscriptions = [
  { id: "1", house: "MH-001", family: "Rahman", plan: "Standard", amount: 500, frequency: "Monthly", lastPaid: "2025-03-01", nextDue: "2025-04-01", status: "paid", arrears: 0 },
  { id: "2", house: "MH-002", family: "Basheer", plan: "Standard", amount: 500, frequency: "Monthly", lastPaid: "2025-01-15", nextDue: "2025-02-01", status: "overdue", arrears: 1000 },
  { id: "3", house: "MH-003", family: "Kunju Mohammed", plan: "Senior", amount: 300, frequency: "Monthly", lastPaid: "2025-03-05", nextDue: "2025-04-01", status: "paid", arrears: 0 },
  { id: "4", house: "MH-004", family: "Siddique", plan: "NRI", amount: 2000, frequency: "Quarterly", lastPaid: "2024-12-01", nextDue: "2025-03-01", status: "overdue", arrears: 4000 },
  { id: "5", house: "MH-005", family: "Haris", plan: "Standard", amount: 500, frequency: "Monthly", lastPaid: "2025-03-10", nextDue: "2025-04-01", status: "paid", arrears: 0 },
  { id: "6", house: "MH-006", family: "Aslam", plan: "Standard", amount: 500, frequency: "Monthly", lastPaid: "2025-02-01", nextDue: "2025-03-01", status: "overdue", arrears: 500 },
  { id: "7", house: "MH-007", family: "Faizal", plan: "BPL", amount: 100, frequency: "Monthly", lastPaid: "2025-03-02", nextDue: "2025-04-01", status: "paid", arrears: 0 },
  { id: "8", house: "MH-008", family: "Najeeb", plan: "Standard", amount: 500, frequency: "Monthly", lastPaid: "2024-11-01", nextDue: "2024-12-01", status: "defaulted", arrears: 2000 },
];

const agingBuckets = [
  { range: "Current", count: 987, amount: 493500, color: "text-green-600" },
  { range: "1-30 days", count: 98, amount: 49000, color: "text-yellow-600" },
  { range: "31-60 days", count: 45, amount: 22500, color: "text-orange-500" },
  { range: "61-90 days", count: 23, amount: 23000, color: "text-red-500" },
  { range: "90+ days", count: 12, amount: 48000, color: "text-red-700" },
];

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  overdue: "destructive",
  defaulted: "destructive",
  paused: "secondary",
};

export default function SubscriptionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage household subscription plans and collection
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell />
            Send Reminders
          </Button>
          <Dialog>
            <DialogTrigger render={<Button />}>
              <CreditCard />
              Record Payment
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Subscription Payment</DialogTitle>
                <DialogDescription>
                  Enter payment details for a household subscription
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Household</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select household" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mh001">MH-001 - Rahman</SelectItem>
                      <SelectItem value="mh002">MH-002 - Basheer</SelectItem>
                      <SelectItem value="mh003">MH-003 - Kunju Mohammed</SelectItem>
                      <SelectItem value="mh004">MH-004 - Siddique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Period</label>
                    <Input placeholder="e.g. March 2025" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Payment Method</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input type="date" defaultValue="2025-03-27" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Collected By</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Collector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office Collection</SelectItem>
                      <SelectItem value="ward1">Ward 1 Collector</SelectItem>
                      <SelectItem value="ward2">Ward 2 Collector</SelectItem>
                      <SelectItem value="ward3">Ward 3 Collector</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save Payment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Collection Rate</p>
            <p className="text-2xl font-bold">87.3%</p>
            <Progress value={87.3} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Expected (MTD)</p>
            <p className="text-2xl font-bold">Rs. 6,42,000</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Collected (MTD)</p>
            <p className="text-2xl font-bold text-green-600">Rs. 5,60,466</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Outstanding</p>
            <p className="text-2xl font-bold text-red-500">Rs. 81,534</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Defaulters</p>
            <p className="text-2xl font-bold">12</p>
          </CardContent>
        </Card>
      </div>

      {/* Aging Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Arrears Aging Analysis</CardTitle>
          <CardDescription>Outstanding dues by age bucket</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {agingBuckets.map((bucket) => (
              <div key={bucket.range} className="rounded-lg border p-4">
                <p className="text-muted-foreground text-xs font-medium">{bucket.range}</p>
                <p className={`text-lg font-bold ${bucket.color}`}>
                  Rs. {bucket.amount.toLocaleString("en-IN")}
                </p>
                <p className="text-muted-foreground text-xs">{bucket.count} households</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Ledger */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Household Subscription Ledger</CardTitle>
              <CardDescription>Payment status for all households</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input placeholder="Search household..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="defaulted">Defaulted</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="nri">NRI</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="bpl">BPL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>House #</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Last Paid</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Arrears</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {householdSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-sm">{sub.house}</TableCell>
                    <TableCell className="font-medium">{sub.family}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.plan}</Badge>
                    </TableCell>
                    <TableCell>Rs. {sub.amount}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{sub.frequency}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(sub.lastPaid).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(sub.nextDue).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </TableCell>
                    <TableCell>
                      {sub.arrears > 0 ? (
                        <span className="font-medium text-red-500">
                          Rs. {sub.arrears.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[sub.status]}>
                        {sub.status === "paid" && <CheckCircle2 className="mr-1 size-3" />}
                        {sub.status === "overdue" && <AlertTriangle className="mr-1 size-3" />}
                        {sub.status}
                      </Badge>
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
