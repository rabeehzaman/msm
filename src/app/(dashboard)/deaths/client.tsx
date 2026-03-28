"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Search } from "lucide-react";
import { registerDeath } from "@/lib/actions/lifecycle";
import { toast } from "sonner";

type Death = {
  id: string;
  deceasedName: string;
  dateOfDeath: string | null;
  causeOfDeath: string | null;
  placeOfDeath: string | null;
  janazahTime: string | null;
  janazahLocation: string | null;
  certificateNumber: string | null;
  informerName: string | null;
};

export function DeathsClient({
  deaths,
}: {
  deaths: Death[];
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = deaths.filter((d) => {
    return !search ||
      d.deceasedName.toLowerCase().includes(search.toLowerCase()) ||
      (d.certificateNumber && d.certificateNumber.toLowerCase().includes(search.toLowerCase()));
  });

  async function handleCreate(formData: FormData) {
    setLoading(true);
    try {
      try {
        await registerDeath(formData);
        toast.success("Death registered and community notified");
        setOpen(false);
      } catch {
        toast.error("Failed to register death");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Death & Janazah</h1>
          <p className="text-muted-foreground">Death registration and funeral coordination</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}><Plus /> Register Death</DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Register Death</DialogTitle><DialogDescription>Register a death and coordinate Janazah</DialogDescription></DialogHeader>
            <form action={handleCreate}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2"><label className="text-sm font-medium">Deceased Name *</label><Input name="deceasedName" placeholder="Full name" required /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2"><label className="text-sm font-medium">Date of Death *</label><Input type="date" name="dateOfDeath" required /></div>
                  <div className="flex flex-col gap-2"><label className="text-sm font-medium">Time</label><Input type="time" name="timeOfDeath" /></div>
                  <div className="flex flex-col gap-2"><label className="text-sm font-medium">Place</label><Input name="placeOfDeath" placeholder="Hospital / Home" /></div>
                </div>
                <div className="flex flex-col gap-2"><label className="text-sm font-medium">Cause of Death</label><Input name="causeOfDeath" placeholder="Natural / Illness / etc." /></div>
                <Separator />
                <p className="text-sm font-semibold">Janazah Coordination</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2"><label className="text-sm font-medium">Janazah Time</label><Input type="time" name="janazahTime" /></div>
                  <div className="flex flex-col gap-2"><label className="text-sm font-medium">Location</label><Input name="janazahLocation" placeholder="Mosque / Cemetery" /></div>
                </div>
                <div className="flex flex-col gap-2"><label className="text-sm font-medium">Informer Name</label><Input name="informerName" placeholder="Name (Relation)" /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? <Loader2 className="size-4 animate-spin" /> : null} {loading ? "Saving..." : "Register & Notify Community"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Deaths</p><p className="text-2xl font-bold">{deaths.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">With Certificates</p><p className="text-2xl font-bold">{deaths.filter(d => d.certificateNumber).length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">With Janazah Info</p><p className="text-2xl font-bold">{deaths.filter(d => d.janazahTime).length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Showing</p><p className="text-2xl font-bold">{filtered.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Death Register</CardTitle><CardDescription>All registered deaths with funeral details</CardDescription></CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input placeholder="Search by name..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No deaths registered</p>
              <p className="text-muted-foreground text-sm">{deaths.length === 0 ? "No records yet." : "Try adjusting your search."}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table><TableHeader><TableRow>
                <TableHead>Certificate #</TableHead><TableHead>Name</TableHead><TableHead>Date</TableHead><TableHead>Cause</TableHead><TableHead>Janazah</TableHead><TableHead>Informer</TableHead>
              </TableRow></TableHeader><TableBody>
                {filtered.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-sm">{d.certificateNumber || "-"}</TableCell>
                    <TableCell className="font-medium">{d.deceasedName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{d.dateOfDeath ? new Date(d.dateOfDeath).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</TableCell>
                    <TableCell className="text-sm">{d.causeOfDeath || "-"}</TableCell>
                    <TableCell className="text-sm">{d.janazahTime && d.janazahLocation ? `${d.janazahTime} at ${d.janazahLocation}` : "-"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{d.informerName || "-"}</TableCell>
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
