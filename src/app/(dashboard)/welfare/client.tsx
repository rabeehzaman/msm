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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Heart, Users, IndianRupee, FileCheck } from "lucide-react";
import { submitWelfareApplication } from "@/lib/actions/lifecycle";
import { toast } from "sonner";

type WelfareApplication = {
  id: string;
  applicantName: string;
  scheme: string | null;
  amountRequested: string | null;
  description: string | null;
  status: string | null;
  createdAt: Date | null;
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  submitted: "outline", under_review: "secondary", investigation: "secondary",
  recommended: "secondary", approved: "default", disbursed: "default", rejected: "destructive",
};

const schemes = [
  "medical_aid", "education_scholarship", "marriage_assistance",
  "orphan_sponsorship", "widow_pension", "housing_support",
  "livelihood_support", "gulf_returnee", "emergency_relief",
];

export function WelfareClient({
  applications,
}: {
  applications: WelfareApplication[];
}) {
  const [search, setSearch] = useState("");
  const [schemeFilter, setSchemeFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = applications.filter((a) => {
    const matchesSearch =
      !search ||
      a.applicantName.toLowerCase().includes(search.toLowerCase());
    const matchesScheme = schemeFilter === "all" || a.scheme === schemeFilter;
    return matchesSearch && matchesScheme;
  });

  const totalAmount = applications.reduce((s, a) => s + Number(a.amountRequested || 0), 0);
  const pendingCount = applications.filter(a => a.status === "submitted" || a.status === "under_review").length;

  async function handleCreate(formData: FormData) {
    try {
      await submitWelfareApplication(formData);
      toast.success("Welfare application submitted");
      setOpen(false);
    } catch {
      toast.error("Failed to submit application");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welfare</h1>
          <p className="text-muted-foreground">Community welfare schemes and applications</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}><Plus /> New Application</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Welfare Application</DialogTitle>
              <DialogDescription>Submit a welfare scheme application</DialogDescription>
            </DialogHeader>
            <form action={handleCreate}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Scheme *</label>
                  <Select name="scheme" required>
                    <SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger>
                    <SelectContent>
                      {schemes.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Applicant Name *</label>
                  <Input name="applicantName" placeholder="Full name" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Amount Requested (Rs.)</label>
                  <Input type="number" name="amountRequested" placeholder="0" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Description & Reason</label>
                  <Textarea name="description" placeholder="Explain the need and circumstances..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit"><FileCheck /> Submit Application</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30"><Heart className="size-5 text-pink-600" /></div>
            <div><p className="text-muted-foreground text-sm">Total Applications</p><p className="text-2xl font-bold">{applications.length}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30"><IndianRupee className="size-5 text-green-600" /></div>
            <div><p className="text-muted-foreground text-sm">Total Requested</p><p className="text-2xl font-bold">Rs. {totalAmount.toLocaleString("en-IN")}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Users className="text-muted-foreground size-5" /></div>
            <div><p className="text-muted-foreground text-sm">Pending Review</p><p className="text-2xl font-bold">{pendingCount}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Heart className="text-muted-foreground size-5" /></div>
            <div><p className="text-muted-foreground text-sm">Disbursed</p><p className="text-2xl font-bold">{applications.filter(a => a.status === "disbursed").length}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Applications</CardTitle><CardDescription>All welfare applications</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input placeholder="Search applications..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={schemeFilter} onValueChange={(v) => setSchemeFilter(v ?? "all")}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Scheme" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schemes</SelectItem>
                {schemes.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No applications found</p>
              <p className="text-muted-foreground text-sm">{applications.length === 0 ? "Submit your first welfare application." : "Try adjusting your search."}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Applicant</TableHead><TableHead>Scheme</TableHead><TableHead>Description</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.applicantName}</TableCell>
                      <TableCell><Badge variant="outline">{(a.scheme || "").replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">{a.description || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-"}</TableCell>
                      <TableCell><Badge variant={statusColors[a.status || "submitted"] || "outline"}>{(a.status || "submitted").replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell className="text-right font-medium">Rs. {Number(a.amountRequested || 0).toLocaleString("en-IN")}</TableCell>
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
