"use client";

import { useState } from "react";
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
import { Plus, Search, FileCheck } from "lucide-react";
import { createExpenseEntry } from "@/lib/actions/finance";
import { toast } from "sonner";

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
  fundId: string | null;
};

type Fund = {
  id: string;
  name: string;
  type: string;
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  approved: "secondary",
  pending_approval: "outline",
  rejected: "destructive",
  draft: "secondary",
};

export function ExpensesClient({
  entries,
  funds,
}: {
  entries: ExpenseEntry[];
  funds: Fund[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fundFilter, setFundFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = entries.filter((e) => {
    const matchesSearch =
      !search ||
      (e.payee && e.payee.toLowerCase().includes(search.toLowerCase())) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase())) ||
      (e.voucherNumber && e.voucherNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const matchesFund = fundFilter === "all" || e.fundId === fundFilter;
    return matchesSearch && matchesStatus && matchesFund;
  });

  const totalAmount = entries.reduce((sum, e) => sum + Number(e.amount), 0);
  const pendingCount = entries.filter((e) => e.status === "pending_approval").length;

  async function handleCreate(formData: FormData) {
    try {
      await createExpenseEntry(formData);
      toast.success("Expense entry submitted successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to record expense");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Record expenses with approval workflow
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
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
            <form action={handleCreate}>
              <div className="flex flex-col gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Date *</label>
                    <Input type="date" name="date" defaultValue={new Date().toISOString().split("T")[0]} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Amount (Rs.) *</label>
                    <Input type="number" name="amount" placeholder="0.00" required />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Fund to Debit *</label>
                  <Select name="fundId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fund" />
                    </SelectTrigger>
                    <SelectContent>
                      {funds.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Select name="category" required>
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
                  <label className="text-sm font-medium">Payee *</label>
                  <Input name="payee" placeholder="Who is being paid?" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Payment Method</label>
                    <Select name="paymentMethod">
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
                    <Input name="referenceNumber" placeholder="Bill / invoice number" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea name="description" placeholder="Details about this expense..." rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">
                  <FileCheck />
                  Submit for Approval
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Expenses</p>
            <p className="text-2xl font-bold">Rs. {totalAmount.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Pending Approval</p>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Entries</p>
            <p className="text-2xl font-bold">{entries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Showing</p>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense Register</CardTitle>
              <CardDescription>All expense entries with approval status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search expenses..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={fundFilter} onValueChange={(v) => setFundFilter(v ?? "all")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Fund" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Funds</SelectItem>
                {funds.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No expense entries found</p>
              <p className="text-muted-foreground text-sm">
                {entries.length === 0 ? "Record your first expense to get started." : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voucher #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payee / Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Fund</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="font-mono text-sm">{exp.voucherNumber || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {exp.date ? new Date(exp.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-"}
                      </TableCell>
                      <TableCell className="font-medium">{exp.payee || exp.description || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{exp.category || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{exp.fundName || "-"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[exp.status || "draft"] || "secondary"}>
                          {(exp.status || "draft").replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-500">
                        Rs. {Number(exp.amount).toLocaleString("en-IN")}
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
