"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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

const schemes = [
  { name: "Medical Aid", active: 12, disbursed: 245000, icon: "🏥" },
  { name: "Education Scholarship", active: 28, disbursed: 420000, icon: "🎓" },
  { name: "Marriage Assistance", active: 5, disbursed: 150000, icon: "💍" },
  { name: "Orphan Sponsorship", active: 18, disbursed: 324000, icon: "👶" },
  { name: "Widow Pension", active: 15, disbursed: 270000, icon: "🤝" },
  { name: "Housing Support", active: 3, disbursed: 450000, icon: "🏠" },
  { name: "Livelihood Support", active: 8, disbursed: 120000, icon: "💼" },
  { name: "Gulf Returnee", active: 4, disbursed: 80000, icon: "✈️" },
  { name: "Emergency Relief", active: 2, disbursed: 95000, icon: "🚨" },
];

const applications = [
  { id: "WA-001", applicant: "Fathima Beevi", house: "MH-023", scheme: "Widow Pension", amount: 5000, status: "disbursed", date: "2025-03-15" },
  { id: "WA-002", applicant: "Mohammed Ali", house: "MH-045", scheme: "Medical Aid", amount: 25000, status: "approved", date: "2025-03-12" },
  { id: "WA-003", applicant: "Rashid K", house: "MH-102", scheme: "Gulf Returnee", amount: 15000, status: "investigation", date: "2025-03-10" },
  { id: "WA-004", applicant: "Safiya M", house: "MH-067", scheme: "Education Scholarship", amount: 12000, status: "submitted", date: "2025-03-08" },
  { id: "WA-005", applicant: "Ibrahim P", house: "MH-089", scheme: "Housing Support", amount: 100000, status: "recommended", date: "2025-03-05" },
  { id: "WA-006", applicant: "Ayisha K", house: "MH-034", scheme: "Orphan Sponsorship", amount: 3000, status: "disbursed", date: "2025-03-01" },
];

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  submitted: "outline", under_review: "secondary", investigation: "secondary",
  recommended: "secondary", approved: "default", disbursed: "default", rejected: "destructive",
};

export default function WelfarePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welfare</h1>
          <p className="text-muted-foreground">Community welfare schemes and applications</p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}><Plus /> New Application</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Welfare Application</DialogTitle>
              <DialogDescription>Submit a welfare scheme application</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Scheme</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger>
                  <SelectContent>
                    {schemes.map(s => <SelectItem key={s.name} value={s.name.toLowerCase().replace(/ /g, "_")}>{s.icon} {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Applicant Name</label>
                  <Input placeholder="Full name" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Household</label>
                  <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="mh001">MH-001 - Rahman</SelectItem></SelectContent></Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Amount Requested (Rs.)</label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Description & Reason</label>
                <Textarea placeholder="Explain the need and circumstances..." rows={3} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Supporting Documents</label>
                <Input type="file" accept="image/*,.pdf" multiple />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button><FileCheck /> Submit Application</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30"><Heart className="size-5 text-pink-600" /></div>
            <div><p className="text-muted-foreground text-sm">Active Beneficiaries</p><p className="text-2xl font-bold">95</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30"><IndianRupee className="size-5 text-green-600" /></div>
            <div><p className="text-muted-foreground text-sm">Disbursed (FY)</p><p className="text-2xl font-bold">Rs. 21,54,000</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Users className="text-muted-foreground size-5" /></div>
            <div><p className="text-muted-foreground text-sm">Pending Review</p><p className="text-2xl font-bold">8</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Heart className="text-muted-foreground size-5" /></div>
            <div><p className="text-muted-foreground text-sm">Schemes Active</p><p className="text-2xl font-bold">9</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Scheme Cards */}
      <Card>
        <CardHeader><CardTitle>Welfare Schemes</CardTitle><CardDescription>All 9 community support programs</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {schemes.map(s => (
              <div key={s.name} className="flex items-center gap-3 rounded-lg border p-3">
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-muted-foreground text-xs">{s.active} active | Rs. {(s.disbursed/1000).toFixed(0)}k disbursed</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
              <Input placeholder="Search applications..." className="pl-9" />
            </div>
            <Select defaultValue="all"><SelectTrigger className="w-[180px]"><SelectValue placeholder="Scheme" /></SelectTrigger><SelectContent><SelectItem value="all">All Schemes</SelectItem>{schemes.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader><TableRow>
                <TableHead>ID</TableHead><TableHead>Applicant</TableHead><TableHead>House</TableHead><TableHead>Scheme</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {applications.map(a => (
                  <TableRow key={a.id} className="cursor-pointer">
                    <TableCell className="font-mono text-sm">{a.id}</TableCell>
                    <TableCell className="font-medium">{a.applicant}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{a.house}</TableCell>
                    <TableCell><Badge variant="outline">{a.scheme}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(a.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</TableCell>
                    <TableCell><Badge variant={statusColors[a.status]}>{a.status}</Badge></TableCell>
                    <TableCell className="text-right font-medium">Rs. {a.amount.toLocaleString("en-IN")}</TableCell>
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
