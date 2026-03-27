import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Search, MapPin, Plus } from "lucide-react";

const sections = [
  { name: "Section A", total: 50, occupied: 38, reserved: 4, available: 8 },
  { name: "Section B", total: 40, occupied: 25, reserved: 3, available: 12 },
  { name: "Section C", total: 45, occupied: 15, reserved: 2, available: 28 },
  { name: "Section D", total: 35, occupied: 5, reserved: 1, available: 29 },
];

const recentBurials = [
  { plot: "A-3-12", name: "Late Abdul Khader", date: "2025-03-18", house: "MH-012" },
  { plot: "B-1-5", name: "Late Kunju Haji", date: "2025-02-10", house: "MH-089" },
  { plot: "A-5-8", name: "Late Mohammed Kutty", date: "2025-01-05", house: "MH-056" },
  { plot: "C-2-3", name: "Late Fathima Haji", date: "2024-12-15", house: "MH-034" },
];

const totalPlots = sections.reduce((s, sec) => s + sec.total, 0);
const totalOccupied = sections.reduce((s, sec) => s + sec.occupied, 0);
const totalAvailable = sections.reduce((s, sec) => s + sec.available, 0);

export default function CemeteryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cemetery (Qabristan)</h1>
          <p className="text-muted-foreground">Plot management, burial records, and capacity tracking</p>
        </div>
        <Button><Plus /> Reserve Plot</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Plots</p><p className="text-2xl font-bold">{totalPlots}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Occupied</p><p className="text-2xl font-bold text-red-500">{totalOccupied}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Available</p><p className="text-2xl font-bold text-green-600">{totalAvailable}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Capacity Used</p><p className="text-2xl font-bold">{((totalOccupied / totalPlots) * 100).toFixed(0)}%</p><Progress value={(totalOccupied / totalPlots) * 100} className="mt-2 h-2" /></CardContent></Card>
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
            {sections.map(sec => (
              <div key={sec.name}>
                <p className="mb-2 text-sm font-semibold">{sec.name}</p>
                <div className="grid grid-cols-10 gap-1.5">
                  {Array.from({ length: sec.total }, (_, i) => {
                    const status = i < sec.occupied ? "occupied" : i < sec.occupied + sec.reserved ? "reserved" : "available";
                    const colors: Record<string, string> = { occupied: "bg-red-500", reserved: "bg-yellow-500", available: "bg-green-500" };
                    return (
                      <div key={i} className={`flex aspect-square items-center justify-center rounded text-[9px] font-bold text-white ${colors[status]}`}>
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search & Recent Burials */}
      <Card>
        <CardHeader><CardTitle>Grave Finder</CardTitle><CardDescription>Search burial records by name</CardDescription></CardHeader>
        <CardContent>
          <div className="mb-4 relative"><Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" /><Input placeholder="Search by name to locate a grave..." className="pl-9" /></div>
          <div className="flex flex-col gap-3">
            {recentBurials.map(b => (
              <div key={b.plot} className="flex items-center gap-4 rounded-lg border p-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted"><MapPin className="text-muted-foreground size-5" /></div>
                <div className="flex-1">
                  <p className="font-medium">{b.name}</p>
                  <p className="text-muted-foreground text-xs">{b.house} | {new Date(b.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
                <Badge variant="outline" className="font-mono">{b.plot}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
