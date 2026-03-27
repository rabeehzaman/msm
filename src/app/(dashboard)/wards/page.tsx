import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Plus, MapPin, Users, Home } from "lucide-react";

const wards = [
  { id: "1", name: "Ward 1 - Juma Masjid", code: "W1", leader: "Rashid K", households: 185, members: 782, collectionRate: 92, color: "bg-blue-500" },
  { id: "2", name: "Ward 2 - Maidan", code: "W2", leader: "Haris P K", households: 168, members: 695, collectionRate: 88, color: "bg-green-500" },
  { id: "3", name: "Ward 3 - Palliyara", code: "W3", leader: "Aslam K M", households: 145, members: 612, collectionRate: 85, color: "bg-yellow-500" },
  { id: "4", name: "Ward 4 - Valiyangadi", code: "W4", leader: "Najeeb K", households: 192, members: 823, collectionRate: 90, color: "bg-purple-500" },
  { id: "5", name: "Ward 5 - Puthenpalli", code: "W5", leader: "Faizal P", households: 156, members: 648, collectionRate: 82, color: "bg-orange-500" },
  { id: "6", name: "Ward 6 - Kaipram", code: "W6", leader: "Ibrahim Ali", households: 134, members: 558, collectionRate: 87, color: "bg-pink-500" },
  { id: "7", name: "Ward 7 - Mundakkal", code: "W7", leader: "Siddique M", households: 148, members: 614, collectionRate: 84, color: "bg-teal-500" },
  { id: "8", name: "Ward 8 - Thekkepuram", code: "W8", leader: "Ashraf K", households: 156, members: 700, collectionRate: 91, color: "bg-indigo-500" },
];

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function WardsPage() {
  const totalHouseholds = wards.reduce((s, w) => s + w.households, 0);
  const totalMembers = wards.reduce((s, w) => s + w.members, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wards</h1>
          <p className="text-muted-foreground">Geographic ward management and collection tracking</p>
        </div>
        <Button><Plus /> Add Ward</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"><MapPin className="size-5 text-blue-600" /></div><div><p className="text-muted-foreground text-sm">Total Wards</p><p className="text-2xl font-bold">{wards.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Home className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Total Households</p><p className="text-2xl font-bold">{totalHouseholds.toLocaleString("en-IN")}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Users className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Total Members</p><p className="text-2xl font-bold">{totalMembers.toLocaleString("en-IN")}</p></div></CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {wards.map(w => (
          <Card key={w.id} className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-lg text-white font-bold text-sm ${w.color}`}>
                  {w.code}
                </div>
                <div>
                  <CardTitle className="text-base">{w.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px]">{getInitials(w.leader)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{w.leader}</span>
                  <Badge variant="outline" className="ml-auto text-xs">Leader</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1"><Home className="text-muted-foreground size-3" /><span>{w.households} households</span></div>
                  <div className="flex items-center gap-1"><Users className="text-muted-foreground size-3" /><span>{w.members} members</span></div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Collection Rate</span>
                    <span className={`font-medium ${w.collectionRate >= 90 ? "text-green-600" : w.collectionRate >= 80 ? "text-yellow-600" : "text-red-500"}`}>{w.collectionRate}%</span>
                  </div>
                  <Progress value={w.collectionRate} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
