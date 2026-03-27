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
import { Plus, IndianRupee, CheckCircle2 } from "lucide-react";
import { createFridayCollection } from "@/lib/actions/finance";
import { toast } from "sonner";

type FridayCollection = {
  id: string;
  date: string | null;
  totalAmount: string | null;
  status: string | null;
  notes: string | null;
};

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  open: "outline",
  counting: "secondary",
  pending_verification: "secondary",
  verified: "default",
  deposited: "default",
  reconciled: "default",
};

export function FridayCollectionsClient({
  collections,
}: {
  collections: FridayCollection[];
}) {
  const [open, setOpen] = useState(false);

  const totalThisMonth = collections
    .filter((c) => {
      if (!c.date) return false;
      const d = new Date(c.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, c) => sum + Number(c.totalAmount || 0), 0);

  const avgPerFriday = collections.length > 0
    ? collections.reduce((sum, c) => sum + Number(c.totalAmount || 0), 0) / collections.length
    : 0;

  async function handleCreate(formData: FormData) {
    try {
      await createFridayCollection(formData);
      toast.success("Friday collection recorded successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to record collection");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Friday Collections</h1>
          <p className="text-muted-foreground">
            Juma collection tracking and verification
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus />
            New Collection Batch
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Friday Collection Batch</DialogTitle>
              <DialogDescription>
                Record today&apos;s Juma collection
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreate}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Collection Date *</label>
                  <Input type="date" name="date" defaultValue={new Date().toISOString().split("T")[0]} required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Total Amount (Rs.) *</label>
                  <Input type="number" name="totalAmount" placeholder="0.00" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea name="notes" placeholder="Any observations about the collection..." rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">
                  <CheckCircle2 />
                  Submit Collection
                </Button>
              </DialogFooter>
            </form>
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
                <p className="text-xl font-bold">Rs. {totalThisMonth.toLocaleString("en-IN")}</p>
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
                <p className="text-xl font-bold">Rs. {Math.round(avgPerFriday).toLocaleString("en-IN")}</p>
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
                <p className="text-muted-foreground text-sm">Total Sessions</p>
                <p className="text-xl font-bold">{collections.length}</p>
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
                <p className="text-muted-foreground text-sm">Verified</p>
                <p className="text-xl font-bold">
                  {collections.filter((c) => c.status === "verified" || c.status === "reconciled" || c.status === "deposited").length} / {collections.length}
                </p>
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
          {collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No collections yet</p>
              <p className="text-muted-foreground text-sm">
                Record your first Friday collection to get started.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        {c.date ? new Date(c.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{c.notes || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[c.status || "open"] || "outline"}>{c.status || "open"}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        Rs. {Number(c.totalAmount || 0).toLocaleString("en-IN")}
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
