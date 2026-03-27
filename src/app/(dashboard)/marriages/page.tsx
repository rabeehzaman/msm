"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Heart, FileText, Download } from "lucide-react";

const marriages = [
  { id: "NK-2025-008", bride: "Aisha K", groom: "Fahad Ali M", date: "2025-03-10", mehr: "Rs. 50,000 + 5g Gold", qazi: "Imam Yusuf Ali", status: "registered" },
  { id: "NK-2025-007", bride: "Safiya M", groom: "Rashid K", date: "2025-02-20", mehr: "Rs. 1,00,000", qazi: "Imam Yusuf Ali", status: "registered" },
  { id: "NK-2025-006", bride: "Mariyam N", groom: "Ibrahim P", date: "2025-01-15", mehr: "Rs. 75,000", qazi: "Qazi Abdul Kareem", status: "registered" },
  { id: "NK-2024-045", bride: "Fathima R", groom: "Najeeb K", date: "2024-12-20", mehr: "Rs. 50,000", qazi: "Imam Yusuf Ali", status: "registered" },
];

const nocs = [
  { id: "NOC-OUT-012", applicant: "Safiya M", house: "MH-067", type: "Outgoing", otherMahallu: "Kondotty Juma Masjid", status: "issued", date: "2025-02-15" },
  { id: "NOC-IN-008", applicant: "Aisha K", house: "MH-034", type: "Incoming", otherMahallu: "Perinthalmanna Mahallu", status: "issued", date: "2025-03-05" },
  { id: "NOC-OUT-013", applicant: "Haris Family", house: "MH-005", type: "Outgoing", otherMahallu: "Tirur Mahallu", status: "pending", date: "2025-03-22" },
];

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  application: "outline", under_review: "secondary", approved: "secondary", registered: "default", rejected: "destructive", pending: "outline", verified: "secondary", issued: "default",
};

export default function MarriagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marriages & Nikah</h1>
          <p className="text-muted-foreground">Marriage registration, NOC management, and Mehr tracking</p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}><Plus /> Register Nikah</DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Register Nikah</DialogTitle><DialogDescription>Enter complete marriage details</DialogDescription></DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <p className="text-sm font-semibold">Bride Details</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1"><label className="text-xs font-medium">Name</label><Input placeholder="Bride name" /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium">Father's Name</label><Input placeholder="Father" /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium">Date of Birth</label><Input type="date" /></div>
              </div>
              <Separator />
              <p className="text-sm font-semibold">Groom Details</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1"><label className="text-xs font-medium">Name</label><Input placeholder="Groom name" /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium">Father's Name</label><Input placeholder="Father" /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium">Occupation</label><Input placeholder="Occupation" /></div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1"><label className="text-xs font-medium">Wali (Guardian)</label><Input placeholder="Name & relation" /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium">Qazi / Officiant</label><Input placeholder="Qazi name" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1"><label className="text-xs font-medium">Witness 1</label><Input placeholder="Name" /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium">Witness 2</label><Input placeholder="Name" /></div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1"><label className="text-xs font-medium">Mehr (Immediate)</label><Input placeholder="Amount" /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium">Mehr (Deferred)</label><Input placeholder="Amount" /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium">Nikah Date</label><Input type="date" /></div>
              </div>
            </div>
            <DialogFooter><Button variant="outline">Cancel</Button><Button>Register & Generate Certificate</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Nikahs (FY)</p><p className="text-2xl font-bold">23</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">This Month</p><p className="text-2xl font-bold">2</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">NOCs Issued</p><p className="text-2xl font-bold">18</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Pending NOCs</p><p className="text-2xl font-bold text-yellow-600">1</p></CardContent></Card>
      </div>

      <Tabs defaultValue="marriages">
        <TabsList><TabsTrigger value="marriages">Nikah Register</TabsTrigger><TabsTrigger value="nocs">Marriage NOCs</TabsTrigger></TabsList>

        <TabsContent value="marriages">
          <Card>
            <CardHeader><CardTitle>Nikah Register</CardTitle><CardDescription>All registered marriages</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table><TableHeader><TableRow>
                  <TableHead>Certificate #</TableHead><TableHead>Bride</TableHead><TableHead>Groom</TableHead><TableHead>Date</TableHead><TableHead>Mehr</TableHead><TableHead>Qazi</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader><TableBody>
                  {marriages.map(m => (
                    <TableRow key={m.id}><TableCell className="font-mono text-sm">{m.id}</TableCell><TableCell className="font-medium">{m.bride}</TableCell><TableCell className="font-medium">{m.groom}</TableCell><TableCell className="text-muted-foreground text-sm">{new Date(m.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</TableCell><TableCell className="text-sm">{m.mehr}</TableCell><TableCell className="text-muted-foreground text-sm">{m.qazi}</TableCell><TableCell><Badge variant={statusColors[m.status]}>{m.status}</Badge></TableCell></TableRow>
                  ))}
                </TableBody></Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nocs">
          <Card>
            <CardHeader><CardTitle>Marriage NOCs</CardTitle><CardDescription>Incoming and outgoing No Objection Certificates</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table><TableHeader><TableRow>
                  <TableHead>NOC #</TableHead><TableHead>Applicant</TableHead><TableHead>House</TableHead><TableHead>Type</TableHead><TableHead>Other Mahallu</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader><TableBody>
                  {nocs.map(n => (
                    <TableRow key={n.id}><TableCell className="font-mono text-sm">{n.id}</TableCell><TableCell className="font-medium">{n.applicant}</TableCell><TableCell className="text-muted-foreground text-sm">{n.house}</TableCell><TableCell><Badge variant={n.type === "Outgoing" ? "secondary" : "outline"}>{n.type}</Badge></TableCell><TableCell className="text-sm">{n.otherMahallu}</TableCell><TableCell className="text-muted-foreground text-sm">{new Date(n.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</TableCell><TableCell><Badge variant={statusColors[n.status]}>{n.status}</Badge></TableCell></TableRow>
                  ))}
                </TableBody></Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
