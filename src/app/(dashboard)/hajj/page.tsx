import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Plane, MapPin, Users } from "lucide-react";

const hajjRecords = [
  { name: "Haji Abdul Kareem", type: "Hajj", year: 2024, dates: "Jun 10 - Jul 5", group: "Al-Huda Group", status: "completed" },
  { name: "Fathima Beevi", type: "Hajj", year: 2024, dates: "Jun 10 - Jul 5", group: "Al-Huda Group", status: "completed" },
  { name: "Mohammed Basheer", type: "Umrah", year: 2025, dates: "Jan 15 - Jan 25", group: "Individual", status: "completed" },
  { name: "Haris P K", type: "Hajj", year: 2025, dates: "Jun 2 - Jul 1", group: "Samastha Group", status: "registered" },
  { name: "Kunju Mohammed", type: "Hajj", year: 2025, dates: "Jun 2 - Jul 1", group: "Samastha Group", status: "registered" },
  { name: "Aslam K M", type: "Umrah", year: 2025, dates: "Apr 10 - Apr 20", group: "Individual", status: "planning" },
];

const statusColors: Record<string, "default" | "secondary" | "outline"> = { completed: "default", registered: "secondary", planning: "outline" };

export default function HajjPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hajj & Umrah</h1>
          <p className="text-muted-foreground">Pilgrimage records, document tracking, and group coordination</p>
        </div>
        <Button><Plus /> Add Record</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30"><Plane className="size-5 text-green-600" /></div><div><p className="text-muted-foreground text-sm">Hajj This Year</p><p className="text-2xl font-bold">2</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><MapPin className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Umrah This Year</p><p className="text-2xl font-bold">5</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Users className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Total Hajjis (All Time)</p><p className="text-2xl font-bold">189</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Plane className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">In Planning</p><p className="text-2xl font-bold">1</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Pilgrimage Records</CardTitle><CardDescription>Hajj and Umrah records for community members</CardDescription></CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table><TableHeader><TableRow>
              <TableHead>Pilgrim</TableHead><TableHead>Type</TableHead><TableHead>Year</TableHead><TableHead>Travel Dates</TableHead><TableHead>Group</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader><TableBody>
              {hajjRecords.map((r, i) => (
                <TableRow key={i}>
                  <TableCell><div className="flex items-center gap-3"><Avatar className="size-8"><AvatarFallback className="text-xs">{r.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</AvatarFallback></Avatar><span className="font-medium">{r.name}</span></div></TableCell>
                  <TableCell><Badge variant={r.type === "Hajj" ? "default" : "secondary"}>{r.type}</Badge></TableCell>
                  <TableCell className="text-sm">{r.year}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.dates}</TableCell>
                  <TableCell className="text-sm">{r.group}</TableCell>
                  <TableCell><Badge variant={statusColors[r.status]}>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
