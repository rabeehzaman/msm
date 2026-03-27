"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Handshake, IndianRupee, TrendingUp, AlertTriangle } from "lucide-react";

const loans = [
  { id: "QH-001", borrower: "Mohammed Ali", house: "MH-045", purpose: "Medical", amount: 50000, repaid: 35000, installment: 5000, months: "10/12", status: "repaying", date: "2024-08-15" },
  { id: "QH-002", borrower: "Rashid K", house: "MH-102", purpose: "Education", amount: 30000, repaid: 30000, installment: 5000, months: "6/6", status: "completed", date: "2024-06-01" },
  { id: "QH-003", borrower: "Ibrahim P", house: "MH-089", purpose: "Business", amount: 75000, repaid: 15000, installment: 5000, months: "3/15", status: "repaying", date: "2025-01-10" },
  { id: "QH-004", borrower: "Najeeb K", house: "MH-056", purpose: "Marriage", amount: 40000, repaid: 0, installment: 4000, months: "0/10", status: "disbursed", date: "2025-03-01" },
  { id: "QH-005", borrower: "Safwan M", house: "MH-078", purpose: "Housing Repair", amount: 60000, repaid: 60000, installment: 5000, months: "12/12", status: "completed", date: "2023-12-20" },
  { id: "QH-006", borrower: "Aslam K", house: "MH-034", purpose: "Emergency", amount: 25000, repaid: 10000, installment: 2500, months: "4/10", status: "repaying", date: "2024-11-05" },
  { id: "QH-007", borrower: "Faizal P", house: "MH-067", purpose: "Medical", amount: 35000, repaid: 0, installment: 0, months: "-", status: "application", date: "2025-03-20" },
];

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  application: "outline", under_review: "secondary", recommended: "secondary",
  approved: "secondary", disbursed: "default", repaying: "default",
  completed: "default", defaulted: "destructive", rejected: "destructive",
};

const totalDisbursed = 280000;
const totalRecovered = 150000;
const activeLoans = 3;

export default function QardHasanPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Qard Hasan</h1>
          <p className="text-muted-foreground">Interest-free community loan management (zero interest - Shariah compliant)</p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}><Plus /> New Loan Application</DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Qard Hasan Loan Application</DialogTitle>
              <DialogDescription>Submit an interest-free loan request</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Borrower Name</label>
                  <Input placeholder="Full name" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Household</label>
                  <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="mh001">MH-001</SelectItem></SelectContent></Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Loan Amount (Rs.)</label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Purpose</label>
                  <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="marriage">Marriage</SelectItem>
                    <SelectItem value="business">Business Startup</SelectItem>
                    <SelectItem value="housing">Housing Repair</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent></Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Repayment Period (Months)</label>
                <Input type="number" placeholder="12" defaultValue="12" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Guarantor 1</label>
                  <Input placeholder="Name" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Guarantor 2</label>
                  <Input placeholder="Name" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Purpose Details</label>
                <Textarea placeholder="Explain the need..." rows={2} />
              </div>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Shariah Compliance Note</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">This is a Qard Hasan (benevolent loan). Zero interest will be charged. Only the principal amount is repayable.</p>
              </div>
            </div>
            <DialogFooter><Button variant="outline">Cancel</Button><Button>Submit Application</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"><Handshake className="size-5 text-blue-600" /></div><div><p className="text-muted-foreground text-sm">Active Loans</p><p className="text-2xl font-bold">{activeLoans}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30"><IndianRupee className="size-5 text-green-600" /></div><div><p className="text-muted-foreground text-sm">Total Disbursed</p><p className="text-2xl font-bold">Rs. {totalDisbursed.toLocaleString("en-IN")}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><TrendingUp className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Recovery Rate</p><p className="text-2xl font-bold">{((totalRecovered/totalDisbursed)*100).toFixed(0)}%</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><AlertTriangle className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Pending Applications</p><p className="text-2xl font-bold">1</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Loan Portfolio</CardTitle><CardDescription>All Qard Hasan loans with repayment status</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1"><Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" /><Input placeholder="Search loans..." className="pl-9" /></div>
            <Select defaultValue="all"><SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="repaying">Repaying</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="application">Application</SelectItem></SelectContent></Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Loan #</TableHead><TableHead>Borrower</TableHead><TableHead>Purpose</TableHead><TableHead>Amount</TableHead><TableHead>Repaid</TableHead><TableHead>Progress</TableHead><TableHead>Installment</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {loans.map(l => (
                  <TableRow key={l.id} className="cursor-pointer">
                    <TableCell className="font-mono text-sm">{l.id}</TableCell>
                    <TableCell><div><p className="font-medium">{l.borrower}</p><p className="text-muted-foreground text-xs">{l.house}</p></div></TableCell>
                    <TableCell><Badge variant="outline">{l.purpose}</Badge></TableCell>
                    <TableCell className="font-medium">Rs. {l.amount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-green-600">Rs. {l.repaid.toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      {l.amount > 0 && l.status !== "application" ? (
                        <div className="flex items-center gap-2">
                          <Progress value={(l.repaid / l.amount) * 100} className="h-2 w-16" />
                          <span className="text-xs">{l.months}</span>
                        </div>
                      ) : <span className="text-muted-foreground text-xs">-</span>}
                    </TableCell>
                    <TableCell className="text-sm">{l.installment > 0 ? `Rs. ${l.installment.toLocaleString("en-IN")}/mo` : "-"}</TableCell>
                    <TableCell><Badge variant={statusColors[l.status]}>{l.status}</Badge></TableCell>
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
