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
import { Separator } from "@/components/ui/separator";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, IndianRupee, CheckCircle2 } from "lucide-react";

const collections = [
  { id: "FC-052", date: "2025-03-21", total: 48750, counter1: "Ahmed K", counter2: "Rashid M", status: "reconciled", deposit: "DEP-234" },
  { id: "FC-051", date: "2025-03-14", total: 45230, counter1: "Ahmed K", counter2: "Basheer P", status: "deposited", deposit: "DEP-233" },
  { id: "FC-050", date: "2025-03-07", total: 52100, counter1: "Rashid M", counter2: "Aslam K", status: "reconciled", deposit: "DEP-232" },
  { id: "FC-049", date: "2025-02-28", total: 41800, counter1: "Ahmed K", counter2: "Rashid M", status: "reconciled", deposit: "DEP-231" },
  { id: "FC-048", date: "2025-02-21", total: 39500, counter1: "Basheer P", counter2: "Aslam K", status: "reconciled", deposit: "DEP-230" },
  { id: "FC-047", date: "2025-02-14", total: 44200, counter1: "Ahmed K", counter2: "Rashid M", status: "reconciled", deposit: "DEP-229" },
];

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  open: "outline",
  counting: "secondary",
  pending_verification: "secondary",
  verified: "default",
  deposited: "default",
  reconciled: "default",
};

const denominations = [
  { label: "Rs. 2000", key: "d2000" },
  { label: "Rs. 500", key: "d500" },
  { label: "Rs. 200", key: "d200" },
  { label: "Rs. 100", key: "d100" },
  { label: "Rs. 50", key: "d50" },
  { label: "Rs. 20", key: "d20" },
  { label: "Rs. 10", key: "d10" },
  { label: "Rs. 5", key: "d5" },
  { label: "Rs. 2", key: "d2" },
  { label: "Rs. 1", key: "d1" },
];

export default function FridayCollectionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Friday Collections</h1>
          <p className="text-muted-foreground">
            Juma collection batches with dual-counter verification
          </p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}>
            <Plus />
            New Collection Batch
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>New Friday Collection Batch</DialogTitle>
              <DialogDescription>
                Record today&apos;s Juma collection with denomination count
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Collection Date</label>
                  <Input type="date" defaultValue="2025-03-28" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Counter 1</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ahmed">Ahmed K</SelectItem>
                      <SelectItem value="rashid">Rashid M</SelectItem>
                      <SelectItem value="basheer">Basheer P</SelectItem>
                      <SelectItem value="aslam">Aslam K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Counter 2 (Verifier)</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ahmed">Ahmed K</SelectItem>
                      <SelectItem value="rashid">Rashid M</SelectItem>
                      <SelectItem value="basheer">Basheer P</SelectItem>
                      <SelectItem value="aslam">Aslam K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 text-sm font-semibold">Denomination Count</h4>
                <div className="grid grid-cols-5 gap-3">
                  {denominations.map((d) => (
                    <div key={d.key} className="flex flex-col gap-1">
                      <label className="text-muted-foreground text-xs font-medium">{d.label}</label>
                      <Input type="number" min="0" defaultValue="0" className="text-center" />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
                <span className="text-lg font-semibold">Calculated Total</span>
                <span className="text-2xl font-bold text-green-600">Rs. 0.00</span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea placeholder="Any observations about the collection..." rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Save Draft</Button>
              <Button>
                <CheckCircle2 />
                Submit for Verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <IndianRupee className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">This Month</p>
                <p className="text-xl font-bold">Rs. 1,46,080</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                <IndianRupee className="text-muted-foreground size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Avg per Friday</p>
                <p className="text-xl font-bold">Rs. 45,296</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                <Users className="text-muted-foreground size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Sessions</p>
                <p className="text-xl font-bold">52</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                <CheckCircle2 className="text-muted-foreground size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Reconciled</p>
                <p className="text-xl font-bold">50 / 52</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection History */}
      <Card>
        <CardHeader>
          <CardTitle>Collection History</CardTitle>
          <CardDescription>
            All Friday collection batches with verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Counter 1</TableHead>
                  <TableHead>Counter 2</TableHead>
                  <TableHead>Deposit Ref</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.id}</TableCell>
                    <TableCell>
                      {new Date(c.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-sm">{c.counter1}</TableCell>
                    <TableCell className="text-sm">{c.counter2}</TableCell>
                    <TableCell className="font-mono text-muted-foreground text-sm">{c.deposit}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[c.status]}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      Rs. {c.total.toLocaleString("en-IN")}
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
