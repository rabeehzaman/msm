import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Heart, GraduationCap, AlertCircle, Megaphone } from "lucide-react";

const announcements = [
  { title: "Ramadan Timetable Released", body: "The Ramadan timetable with Iftar, Sehri, and Taraweeh timings has been published. Ramadan starts on March 29. Iftar sponsorship booking is now open.", category: "Religious", date: "2025-03-25", priority: "normal" },
  { title: "Janazah - Late Abdul Khader (MH-012)", body: "Inna lillahi wa inna ilayhi raji'un. Janazah prayer today at 3:00 PM at the Masjid. Burial at community cemetery Section A.", category: "Emergency", date: "2025-03-18", priority: "urgent" },
  { title: "Madrasa Admission Open 2025-26", body: "Admissions for the new academic year are now open for Level 1 to Level 7. Age limit: 5 years for Level 1. Contact the Madrasa office or apply via the portal.", category: "Education", date: "2025-03-20", priority: "normal" },
  { title: "Friday Collection Report - March", body: "Total Friday collections for March: Rs. 1,46,080. Average per Friday: Rs. 45,296. Thank you for your generous contributions.", category: "Financial", date: "2025-03-22", priority: "normal" },
  { title: "Youth Sports Event - April 5", body: "Annual community sports event for youth members (ages 15-30). Includes cricket, football, and badminton. Register through the events page by April 2.", category: "Events", date: "2025-03-15", priority: "normal" },
  { title: "Subscription Reminder", body: "Monthly subscription of Rs. 500 for April 2025 is due on April 1. Please make payment via UPI or at the Mahallu office.", category: "Payment", date: "2025-03-28", priority: "normal" },
];

const categoryIcons: Record<string, typeof Bell> = {
  Religious: Bell, Emergency: AlertCircle, Education: GraduationCap, Financial: Megaphone, Events: Calendar, Payment: Heart,
};
const categoryColors: Record<string, string> = {
  Religious: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Emergency: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Education: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Financial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Events: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  Payment: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

export default function PortalAnnouncementsPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-bold">Announcements</h1>

      <div className="flex flex-col gap-3">
        {announcements.map(a => {
          const Icon = categoryIcons[a.category] || Bell;
          return (
            <Card key={a.title} className={a.priority === "urgent" ? "border-red-300 dark:border-red-700" : ""}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${categoryColors[a.category] || "bg-muted"}`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{a.title}</p>
                      {a.priority === "urgent" && <Badge variant="destructive" className="text-xs">Urgent</Badge>}
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{a.body}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{a.category}</Badge>
                      <span className="text-muted-foreground text-xs">{new Date(a.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
