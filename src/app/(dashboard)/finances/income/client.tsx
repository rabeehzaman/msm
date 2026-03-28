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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Download, Receipt, Loader2 } from "lucide-react";
import { createIncomeEntry } from "@/lib/actions/finance";
import { toast } from "sonner";

type IncomeEntry = {
  id: string;
  receiptNumber: string | null;
  amount: string;
  donorName: string | null;
  category: string | null;
  description: string | null;
  paymentMethod: string | null;
  date: string | null;
  isAnonymous: boolean | null;
  fundName: string | null;
  fundId: string | null;
};

type Fund = {
  id: string;
  name: string;
  type: string;
};

export function IncomeClient({
  entries,
  funds,
}: {
  entries: IncomeEntry[];
  funds: Fund[];
}) {
  const [search, setSearch] = useState("");
  const [fundFilter, setFundFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = entries.filter((e) => {
    const matchesSearch =
      !search ||
      (e.donorName && e.donorName.toLowerCase().includes(search.toLowerCase())) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase())) ||
      (e.receiptNumber && e.receiptNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesFund = fundFilter === "all" || e.fundId === fundFilter;
    return matchesSearch && matchesFund;
  });

  const totalAmount = entries.reduce((sum, e) => sum + Number(e.amount), 0);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    try {
      await createIncomeEntry(formData);
      toast.success("Income entry recorded successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to record income entry");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Income</h1>
          <p className="text-muted-foreground">
            Record and manage all income entries
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus />
            Record Income
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Income</DialogTitle>
              <DialogDescription>
                Add a new income entry to the ledger
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
                  <label className="text-sm font-medium">Fund *</label>
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
                      <SelectItem value="subscription">Subscription Payment</SelectItem>
                      <SelectItem value="donation">Donation</SelectItem>
                      <SelectItem value="friday_collection">Friday Collection</SelectItem>
                      <SelectItem value="madrasa_fee">Madrasa Fee</SelectItem>
                      <SelectItem value="rental">Rental Income</SelectItem>
                      <SelectItem value="zakat">Zakat</SelectItem>
                      <SelectItem value="fitrah">Fitrah</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Donor / Source</label>
                  <Input name="donorName" placeholder="Member name or source description" />
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
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Reference #</label>
                    <Input name="referenceNumber" placeholder="Transaction ref" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea name="description" placeholder="Additional notes..." rows={2} />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="anonymous" name="isAnonymous" />
                  <label htmlFor="anonymous" className="text-sm">
                    Anonymous donation
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Receipt />}
                  {loading ? "Saving..." : "Save & Generate Receipt"}
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
            <p className="text-muted-foreground text-sm">Total Income</p>
            <p className="text-2xl font-bold">Rs. {totalAmount.toLocaleString("en-IN")}</p>
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
            <p className="text-muted-foreground text-sm">Funds</p>
            <p className="text-2xl font-bold">{funds.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Showing</p>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Income Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Income Register</CardTitle>
              <CardDescription>All recorded income entries</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search income entries..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
              <p className="text-muted-foreground text-lg">No income entries found</p>
              <p className="text-muted-foreground text-sm">
                {entries.length === 0 ? "Record your first income entry to get started." : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Fund</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-sm">{entry.receiptNumber || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {entry.date ? new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.isAnonymous ? "Anonymous" : entry.donorName || entry.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.fundName || "-"}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{entry.paymentMethod || "-"}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        Rs. {Number(entry.amount).toLocaleString("en-IN")}
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
