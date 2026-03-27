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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Download, Trash2 } from "lucide-react";
import { createHousehold, deleteHousehold } from "@/lib/actions/households";
import { toast } from "sonner";

type Household = {
  id: string;
  houseNumber: string;
  familyName: string;
  address: string | null;
  primaryPhone: string | null;
  membershipStatus: string;
  wardName: string | null;
  wardId: string | null;
  memberCount: number;
  headOfFamily: string;
};

type Ward = {
  id: string;
  name: string;
};

export function HouseholdsClient({
  households,
  stats,
  wards,
}: {
  households: Household[];
  stats: { total: number; active: number };
  wards: Ward[];
}) {
  const [search, setSearch] = useState("");
  const [wardFilter, setWardFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = households.filter((h) => {
    const matchesSearch =
      !search ||
      h.familyName.toLowerCase().includes(search.toLowerCase()) ||
      h.houseNumber.toLowerCase().includes(search.toLowerCase()) ||
      (h.primaryPhone && h.primaryPhone.includes(search)) ||
      h.headOfFamily.toLowerCase().includes(search.toLowerCase());
    const matchesWard = wardFilter === "all" || h.wardId === wardFilter;
    return matchesSearch && matchesWard;
  });

  async function handleCreate(formData: FormData) {
    try {
      await createHousehold(formData);
      toast.success("Household added successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to add household");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete household "${name}"? This will also delete all members.`)) return;
    try {
      await deleteHousehold(id);
      toast.success("Household deleted");
    } catch {
      toast.error("Failed to delete household");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Households</h1>
          <p className="text-muted-foreground">Manage all registered families in the Mahallu</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus /> Add Household
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Household</DialogTitle>
              <DialogDescription>Register a new family in the Mahallu</DialogDescription>
            </DialogHeader>
            <form action={handleCreate}>
              <div className="flex flex-col gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="houseNumber" className="text-sm font-medium">House Number *</label>
                    <Input id="houseNumber" name="houseNumber" placeholder="e.g. MH-001" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="familyName" className="text-sm font-medium">Family Name *</label>
                    <Input id="familyName" name="familyName" placeholder="e.g. Rahman" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="wardId" className="text-sm font-medium">Ward</label>
                    <Select name="wardId">
                      <SelectTrigger id="wardId"><SelectValue placeholder="Select ward" /></SelectTrigger>
                      <SelectContent>
                        {wards.map((w) => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="primaryPhone" className="text-sm font-medium">Primary Phone</label>
                    <Input id="primaryPhone" name="primaryPhone" placeholder="+91 94567 12345" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="address" className="text-sm font-medium">Address</label>
                  <Input id="address" name="address" placeholder="Full address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="locality" className="text-sm font-medium">Locality</label>
                    <Input id="locality" name="locality" placeholder="Area / locality" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="pincode" className="text-sm font-medium">Pincode</label>
                    <Input id="pincode" name="pincode" placeholder="676102" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                  <Textarea id="notes" name="notes" placeholder="Any additional notes..." rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit"><Plus /> Add Household</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Households</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Active</p><p className="text-2xl font-bold">{stats.active}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Wards</p><p className="text-2xl font-bold">{wards.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Showing</p><p className="text-2xl font-bold">{filtered.length}</p></CardContent></Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle>Household Directory</CardTitle><CardDescription>Browse and manage all registered households</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search by name, house number, or phone..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={wardFilter} onValueChange={(v) => setWardFilter(v ?? "all")}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Ward" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {wards.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No households found</p>
              <p className="text-muted-foreground text-sm">
                {stats.total === 0 ? "Add your first household to get started." : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>House #</TableHead>
                    <TableHead>Family Name</TableHead>
                    <TableHead>Head of Family</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead className="text-center">Members</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.houseNumber}</TableCell>
                      <TableCell className="font-semibold">{h.familyName}</TableCell>
                      <TableCell>{h.headOfFamily}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{h.wardName ?? "-"}</TableCell>
                      <TableCell className="text-center">{h.memberCount}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{h.primaryPhone ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant={h.membershipStatus === "active" ? "default" : "secondary"}>
                          {h.membershipStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(h.id, h.familyName)}
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
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
