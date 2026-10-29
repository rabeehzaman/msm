import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Plus, Plane, MapPin, Users } from "lucide-react";

export default function HajjPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hajj & Umrah</h1>
          <p className="page-subtitle">Pilgrimage records, document tracking, and group coordination</p>
        </div>
        <Button disabled title="Pilgrimage record creation is not configured yet"><Plus /> Add Record</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4"><div className="stat-icon"><Plane className="size-5 text-success" /></div><div><p className="text-muted-foreground text-sm">Hajj This Year</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">0</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4"><div className="stat-icon"><MapPin className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Umrah This Year</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">0</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4"><div className="stat-icon"><Users className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Total Hajjis (All Time)</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">0</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4"><div className="stat-icon"><Plane className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">In Planning</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">0</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Pilgrimage Records</CardTitle><CardDescription>Hajj and Umrah records for community members</CardDescription></CardHeader>
        <CardContent>
          <EmptyState message="No pilgrimage records yet." />
        </CardContent>
      </Card>
    </div>
  );
}
