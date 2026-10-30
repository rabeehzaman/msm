"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Handshake, IndianRupee, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { recordFundPayment } from "@/lib/actions/expenses";
import { AccountPicker, type AccountOption } from "@/components/money/form";
import { toast } from "sonner";
import { formatDate, todayIST } from "@/lib/format";

type ExpenseEntry = {
  id: string;
  amount: string;
  payee: string | null;
  description: string | null;
  date: string | null;
  status: string | null;
};

type Fund = {
  id: string;
  name: string;
  type: string;
  balance: string | null;
};

export function QardHasanClient({
  qardFund,
  disbursements,
  accounts,
}: {
  qardFund: Fund | null;
  disbursements: ExpenseEntry[];
  accounts: AccountOption[];
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = disbursements.filter((d) => {
    return !search ||
      (d.payee && d.payee.toLowerCase().includes(search.toLowerCase())) ||
      (d.description && d.description.toLowerCase().includes(search.toLowerCase()));
  });

  const totalDisbursed = disbursements.reduce((s, e) => s + Number(e.amount), 0);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      if (qardFund) {
        formData.set("fundId", qardFund.id);
      }
      formData.set("category", "Qard Hasan Loan");
      const result = await recordFundPayment(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Qard Hasan loan recorded");
      setOpen(false);
    } catch {
      toast.error("Failed to record loan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Qard Hasan</h1>
          <p className="page-subtitle">Interest-free community loan management (zero interest - Shariah compliant)</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}><Plus /> New Loan Disbursement</DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Qard Hasan Loan Disbursement</DialogTitle>
              <DialogDescription>Record an interest-free loan disbursement</DialogDescription>
            </DialogHeader>
            <form action={handleSubmit}>
              <div className="flex flex-col gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Borrower Name *</label>
                    <Input name="payee" placeholder="Full name" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Loan Amount (₹) *</label>
                    <Input type="number" name="amount" placeholder="0" required />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Date *</label>
                  <Input type="date" name="date" defaultValue={todayIST()} required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Purpose / Details</label>
                  <Textarea name="description" placeholder="Explain the purpose..." rows={2} />
                </div>
                <AccountPicker accounts={accounts} label="Paid via" />
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Shariah Compliance Note</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">This is a Qard Hasan (benevolent loan). Zero interest will be charged. Only the principal amount is repayable.</p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? <Loader2 className="size-4 animate-spin" /> : <Plus />} {loading ? "Saving..." : "Record Disbursement"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4"><div className="stat-icon stat-icon-lagoon"><Handshake className="size-5 text-blue-600" /></div><div><p className="text-muted-foreground text-sm">Total Loans</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">{disbursements.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4"><div className="stat-icon"><IndianRupee className="size-5 text-success" /></div><div><p className="text-muted-foreground text-sm">Total Disbursed</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">₹{totalDisbursed.toLocaleString("en-IN")}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4"><div className="stat-icon"><TrendingUp className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Fund Balance</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">₹{Number(qardFund?.balance || 0).toLocaleString("en-IN")}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4"><div className="stat-icon"><AlertTriangle className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Fund Type</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">{qardFund ? "Active" : "Not Set Up"}</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Loan Disbursements</CardTitle><CardDescription>All Qard Hasan loans</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1"><Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" /><Input placeholder="Search loans..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <p className="text-muted-foreground text-lg">No loans recorded yet</p>
              <p className="text-muted-foreground text-sm">Record your first Qard Hasan loan disbursement to get started.</p>
            </div>
          ) : (
            <div className="table-shell">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Borrower</TableHead><TableHead>Purpose</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.payee || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{l.description || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(l.date)}</TableCell>
                      <TableCell><Badge variant="default">{l.status || "disbursed"}</Badge></TableCell>
                      <TableCell className="text-right font-medium">₹{Number(l.amount).toLocaleString("en-IN")}</TableCell>
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
