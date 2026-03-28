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
import { Progress } from "@/components/ui/progress";
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
  Bell,
  CreditCard,
  Loader2,
} from "lucide-react";
import { createSubscription } from "@/lib/actions/finance";
import { toast } from "sonner";

type Subscription = {
  id: string;
  householdId: string | null;
  planName: string | null;
  amount: string;
  frequency: string | null;
  startDate: string | null;
  nextDueDate: string | null;
  status: string | null;
};

export function SubscriptionsClient({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = subscriptions.filter((s) => {
    const matchesSearch =
      !search ||
      (s.planName && s.planName.toLowerCase().includes(search.toLowerCase())) ||
      (s.householdId && s.householdId.includes(search));
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalExpected = subscriptions.reduce((sum, s) => sum + Number(s.amount), 0);
  const activeCount = subscriptions.filter((s) => s.status === "active").length;

  async function handleCreate(formData: FormData) {
    setLoading(true);
    try {
      await createSubscription(formData);
      toast.success("Subscription created successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to create subscription");
    } finally {
      setLoading(false);
    }
  }

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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
              <CreditCard />
              New Subscription
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Subscription</DialogTitle>
                <DialogDescription>
                  Set up a new subscription plan for a household
                </DialogDescription>
              </DialogHeader>
              <form action={handleCreate}>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Household ID *</label>
                    <Input name="householdId" placeholder="Household ID" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Plan Name *</label>
                    <Input name="planName" placeholder="e.g. Standard, NRI, Senior" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Amount *</label>
                      <Input type="number" name="amount" placeholder="0.00" required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Frequency</label>
                      <Select name="frequency" defaultValue="monthly">
                        <SelectTrigger>
                          <SelectValue placeholder="Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Start Date *</label>
                      <Input type="date" name="startDate" defaultValue={new Date().toISOString().split("T")[0]} required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Next Due Date *</label>
                      <Input type="date" name="nextDueDate" required />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading}>{loading ? <Loader2 className="size-4 animate-spin" /> : <CreditCard />} {loading ? "Saving..." : "Create Subscription"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Subscriptions</p>
            <p className="text-2xl font-bold">{subscriptions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Active</p>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Expected (per cycle)</p>
            <p className="text-2xl font-bold">Rs. {totalExpected.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Showing</p>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Ledger */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription Ledger</CardTitle>
              <CardDescription>All household subscriptions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search subscriptions..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No subscriptions found</p>
              <p className="text-muted-foreground text-sm">
                {subscriptions.length === 0 ? "Create your first subscription to get started." : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.planName || "-"}</TableCell>
                      <TableCell>Rs. {Number(sub.amount).toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-muted-foreground text-sm capitalize">{sub.frequency || "monthly"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {sub.startDate ? new Date(sub.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {sub.nextDueDate ? new Date(sub.nextDueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                          {sub.status || "active"}
                        </Badge>
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
