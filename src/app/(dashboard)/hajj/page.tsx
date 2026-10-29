import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Plus, Plane, MapPin, Users } from "lucide-react";

export default function HajjPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hajj & Umrah</h1>
          <p className="text-muted-foreground">Pilgrimage records, document tracking, and group coordination</p>
        </div>
        <Button disabled title="Pilgrimage record creation is not configured yet"><Plus /> Add Record</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30"><Plane className="size-5 text-green-600" /></div><div><p className="text-muted-foreground text-sm">Hajj This Year</p><p className="text-2xl font-bold">0</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><MapPin className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Umrah This Year</p><p className="text-2xl font-bold">0</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Users className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Total Hajjis (All Time)</p><p className="text-2xl font-bold">0</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Plane className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">In Planning</p><p className="text-2xl font-bold">0</p></div></CardContent></Card>
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
