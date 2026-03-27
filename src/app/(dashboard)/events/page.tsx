import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, MapPin, Users, Clock } from "lucide-react";

const upcomingEvents = [
  { id: "1", title: "Juma Prayer & Khutbah", type: "Weekly", date: "2025-03-28", time: "12:30 PM", venue: "Main Hall", status: "scheduled", registrations: "-" },
  { id: "2", title: "Ramadan Iftar - Day 1", type: "Ramadan", date: "2025-03-29", time: "6:15 PM", venue: "Community Hall", status: "scheduled", registrations: "150" },
  { id: "3", title: "Weekly Dars - Hadith", type: "Education", date: "2025-03-30", time: "8:00 PM", venue: "Masjid", status: "scheduled", registrations: "45" },
  { id: "4", title: "Youth Workshop - Career Guidance", type: "Youth", date: "2025-04-02", time: "10:00 AM", venue: "Community Hall", status: "draft", registrations: "32" },
  { id: "5", title: "Nikah Ceremony - Rashid & Safiya", type: "Marriage", date: "2025-04-05", time: "4:00 PM", venue: "Masjid", status: "scheduled", registrations: "-" },
  { id: "6", title: "Quran Competition - Annual", type: "Competition", date: "2025-04-12", time: "9:00 AM", venue: "Madrasa Hall", status: "draft", registrations: "78" },
];

const pastEvents = [
  { title: "Community Clean-up Drive", date: "2025-03-22", attendance: 85, budget: 5000, spent: 4200 },
  { title: "Women's Islamic Study Circle", date: "2025-03-20", attendance: 32, budget: 0, spent: 0 },
  { title: "Mawlid Celebration", date: "2025-03-15", attendance: 450, budget: 25000, spent: 22300 },
];

const statusColors: Record<string, "default" | "secondary" | "outline"> = {
  scheduled: "default", draft: "outline", ongoing: "secondary", completed: "secondary",
};

export default function EventsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events & Programs</h1>
          <p className="text-muted-foreground">Manage community events, programs, and Islamic calendar</p>
        </div>
        <Button><Plus /> Create Event</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Upcoming</p><p className="text-2xl font-bold">6</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">This Month</p><p className="text-2xl font-bold">12</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Registrations</p><p className="text-2xl font-bold">305</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Ramadan Events</p><p className="text-2xl font-bold">30</p></CardContent></Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader><CardTitle>Upcoming Events</CardTitle><CardDescription>Scheduled programs and activities</CardDescription></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {upcomingEvents.map(e => (
              <div key={e.id} className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex size-14 flex-col items-center justify-center rounded-lg bg-primary/10 text-center">
                  <span className="text-primary text-xs font-medium">{new Date(e.date).toLocaleDateString("en-IN", { month: "short" })}</span>
                  <span className="text-primary text-xl font-bold">{new Date(e.date).getDate()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{e.title}</p>
                    <Badge variant={statusColors[e.status]}>{e.status}</Badge>
                    <Badge variant="outline">{e.type}</Badge>
                  </div>
                  <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1"><Clock className="size-3" /> {e.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="size-3" /> {e.venue}</span>
                    {e.registrations !== "-" && <span className="flex items-center gap-1"><Users className="size-3" /> {e.registrations} registered</span>}
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Past Events */}
      <Card>
        <CardHeader><CardTitle>Recent Past Events</CardTitle><CardDescription>Completed events with attendance and budget</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {pastEvents.map(e => (
              <div key={e.title} className="rounded-lg border p-4">
                <p className="font-medium">{e.title}</p>
                <p className="text-muted-foreground text-sm">{new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span><Users className="mr-1 inline size-3" />{e.attendance} attended</span>
                  {e.budget > 0 && <span className="text-muted-foreground">Rs. {e.spent.toLocaleString("en-IN")} / {e.budget.toLocaleString("en-IN")}</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
