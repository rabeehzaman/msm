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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Download, Receipt } from "lucide-react";

const recentIncome = [
  { id: "INC-001", date: "2025-03-12", description: "Friday Collection", amount: 45230, fund: "General", method: "Cash", receipt: "REC-2451" },
  { id: "INC-002", date: "2025-03-10", description: "Subscription - Ward 1 Batch", amount: 32500, fund: "General", method: "Mixed", receipt: "REC-2450" },
  { id: "INC-003", date: "2025-03-08", description: "Zakat - Mohammed Ali", amount: 50000, fund: "Zakat", method: "UPI", receipt: "REC-2449" },
  { id: "INC-004", date: "2025-03-07", description: "Building Fund - Haris Family", amount: 100000, fund: "Building", method: "Cheque", receipt: "REC-2448" },
  { id: "INC-005", date: "2025-03-05", description: "Madrasa Fee - 15 Students", amount: 22500, fund: "Madrasa", method: "Cash", receipt: "REC-2447" },
  { id: "INC-006", date: "2025-03-04", description: "Sadaqah - Anonymous", amount: 10000, fund: "Sadaqah", method: "Cash", receipt: "REC-2446" },
  { id: "INC-007", date: "2025-03-03", description: "Hall Rental - Wedding", amount: 15000, fund: "General", method: "Bank Transfer", receipt: "REC-2445" },
];

export default function IncomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Income</h1>
          <p className="text-muted-foreground">
            Record and manage all income entries
          </p>
        </div>
        <Dialog>
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
                <label className="text-sm font-medium">Fund</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fund" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Fund</SelectItem>
                    <SelectItem value="zakat">Zakat Fund</SelectItem>
                    <SelectItem value="sadaqah">Sadaqah Fund</SelectItem>
                    <SelectItem value="madrasa">Madrasa Fund</SelectItem>
                    <SelectItem value="building">Building Fund</SelectItem>
                    <SelectItem value="death">Death/Janazah Fund</SelectItem>
                    <SelectItem value="marriage">Marriage Assistance</SelectItem>
                    <SelectItem value="scholarship">Scholarship Fund</SelectItem>
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
                <Input placeholder="Member name or source description" />
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
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Reference #</label>
                  <Input placeholder="Transaction ref" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea placeholder="Additional notes..." rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="anonymous" />
                <label htmlFor="anonymous" className="text-sm">
                  Anonymous donation
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>
                <Receipt />
                Save & Generate Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Today", value: "Rs. 12,500" },
          { label: "This Week", value: "Rs. 1,25,430" },
          { label: "This Month", value: "Rs. 4,12,000" },
          { label: "Receipts Issued", value: "234" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Income Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Income Register</CardTitle>
              <CardDescription>All recorded income entries</CardDescription>
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
              <Input placeholder="Search income entries..." className="pl-9" />
            </div>
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
                  <TableHead>Entry #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Fund</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentIncome.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-sm">{entry.id}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </TableCell>
                    <TableCell className="font-medium">{entry.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.fund}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{entry.method}</TableCell>
                    <TableCell className="font-mono text-sm">{entry.receipt}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      Rs. {entry.amount.toLocaleString("en-IN")}
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
