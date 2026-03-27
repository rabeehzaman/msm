"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, Search } from "lucide-react";
import { registerMarriage } from "@/lib/actions/lifecycle";
import { toast } from "sonner";

type Marriage = {
  id: string;
  brideName: string;
  groomName: string;
  nikahDate: string | null;
  mehrAmount: string | null;
  qaziName: string | null;
  certificateNumber: string | null;
  status: string | null;
};

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  registered: "default", pending: "outline", approved: "secondary", rejected: "destructive",
};

export function MarriagesClient({
  marriages,
}: {
  marriages: Marriage[];
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = marriages.filter((m) => {
    return !search ||
      m.brideName.toLowerCase().includes(search.toLowerCase()) ||
      m.groomName.toLowerCase().includes(search.toLowerCase()) ||
      (m.certificateNumber && m.certificateNumber.toLowerCase().includes(search.toLowerCase()));
  });

  async function handleCreate(formData: FormData) {
    try {
      await registerMarriage(formData);
      toast.success("Nikah registered successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to register nikah");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marriages & Nikah</h1>
          <p className="text-muted-foreground">Marriage registration and Mehr tracking</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}><Plus /> Register Nikah</DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Register Nikah</DialogTitle><DialogDescription>Enter complete marriage details</DialogDescription></DialogHeader>
            <form action={handleCreate}>
              <div className="flex flex-col gap-4 py-4">
                <p className="text-sm font-semibold">Bride Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium">Bride Name *</label><Input name="brideName" placeholder="Bride name" required /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium">Bride Father&apos;s Name</label><Input name="brideFatherName" placeholder="Father" /></div>
                </div>
                <Separator />
                <p className="text-sm font-semibold">Groom Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium">Groom Name *</label><Input name="groomName" placeholder="Groom name" required /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium">Groom Father&apos;s Name</label><Input name="groomFatherName" placeholder="Father" /></div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium">Wali (Guardian)</label><Input name="waliName" placeholder="Name & relation" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium">Qazi / Officiant</label><Input name="qaziName" placeholder="Qazi name" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium">Witness 1</label><Input name="witness1Name" placeholder="Name" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium">Witness 2</label><Input name="witness2Name" placeholder="Name" /></div>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium">Mehr (Immediate)</label><Input name="mehrAmount" placeholder="Amount" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium">Mehr (Deferred)</label><Input name="mehrDeferred" placeholder="Amount" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium">Nikah Date</label><Input type="date" name="nikahDate" /></div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Register & Generate Certificate</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Nikahs</p><p className="text-2xl font-bold">{marriages.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Registered</p><p className="text-2xl font-bold">{marriages.filter(m => m.status === "registered").length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">With Certificates</p><p className="text-2xl font-bold">{marriages.filter(m => m.certificateNumber).length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Showing</p><p className="text-2xl font-bold">{filtered.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Nikah Register</CardTitle><CardDescription>All registered marriages</CardDescription></CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input placeholder="Search by name or certificate number..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No marriages registered yet</p>
              <p className="text-muted-foreground text-sm">{marriages.length === 0 ? "Register your first nikah to get started." : "Try adjusting your search."}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table><TableHeader><TableRow>
                <TableHead>Certificate #</TableHead><TableHead>Bride</TableHead><TableHead>Groom</TableHead><TableHead>Date</TableHead><TableHead>Mehr</TableHead><TableHead>Qazi</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader><TableBody>
                {filtered.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-sm">{m.certificateNumber || "-"}</TableCell>
                    <TableCell className="font-medium">{m.brideName}</TableCell>
                    <TableCell className="font-medium">{m.groomName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{m.nikahDate ? new Date(m.nikahDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</TableCell>
                    <TableCell className="text-sm">{m.mehrAmount || "-"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{m.qaziName || "-"}</TableCell>
                    <TableCell><Badge variant={statusColors[m.status || "registered"] || "default"}>{m.status || "registered"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody></Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
