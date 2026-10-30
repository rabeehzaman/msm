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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Phone, Droplets, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/format";

type Donor = {
  id: string;
  name: string;
  ward: string | null;
  bloodGroup: string;
  phone: string | null;
  lastDonation: string | null;
  available: boolean | null;
};

function getInitials(name: string) { return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase(); }

export function BloodDonorsClient({ donors }: { donors: Donor[] }) {
  const bloodGroupCounts: Record<string, number> = {};
  donors.forEach(d => { bloodGroupCounts[d.bloodGroup] = (bloodGroupCounts[d.bloodGroup] || 0) + 1; });
  const availableCount = donors.filter(d => d.available).length;
  const thisYear = String(new Date().getFullYear());
  const donationsThisYear = donors.filter(d => d.lastDonation?.startsWith(thisYear)).length;
  const rareCount = (bloodGroupCounts["O-"] || 0) + (bloodGroupCounts["AB-"] || 0);

  const [search, setSearch] = useState("");
  const [bloodGroup, setBloodGroup] = useState("all");
  const normalizedSearch = search.trim().toLowerCase();
  const filteredDonors = donors.filter((donor) => {
    const matchesSearch =
      !normalizedSearch ||
      donor.name.toLowerCase().includes(normalizedSearch) ||
      (donor.ward ?? "").toLowerCase().includes(normalizedSearch) ||
      donor.bloodGroup.toLowerCase().includes(normalizedSearch);
    const matchesBloodGroup = bloodGroup === "all" || donor.bloodGroup === bloodGroup;
    return matchesSearch && matchesBloodGroup;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Blood Donor Directory</h1>
          <p className="page-subtitle">Find and alert compatible donors during emergencies</p>
        </div>
        <Button variant="destructive" disabled title="Emergency broadcasts are not configured yet">
          <AlertCircle /> Emergency Alert
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent><p className="text-muted-foreground text-sm">Total Donors</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">{donors.length}</p></CardContent></Card>
        <Card><CardContent><p className="text-muted-foreground text-sm">Available Now</p><p className="text-2xl font-bold text-success">{availableCount}</p></CardContent></Card>
        <Card><CardContent><p className="text-muted-foreground text-sm">Donations This Year</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">{donationsThisYear}</p></CardContent></Card>
        <Card><CardContent><p className="text-muted-foreground text-sm">Rare Groups (O-, AB-)</p><p className="text-2xl font-bold text-orange-500">{rareCount}</p></CardContent></Card>
      </div>

      {/* Blood Group Grid */}
      <Card>
        <CardHeader><CardTitle>Blood Group Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
              <div key={bg} className="flex flex-col items-center gap-1 rounded-lg border p-4">
                <Droplets className="size-5 text-destructive" />
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
            <div className="relative flex-1"><Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" /><Input placeholder="Search donors..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={bloodGroup} onValueChange={(value) => setBloodGroup(value)}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Blood Group" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {filteredDonors.map(d => (
              <div key={d.id} className="flex items-center gap-4 rounded-lg border p-4">
                <Avatar className="size-10"><AvatarFallback className="text-xs">{getInitials(d.name)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{d.name}</span>
                    <Badge variant={d.available ? "default" : "secondary"}>{d.available ? "Available" : "Unavailable"}</Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">{d.ward ?? "No ward"} | Last: {d.lastDonation ? formatDate(d.lastDonation) : "Never"}</p>
                </div>
                <Badge variant="outline" className="font-mono text-sm font-bold">{d.bloodGroup}</Badge>
                <Button variant="ghost" size="sm" nativeButton={false} render={<a href={d.phone ? `tel:${d.phone}` : undefined} aria-label={`Call ${d.name}`} />}>
                  <Phone className="size-4" />
                </Button>
              </div>
            ))}
            {filteredDonors.length === 0 && (
              <p className="empty-state text-muted-foreground text-sm md:col-span-2">{donors.length === 0 ? "No blood donors yet." : "No donors match the current filters."}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
