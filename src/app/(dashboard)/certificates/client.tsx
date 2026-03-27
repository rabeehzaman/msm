"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { issueCertificate } from "@/lib/actions/lifecycle";
import { toast } from "sonner";

type Certificate = {
  id: string;
  type: string;
  serialNumber: string | null;
  memberName: string | null;
  purpose: string | null;
  status: string | null;
  createdAt: Date | null;
};

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  requested: "outline", under_review: "secondary", dues_check: "secondary",
  generated: "secondary", signed: "default", delivered: "default", rejected: "destructive",
};

const certificateTypes = [
  "nikah_certificate", "death_certificate", "character_certificate",
  "noc", "transfer_certificate", "membership_certificate",
  "madrasa_completion", "hifz_completion", "clearance_certificate",
];

export function CertificatesClient({
  certificates,
}: {
  certificates: Certificate[];
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = certificates.filter((c) => {
    const matchesSearch =
      !search ||
      (c.memberName && c.memberName.toLowerCase().includes(search.toLowerCase())) ||
      (c.serialNumber && c.serialNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "all" || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const pendingCount = certificates.filter(c => c.status === "requested" || c.status === "under_review").length;

  async function handleCreate(formData: FormData) {
    try {
      await issueCertificate(formData);
      toast.success("Certificate request submitted");
      setOpen(false);
    } catch {
      toast.error("Failed to submit certificate request");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground">Issue and manage community certificates</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}><Plus /> New Certificate Request</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Certificate Request</DialogTitle>
              <DialogDescription>Submit a certificate request</DialogDescription>
            </DialogHeader>
            <form action={handleCreate}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Certificate Type *</label>
                  <Select name="type" required>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {certificateTypes.map(t => (
                        <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Member Name *</label>
                  <Input name="memberName" placeholder="Full name" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Purpose</label>
                  <Input name="purpose" placeholder="Purpose of the certificate" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Issued</p><p className="text-2xl font-bold">{certificates.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Pending</p><p className="text-2xl font-bold text-yellow-600">{pendingCount}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Delivered</p><p className="text-2xl font-bold">{certificates.filter(c => c.status === "delivered").length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Showing</p><p className="text-2xl font-bold">{filtered.length}</p></CardContent></Card>
      </div>

      {/* Register Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Certificate Register</CardTitle><CardDescription>All certificate requests and issuances</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input placeholder="Search by name, serial number..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {certificateTypes.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No certificates found</p>
              <p className="text-muted-foreground text-sm">{certificates.length === 0 ? "Submit your first certificate request." : "Try adjusting your search."}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Serial #</TableHead><TableHead>Type</TableHead><TableHead>Member</TableHead><TableHead>Purpose</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-sm">{c.serialNumber || "-"}</TableCell>
                      <TableCell><Badge variant="outline">{c.type.replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell className="font-medium">{c.memberName || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{c.purpose || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-"}</TableCell>
                      <TableCell><Badge variant={statusColors[c.status || "requested"] || "outline"}>{(c.status || "requested").replace(/_/g, " ")}</Badge></TableCell>
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
