import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Phone, Droplets, AlertCircle } from "lucide-react";

const donors = [
  { id: "1", name: "Abdul Rahman K", ward: "Ward 1", bloodGroup: "O+", phone: "+91 94567 12345", lastDonation: "2025-01-15", available: true },
  { id: "2", name: "Mohammed Basheer", ward: "Ward 1", bloodGroup: "A+", phone: "+91 98765 43210", lastDonation: "2024-11-20", available: true },
  { id: "3", name: "Haris P K", ward: "Ward 3", bloodGroup: "A-", phone: "+91 94561 78901", lastDonation: "2025-02-10", available: true },
  { id: "4", name: "Rashid Ali K", ward: "Ward 1", bloodGroup: "O+", phone: "+91 55123 45678", lastDonation: null, available: false },
  { id: "5", name: "Kunju Mohammed P", ward: "Ward 2", bloodGroup: "AB+", phone: "+91 90123 45678", lastDonation: "2024-09-05", available: true },
  { id: "6", name: "Aslam K M", ward: "Ward 3", bloodGroup: "B+", phone: "+91 90876 54321", lastDonation: "2025-03-01", available: true },
  { id: "7", name: "Faizal P", ward: "Ward 5", bloodGroup: "O-", phone: "+91 94567 89012", lastDonation: "2024-12-15", available: true },
  { id: "8", name: "Ibrahim Ali", ward: "Ward 6", bloodGroup: "B-", phone: "+91 90234 56789", lastDonation: null, available: true },
  { id: "9", name: "Siddique M", ward: "Ward 7", bloodGroup: "A+", phone: "+91 87654 32109", lastDonation: "2025-01-28", available: true },
  { id: "10", name: "Ashraf K", ward: "Ward 8", bloodGroup: "AB-", phone: "+91 94567 34567", lastDonation: "2024-10-12", available: true },
];

const bloodGroupCounts: Record<string, number> = {};
donors.forEach(d => { bloodGroupCounts[d.bloodGroup] = (bloodGroupCounts[d.bloodGroup] || 0) + 1; });

function getInitials(name: string) { return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase(); }

export default function BloodDonorsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blood Donor Directory</h1>
          <p className="text-muted-foreground">Find and alert compatible donors during emergencies</p>
        </div>
        <Button variant="destructive"><AlertCircle /> Emergency Alert</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Donors</p><p className="text-2xl font-bold">1,245</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Available Now</p><p className="text-2xl font-bold text-green-600">1,089</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Donations This Year</p><p className="text-2xl font-bold">156</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Rare Groups (O-, AB-)</p><p className="text-2xl font-bold text-orange-500">48</p></CardContent></Card>
      </div>

      {/* Blood Group Grid */}
      <Card>
        <CardHeader><CardTitle>Blood Group Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
              <div key={bg} className="flex flex-col items-center gap-1 rounded-lg border p-4">
                <Droplets className="size-5 text-red-500" />
                <span className="text-lg font-bold">{bg}</span>
                <span className="text-muted-foreground text-xs">{bloodGroupCounts[bg] || 0} donors</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Donor List */}
      <Card>
        <CardHeader><CardTitle>Donor Registry</CardTitle><CardDescription>Search and contact blood donors</CardDescription></CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1"><Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" /><Input placeholder="Search donors..." className="pl-9" /></div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Blood Group" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {donors.map(d => (
              <div key={d.id} className="flex items-center gap-4 rounded-lg border p-4">
                <Avatar className="size-10"><AvatarFallback className="text-xs">{getInitials(d.name)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{d.name}</span>
                    <Badge variant={d.available ? "default" : "secondary"}>{d.available ? "Available" : "Unavailable"}</Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">{d.ward} | Last: {d.lastDonation ? new Date(d.lastDonation).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Never"}</p>
                </div>
                <Badge variant="outline" className="font-mono text-sm font-bold">{d.bloodGroup}</Badge>
                <Button variant="ghost" size="sm"><Phone className="size-4" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
