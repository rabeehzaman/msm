"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, AlertCircle, Bell, IndianRupee } from "lucide-react";

const deaths = [
  { id: "D-2025-003", name: "Late Abdul Khader", age: 78, date: "2025-03-18", cause: "Natural", house: "MH-012", janazah: "Mar 18, 3:00 PM", burial: "Section A, Row 3, Plot 12", khairat: "Released", expense: 18500 },
  { id: "D-2025-002", name: "Late Kunju Haji", age: 85, date: "2025-02-10", cause: "Natural", house: "MH-089", janazah: "Feb 10, 4:30 PM", burial: "Section B, Row 1, Plot 5", khairat: "Released", expense: 15200 },
  { id: "D-2025-001", name: "Late Mohammed Kutty", age: 62, date: "2025-01-05", cause: "Cardiac", house: "MH-056", janazah: "Jan 5, 2:00 PM", burial: "Section A, Row 5, Plot 8", khairat: "Released", expense: 21000 },
  { id: "D-2024-012", name: "Late Fathima Haji", age: 90, date: "2024-12-15", cause: "Natural", house: "MH-034", janazah: "Dec 15, 3:30 PM", burial: "Section C, Row 2, Plot 3", khairat: "Released", expense: 14800 },
];

export default function DeathsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Death & Janazah</h1>
          <p className="text-muted-foreground">Death registration, funeral coordination, and Khairat fund</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive"><Bell /> Emergency Notify</Button>
          <Dialog>
            <DialogTrigger render={<Button />}><Plus /> Register Death</DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Register Death</DialogTitle><DialogDescription>This will update member status, trigger Khairat fund, and coordinate Janazah</DialogDescription></DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2"><label className="text-sm font-medium">Deceased Name</label><Input placeholder="Full name" /></div>
                  <div className="flex flex-col gap-2"><label className="text-sm font-medium">Household</label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="mh012">MH-012</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2"><label className="text-sm font-medium">Date of Death</label><Input type="date" /></div>
                  <div className="flex flex-col gap-2"><label className="text-sm font-medium">Time</label><Input type="time" /></div>
                  <div className="flex flex-col gap-2"><label className="text-sm font-medium">Place</label><Input placeholder="Hospital / Home" /></div>
                </div>
                <div className="flex flex-col gap-2"><label className="text-sm font-medium">Cause of Death</label><Input placeholder="Natural / Illness / etc." /></div>
                <Separator />
                <p className="text-sm font-semibold">Janazah Coordination</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2"><label className="text-sm font-medium">Janazah Time</label><Input type="time" /></div>
                  <div className="flex flex-col gap-2"><label className="text-sm font-medium">Location</label><Input placeholder="Mosque / Cemetery" /></div>
                </div>
                <div className="flex flex-col gap-2"><label className="text-sm font-medium">Informer Name & Relation</label><Input placeholder="Name (Relation)" /></div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Auto-triggered Actions</p>
                  <ul className="mt-1 text-xs text-red-700 dark:text-red-300 list-disc pl-4">
                    <li>Member status updated to &quot;Deceased&quot;</li>
                    <li>Khairat fund auto-released</li>
                    <li>Subscription billing stopped</li>
                    <li>Widow/orphan welfare flags activated</li>
                    <li>Community notification dispatched</li>
                  </ul>
                </div>
              </div>
              <DialogFooter><Button variant="outline">Cancel</Button><Button>Register & Notify Community</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Deaths (FY)</p><p className="text-2xl font-bold">8</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Khairat Fund Balance</p><p className="text-2xl font-bold">Rs. 1,25,000</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Funeral Expenses</p><p className="text-2xl font-bold">Rs. 69,500</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Cemetery Plots Available</p><p className="text-2xl font-bold">42</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Death Register</CardTitle><CardDescription>All registered deaths with funeral details</CardDescription></CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table><TableHeader><TableRow>
              <TableHead>Reg #</TableHead><TableHead>Name</TableHead><TableHead>Age</TableHead><TableHead>Date</TableHead><TableHead>House</TableHead><TableHead>Janazah</TableHead><TableHead>Burial Plot</TableHead><TableHead>Khairat</TableHead><TableHead className="text-right">Expense</TableHead>
            </TableRow></TableHeader><TableBody>
              {deaths.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-sm">{d.id}</TableCell>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.age}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{d.house}</TableCell>
                  <TableCell className="text-sm">{d.janazah}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{d.burial}</TableCell>
                  <TableCell><Badge variant="default">{d.khairat}</Badge></TableCell>
                  <TableCell className="text-right font-medium">Rs. {d.expense.toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
