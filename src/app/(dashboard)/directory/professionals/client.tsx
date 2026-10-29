"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Phone, Briefcase, Plus } from "lucide-react";

type Professional = {
  id: string;
  name: string;
  profession: string;
  specialization: string | null;
  business: string | null;
  ward: string | null;
  phone: string | null;
  available: boolean | null;
};

function getInitials(name: string) { return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase(); }

export function ProfessionalsClient({ professionals }: { professionals: Professional[] }) {
  const professionCount = new Set(professionals.map(p => p.profession.toLowerCase())).size;
  const businessCount = professionals.filter(p => p.business).length;
  const professionOptions = [...new Set(professionals.map(p => p.profession.toLowerCase()))].sort();

  const [search, setSearch] = useState("");
  const [profession, setProfession] = useState("all");
  const normalizedSearch = search.trim().toLowerCase();
  const filteredProfessionals = professionals.filter((person) => {
    const matchesSearch =
      !normalizedSearch ||
      person.name.toLowerCase().includes(normalizedSearch) ||
      person.profession.toLowerCase().includes(normalizedSearch) ||
      (person.specialization ?? "").toLowerCase().includes(normalizedSearch) ||
      (person.business ?? "").toLowerCase().includes(normalizedSearch) ||
      (person.ward ?? "").toLowerCase().includes(normalizedSearch);
    const matchesProfession = profession === "all" || person.profession.toLowerCase() === profession;
    return matchesSearch && matchesProfession;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Professional Directory</h1>
          <p className="page-subtitle">Community members&apos; skills and business services</p>
        </div>
        <Button disabled title="Professional listing creation is not configured yet"><Plus /> Add Listing</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent><p className="text-muted-foreground text-sm">Total Listings</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">{professionals.length}</p></CardContent></Card>
        <Card><CardContent><p className="text-muted-foreground text-sm">Professions</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">{professionCount}</p></CardContent></Card>
        <Card><CardContent><p className="text-muted-foreground text-sm">Businesses</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">{businessCount}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Directory</CardTitle><CardDescription>Search community professionals and services</CardDescription></CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1"><Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" /><Input placeholder="Search by name, profession, or skill..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={profession} onValueChange={(value) => setProfession(value)}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Profession" /></SelectTrigger><SelectContent><SelectItem value="all">All Professions</SelectItem>{professionOptions.map(o => <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {filteredProfessionals.map(p => (
              <div key={p.id} className="flex items-center gap-4 rounded-lg border p-4">
                <Avatar className="size-10"><AvatarFallback className="text-xs">{getInitials(p.name)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.name}</span>
                    <Badge variant={p.available ? "default" : "secondary"} className="text-xs">{p.available ? "Available" : "Busy"}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm"><Briefcase className="text-muted-foreground size-3" /><span className="text-primary">{p.profession}</span>{p.specialization && <span className="text-muted-foreground">- {p.specialization}</span>}</div>
                  {(p.business || p.ward) && <p className="text-muted-foreground text-xs">{[p.business, p.ward].filter(Boolean).join(" | ")}</p>}
                </div>
                <Button variant="ghost" size="sm" nativeButton={false} render={<a href={p.phone ? `tel:${p.phone}` : undefined} aria-label={`Call ${p.name}`} />}>
                  <Phone className="size-4" />
                </Button>
              </div>
            ))}
            {filteredProfessionals.length === 0 && (
              <p className="empty-state text-muted-foreground text-sm md:col-span-2">{professionals.length === 0 ? "No professional listings yet." : "No professionals match the current filters."}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
