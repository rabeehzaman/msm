import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Bell, Send, Clock, Eye } from "lucide-react";

const announcements = [
  { id: "1", title: "Ramadan Timetable Released", category: "Religious", target: "All Members", status: "published", date: "2025-03-25", views: 892 },
  { id: "2", title: "Friday Collection Report - March", category: "Financial", target: "All Members", status: "published", date: "2025-03-22", views: 456 },
  { id: "3", title: "Madrasa Admission Open - 2025-26", category: "Education", target: "All Members", status: "published", date: "2025-03-20", views: 678 },
  { id: "4", title: "Subscription Payment Reminder - March", category: "Payment Reminder", target: "Overdue Households", status: "scheduled", date: "2025-03-28", views: 0 },
  { id: "5", title: "Community Clean-up Drive", category: "Community", target: "Ward 1, Ward 2", status: "draft", date: "2025-03-30", views: 0 },
  { id: "6", title: "Janazah - Late Abdul Khader", category: "Emergency", target: "All Members", status: "published", date: "2025-03-18", views: 1205 },
  { id: "7", title: "Youth Sports Event Registration", category: "Events", target: "Youth Members", status: "published", date: "2025-03-15", views: 234 },
];

const statusColors: Record<string, "default" | "secondary" | "outline"> = {
  published: "default", scheduled: "secondary", draft: "outline",
};

export default function AnnouncementsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Create and manage community announcements</p>
        </div>
        <Button><Plus /> New Announcement</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Published</p><p className="text-2xl font-bold">156</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Scheduled</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Reach</p><p className="text-2xl font-bold">4,567</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">This Month</p><p className="text-2xl font-bold">12</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>All Announcements</CardTitle><CardDescription>Community notices and updates</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input placeholder="Search announcements..." className="pl-9" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {announcements.map(a => (
              <div key={a.id} className="flex items-center gap-4 rounded-lg border p-4">
                <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                  <Bell className="text-primary size-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{a.title}</p>
                    <Badge variant={statusColors[a.status]}>{a.status}</Badge>
                    <Badge variant="outline">{a.category}</Badge>
                  </div>
                  <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1"><Send className="size-3" /> {a.target}</span>
                    <span className="flex items-center gap-1"><Clock className="size-3" /> {new Date(a.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                    {a.views > 0 && <span className="flex items-center gap-1"><Eye className="size-3" /> {a.views} views</span>}
                  </div>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
