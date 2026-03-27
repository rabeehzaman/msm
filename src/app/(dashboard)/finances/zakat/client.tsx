"use client";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calculator } from "lucide-react";
import { createIncomeEntry, createExpenseEntry } from "@/lib/actions/finance";
import { toast } from "sonner";

type IncomeEntry = {
  id: string;
  amount: string;
  donorName: string | null;
  description: string | null;
  date: string | null;
};

type ExpenseEntry = {
  id: string;
  amount: string;
  payee: string | null;
  description: string | null;
  date: string | null;
  category: string | null;
};

type Fund = {
  id: string;
  name: string;
  type: string;
  balance: string | null;
};

export function ZakatClient({
  zakatFund,
  income,
  expenses,
}: {
  zakatFund: Fund | null;
  income: IncomeEntry[];
  expenses: ExpenseEntry[];
}) {
  const [open, setOpen] = useState(false);

  const totalCollected = income.reduce((s, e) => s + Number(e.amount), 0);
  const totalDisbursed = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const balance = totalCollected - totalDisbursed;

  async function handleRecordDistribution(formData: FormData) {
    try {
      if (zakatFund) {
        formData.set("fundId", zakatFund.id);
      }
      formData.set("category", "welfare");
      await createExpenseEntry(formData);
      toast.success("Zakat distribution recorded");
      setOpen(false);
    } catch {
      toast.error("Failed to record distribution");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zakat Management</h1>
          <p className="text-muted-foreground">Collection and distribution tracking</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}><Calculator /> Nisab Calculator</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Zakat Nisab Calculator</DialogTitle>
                <DialogDescription>Calculate Zakat obligation based on wealth</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Calculation Standard</label>
                  <Select defaultValue="gold">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">Gold Standard (87.48g)</SelectItem>
                      <SelectItem value="silver">Silver Standard (612g)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Cash & Bank Balance</label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Gold Value (Rs.)</label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Silver Value (Rs.)</label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Investments</label>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Minus: Liabilities</label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
                  <p className="text-xs text-muted-foreground">Use the fields above to calculate. Zakat is 2.5% of net zakatable wealth above Nisab.</p>
                </div>
              </div>
              <DialogFooter><Button variant="outline">Close</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}><Plus /> Record Distribution</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Zakat Distribution</DialogTitle>
                <DialogDescription>Record a Zakat disbursement</DialogDescription>
              </DialogHeader>
              <form action={handleRecordDistribution}>
                <div className="flex flex-col gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Recipient *</label>
                      <Input name="payee" placeholder="Recipient name" required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Amount *</label>
                      <Input type="number" name="amount" placeholder="0" required />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Date *</label>
                    <Input type="date" name="date" defaultValue={new Date().toISOString().split("T")[0]} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea name="description" placeholder="Details..." rows={2} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit">Record Distribution</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Collected</p>
            <p className="text-2xl font-bold">Rs. {totalCollected.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Disbursed</p>
            <p className="text-2xl font-bold text-green-600">Rs. {totalDisbursed.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Available Balance</p>
            <p className="text-2xl font-bold">Rs. {balance.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Beneficiaries</p>
            <p className="text-2xl font-bold">{expenses.length}</p>
          </CardContent>
        </Card>
      </div>

      {totalCollected > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Zakat Utilization</span>
              <span className="text-sm font-medium">{totalCollected > 0 ? ((totalDisbursed / totalCollected) * 100).toFixed(1) : 0}%</span>
            </div>
            <Progress value={totalCollected > 0 ? (totalDisbursed / totalCollected) * 100 : 0} className="h-3" />
            <p className="text-muted-foreground mt-1 text-xs">Rs. {balance.toLocaleString("en-IN")} remaining to be distributed</p>
          </CardContent>
        </Card>
      )}

      {/* Distribution Table */}
      <Card>
        <CardHeader><CardTitle>Distribution Register</CardTitle><CardDescription>All Zakat disbursements</CardDescription></CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No distributions yet</p>
              <p className="text-muted-foreground text-sm">Record your first Zakat distribution to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Recipient</TableHead><TableHead>Description</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {expenses.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.payee || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{d.description || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{d.date ? new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-"}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">Rs. {Number(d.amount).toLocaleString("en-IN")}</TableCell>
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
