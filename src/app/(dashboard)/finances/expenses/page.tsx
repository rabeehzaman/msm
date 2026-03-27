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
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Search, Download, FileCheck } from "lucide-react";

const expenses = [
  { id: "EXP-001", date: "2025-03-12", description: "Imam Salary - March", amount: 25000, fund: "General", category: "Salary", status: "paid", approvedBy: "President" },
  { id: "EXP-002", date: "2025-03-10", description: "Electricity Bill - Feb", amount: 12500, fund: "General", category: "Utilities", status: "paid", approvedBy: "Treasurer" },
  { id: "EXP-003", date: "2025-03-09", description: "Teacher Salaries (5)", amount: 85000, fund: "Madrasa", category: "Salary", status: "paid", approvedBy: "President" },
  { id: "EXP-004", date: "2025-03-08", description: "Funeral Expenses #J-089", amount: 18500, fund: "Death/Janazah", category: "Funeral", status: "paid", approvedBy: "Secretary" },
  { id: "EXP-005", date: "2025-03-07", description: "Building Repair - Wall", amount: 45000, fund: "Building", category: "Maintenance", status: "pending_approval", approvedBy: "-" },
  { id: "EXP-006", date: "2025-03-06", description: "Stationery & Printing", amount: 3500, fund: "General", category: "Admin", status: "paid", approvedBy: "Secretary" },
  { id: "EXP-007", date: "2025-03-05", description: "Water Bill - Feb", amount: 4200, fund: "General", category: "Utilities", status: "approved", approvedBy: "Treasurer" },
  { id: "EXP-008", date: "2025-03-04", description: "Zakat Distribution - 3 Families", amount: 30000, fund: "Zakat", category: "Welfare", status: "paid", approvedBy: "President" },
];

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  approved: "secondary",
  pending_approval: "outline",
  rejected: "destructive",
  draft: "secondary",
};

export default function ExpensesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Record expenses with approval workflow
          </p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}>
            <Plus />
            Record Expense
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Expense</DialogTitle>
              <DialogDescription>
                Submit an expense for approval and payment
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" defaultValue="2025-03-27" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Amount (Rs.)</label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Fund to Debit</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fund" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Fund</SelectItem>
                    <SelectItem value="zakat">Zakat Fund (Restricted)</SelectItem>
                    <SelectItem value="madrasa">Madrasa Fund</SelectItem>
                    <SelectItem value="building">Building Fund</SelectItem>
                    <SelectItem value="death">Death/Janazah Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salary / Wages</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="maintenance">Maintenance / Repairs</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="admin">Administrative</SelectItem>
                    <SelectItem value="welfare">Welfare Distribution</SelectItem>
                    <SelectItem value="funeral">Funeral Expenses</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="events">Events / Programs</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Payee</label>
                <Input placeholder="Who is being paid?" />
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
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Reference #</label>
                  <Input placeholder="Bill / invoice number" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea placeholder="Details about this expense..." rows={2} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Attach Documents</label>
                <Input type="file" accept="image/*,.pdf" />
                <p className="text-muted-foreground text-xs">
                  Upload bill, invoice, or receipt photo
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Save as Draft</Button>
              <Button>
                <FileCheck />
                Submit for Approval
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "This Month", value: "Rs. 2,78,000" },
          { label: "Pending Approval", value: "5" },
          { label: "Budget Remaining", value: "Rs. 4,22,000" },
          { label: "Vouchers Issued", value: "189" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expense Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense Register</CardTitle>
              <CardDescription>All expense entries with approval status</CardDescription>
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
              <Input placeholder="Search expenses..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Fund" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Funds</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="zakat">Zakat</SelectItem>
                <SelectItem value="madrasa">Madrasa</SelectItem>
                <SelectItem value="building">Building</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Fund</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-mono text-sm">{exp.id}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(exp.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </TableCell>
                    <TableCell className="font-medium">{exp.description}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{exp.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{exp.fund}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{exp.approvedBy}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[exp.status]}>
                        {exp.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-500">
                      Rs. {exp.amount.toLocaleString("en-IN")}
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
