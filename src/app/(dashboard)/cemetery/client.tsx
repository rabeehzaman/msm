"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/empty-state";
import { Search, MapPin, Plus } from "lucide-react";

type Plot = {
  id: string;
  section: string;
  row: string;
  plotNumber: string;
  status: "available" | "occupied" | "reserved" | "maintenance";
  occupantName: string | null;
  burialDate: string | null;
};

const colors: Record<Plot["status"], string> = {
  occupied: "bg-red-500",
  reserved: "bg-yellow-500",
  available: "bg-green-500",
  maintenance: "bg-muted-foreground",
};

export function CemeteryClient({ plots }: { plots: Plot[] }) {
  const sections = Object.entries(
    plots.reduce<Record<string, Plot[]>>((acc, plot) => {
      (acc[plot.section] ??= []).push(plot);
      return acc;
    }, {})
  ).sort(([a], [b]) => a.localeCompare(b));
  const totalPlots = plots.length;
  const totalOccupied = plots.filter((p) => p.status === "occupied").length;
  const totalAvailable = plots.filter((p) => p.status === "available").length;
  const capacityUsed = totalPlots ? (totalOccupied / totalPlots) * 100 : 0;
  const recentBurials = plots
    .filter((p) => p.status === "occupied" && p.occupantName)
    .map((p) => ({ plot: `${p.section}-${p.row}-${p.plotNumber}`, name: p.occupantName as string, date: p.burialDate }))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const filteredBurials = recentBurials.filter((burial) => {
    return (
      !normalizedSearch ||
      burial.name.toLowerCase().includes(normalizedSearch) ||
      burial.plot.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cemetery (Qabristan)</h1>
          <p className="text-muted-foreground">Plot management, burial records, and capacity tracking</p>
        </div>
        <Button disabled title="Plot reservation workflow is not configured yet"><Plus /> Reserve Plot</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Plots</p><p className="text-2xl font-bold">{totalPlots}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Occupied</p><p className="text-2xl font-bold text-red-500">{totalOccupied}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Available</p><p className="text-2xl font-bold text-green-600">{totalAvailable}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Capacity Used</p><p className="text-2xl font-bold">{capacityUsed.toFixed(0)}%</p><Progress value={capacityUsed} className="mt-2 h-2" /></CardContent></Card>
      </div>

      {/* Cemetery Grid Map */}
      <Card>
        <CardHeader><CardTitle>Cemetery Plot Map</CardTitle><CardDescription>Visual map of all sections — color coded by status</CardDescription></CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2"><div className="size-4 rounded bg-red-500" /><span>Occupied</span></div>
            <div className="flex items-center gap-2"><div className="size-4 rounded bg-yellow-500" /><span>Reserved</span></div>
            <div className="flex items-center gap-2"><div className="size-4 rounded bg-green-500" /><span>Available</span></div>
            <div className="flex items-center gap-2"><div className="bg-muted size-4 rounded" /><span>Maintenance</span></div>
          </div>
          <div className="flex flex-col gap-6">
            {sections.map(([name, secPlots]) => (
              <div key={name}>
                <p className="mb-2 text-sm font-semibold">Section {name}</p>
                <div className="grid grid-cols-10 gap-1.5">
                  {secPlots.map((plot) => (
                    <div key={plot.id} title={`${plot.section}-${plot.row}-${plot.plotNumber}`} className={`flex aspect-square items-center justify-center rounded text-[9px] font-bold text-white ${colors[plot.status]}`}>
                      {plot.plotNumber}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {sections.length === 0 && <EmptyState message="No cemetery plots yet." />}
          </div>
        </CardContent>
      </Card>

      {/* Search & Recent Burials */}
      <Card>
        <CardHeader><CardTitle>Grave Finder</CardTitle><CardDescription>Search burial records by name</CardDescription></CardHeader>
        <CardContent>
          <div className="mb-4 relative"><Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" /><Input placeholder="Search by name to locate a grave..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <div className="flex flex-col gap-3">
            {filteredBurials.map(b => (
              <div key={b.plot} className="flex items-center gap-4 rounded-lg border p-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted"><MapPin className="text-muted-foreground size-5" /></div>
                <div className="flex-1">
                  <p className="font-medium">{b.name}</p>
                  <p className="text-muted-foreground text-xs">{b.date ? new Date(b.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Date not recorded"}</p>
                </div>
                <Badge variant="outline" className="font-mono">{b.plot}</Badge>
              </div>
            ))}
            {filteredBurials.length === 0 && (
              <p className="text-muted-foreground py-8 text-center text-sm">No burial records match the search.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
