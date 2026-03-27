"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Trash2 } from "lucide-react";
import { createMember, deleteMember } from "@/lib/actions/members";
import { toast } from "sonner";

type Member = {
  id: string;
  fullName: string;
  gender: string | null;
  dateOfBirth: string | null;
  phone: string | null;
  bloodGroup: string | null;
  occupation: string | null;
  status: string;
  relationshipToHead: string;
  isHeadOfHousehold: boolean | null;
  householdId: string;
  houseNumber: string | null;
  familyName: string | null;
};

type Household = {
  id: string;
  houseNumber: string;
  familyName: string;
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function calculateAge(dob: string | null) {
  if (!dob) return "-";
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export function MembersClient({
  members,
  stats,
  households,
}: {
  members: Member[];
  stats: { total: number };
  households: Household[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = members.filter((m) => {
    const matchesSearch =
      !search ||
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (m.phone && m.phone.includes(search)) ||
      (m.houseNumber && m.houseNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleCreate(formData: FormData) {
    try {
      await createMember(formData);
      toast.success("Member added successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to add member");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete member "${name}"?`)) return;
    try {
      await deleteMember(id);
      toast.success("Member deleted");
    } catch {
      toast.error("Failed to delete member");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">View and manage all community members</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}><Plus /> Add Member</DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>Add a member to a household</DialogDescription>
            </DialogHeader>
            <form action={handleCreate}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="householdId" className="text-sm font-medium">Household *</label>
                  <Select name="householdId" required>
                    <SelectTrigger id="householdId"><SelectValue placeholder="Select household" /></SelectTrigger>
                    <SelectContent>
                      {households.map((h) => (
                        <SelectItem key={h.id} value={h.id}>{h.houseNumber} - {h.familyName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="fullName" className="text-sm font-medium">Full Name *</label>
                    <Input id="fullName" name="fullName" placeholder="Full name" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="gender" className="text-sm font-medium">Gender</label>
                    <Select name="gender">
                      <SelectTrigger id="gender"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</label>
                    <Input id="dateOfBirth" name="dateOfBirth" type="date" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                    <Input id="phone" name="phone" placeholder="+91..." />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="bloodGroup" className="text-sm font-medium">Blood Group</label>
                    <Select name="bloodGroup">
                      <SelectTrigger id="bloodGroup"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(bg => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="relationshipToHead" className="text-sm font-medium">Relationship to Head</label>
                    <Select name="relationshipToHead" defaultValue="head">
                      <SelectTrigger id="relationshipToHead"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["head","spouse","son","daughter","father","mother","brother","sister","other"].map(r => (
                          <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="occupation" className="text-sm font-medium">Occupation</label>
                    <Input id="occupation" name="occupation" placeholder="Occupation" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit"><Plus /> Add Member</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Members</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Households</p><p className="text-2xl font-bold">{households.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Showing</p><p className="text-2xl font-bold">{filtered.length}</p></CardContent></Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Member Directory</CardTitle>
          <CardDescription>Complete list of all registered members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input placeholder="Search by name, phone, or house number..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="nri">NRI</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="deceased">Deceased</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No members found</p>
              <p className="text-muted-foreground text-sm">
                {stats.total === 0 ? "Add households first, then add members." : "Try adjusting your search."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Household</TableHead>
                    <TableHead>Relation</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Blood</TableHead>
                    <TableHead>Occupation</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8"><AvatarFallback className="text-xs">{getInitials(m.fullName)}</AvatarFallback></Avatar>
                          <div>
                            <p className="font-medium">{m.fullName}</p>
                            <p className="text-muted-foreground text-xs">{m.gender ?? ""}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{m.houseNumber} - {m.familyName}</TableCell>
                      <TableCell className="text-sm capitalize">{m.relationshipToHead}</TableCell>
                      <TableCell className="text-sm">{calculateAge(m.dateOfBirth)}</TableCell>
                      <TableCell>{m.bloodGroup ? <Badge variant="outline" className="font-mono text-xs">{m.bloodGroup}</Badge> : "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{m.occupation ?? "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{m.phone ?? "-"}</TableCell>
                      <TableCell><Badge variant={m.status === "active" ? "default" : "secondary"}>{m.status}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id, m.fullName)}>
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
