"use client";

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
import { Plus, Search, Download, FileText, CheckCircle2, Clock } from "lucide-react";

const certificateTypes = [
  { type: "Nikah Certificate", count: 23, icon: "💍" },
  { type: "Death Certificate", count: 8, icon: "📜" },
  { type: "Character Certificate", count: 45, icon: "📝" },
  { type: "NOC", count: 18, icon: "✅" },
  { type: "Transfer Certificate", count: 6, icon: "🔄" },
  { type: "Membership Certificate", count: 34, icon: "🪪" },
  { type: "Madrasa Completion", count: 52, icon: "🎓" },
  { type: "Hifz Completion", count: 3, icon: "📖" },
  { type: "Clearance Certificate", count: 15, icon: "✔️" },
];

const certificates = [
  { id: "CERT-2024-234", type: "Character Certificate", member: "Rashid Ali K", house: "MH-001", requestDate: "2025-03-20", status: "delivered", serial: "CC-2025-045" },
  { id: "CERT-2024-233", type: "NOC", member: "Safiya M", house: "MH-067", requestDate: "2025-03-18", status: "signed", serial: "NOC-2025-012" },
  { id: "CERT-2024-232", type: "Membership Certificate", member: "Haris P K", house: "MH-005", requestDate: "2025-03-15", status: "generated", serial: "MC-2025-034" },
  { id: "CERT-2024-231", type: "Nikah Certificate", member: "Aisha K", house: "MH-034", requestDate: "2025-03-12", status: "delivered", serial: "NK-2025-008" },
  { id: "CERT-2024-230", type: "Clearance Certificate", member: "Mohammed Ali", house: "MH-045", requestDate: "2025-03-10", status: "dues_check", serial: "-" },
  { id: "CERT-2024-229", type: "Madrasa Completion", member: "Fahad M", house: "MH-007", requestDate: "2025-03-08", status: "delivered", serial: "MDC-2025-015" },
  { id: "CERT-2024-228", type: "Transfer Certificate", member: "Siddique Ali", house: "MH-004", requestDate: "2025-03-05", status: "under_review", serial: "-" },
  { id: "CERT-2024-227", type: "Death Certificate", member: "Late Kunju Haji", house: "MH-012", requestDate: "2025-03-01", status: "delivered", serial: "DC-2025-003" },
];

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  requested: "outline", under_review: "secondary", dues_check: "secondary",
  generated: "secondary", signed: "default", delivered: "default", rejected: "destructive",
};

export default function CertificatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground">Issue and manage 11 types of community certificates</p>
        </div>
        <Button><Plus /> New Certificate Request</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Issued (FY)</p><p className="text-2xl font-bold">204</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Pending</p><p className="text-2xl font-bold text-yellow-600">7</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">This Month</p><p className="text-2xl font-bold">18</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Avg. Processing</p><p className="text-2xl font-bold">2.3 days</p></CardContent></Card>
      </div>

      {/* Certificate Types Grid */}
      <Card>
        <CardHeader><CardTitle>Certificate Types</CardTitle><CardDescription>Issued count for the current fiscal year</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
            {certificateTypes.map(ct => (
              <div key={ct.type} className="flex items-center gap-3 rounded-lg border p-3">
                <span className="text-xl">{ct.icon}</span>
                <div>
                  <p className="text-sm font-medium">{ct.type}</p>
                  <p className="text-muted-foreground text-xs">{ct.count} issued</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Register Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Certificate Register</CardTitle><CardDescription>All certificate requests and issuances</CardDescription></div>
            <Button variant="outline" size="sm"><Download className="size-4" /> Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input placeholder="Search by name, serial number..." className="pl-9" />
            </div>
            <Select defaultValue="all"><SelectTrigger className="w-[200px]"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{certificateTypes.map(ct => <SelectItem key={ct.type} value={ct.type}>{ct.type}</SelectItem>)}</SelectContent></Select>
            <Select defaultValue="all"><SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="delivered">Delivered</SelectItem></SelectContent></Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Request ID</TableHead><TableHead>Type</TableHead><TableHead>Member</TableHead><TableHead>House</TableHead><TableHead>Serial #</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {certificates.map(c => (
                  <TableRow key={c.id} className="cursor-pointer">
                    <TableCell className="font-mono text-sm">{c.id}</TableCell>
                    <TableCell><Badge variant="outline">{c.type}</Badge></TableCell>
                    <TableCell className="font-medium">{c.member}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{c.house}</TableCell>
                    <TableCell className="font-mono text-sm">{c.serial}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(c.requestDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</TableCell>
                    <TableCell><Badge variant={statusColors[c.status]}>{c.status === "dues_check" ? "Dues Check" : c.status.replace("_", " ")}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
