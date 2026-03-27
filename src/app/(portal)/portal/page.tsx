import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CreditCard, GraduationCap, FileText, Bell, Heart,
  ChevronRight, IndianRupee, Clock, CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function FamilyPortalHome() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      {/* Welcome */}
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          <AvatarFallback className="bg-primary text-primary-foreground">AR</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-bold">Assalamu Alaikum, Abdul Rahman</p>
          <p className="text-muted-foreground text-sm">House MH-001 | Ward 1 - Juma Masjid</p>
        </div>
      </div>

      {/* Payment Status */}
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">Subscription Status</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">All Clear</p>
            <p className="text-xs text-green-600 dark:text-green-400">Paid till March 2025</p>
          </div>
          <CheckCircle2 className="size-12 text-green-500" />
        </CardContent>
      </Card>

      {/* Quick Pay */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-sm font-medium">Next Due: April 2025</p>
            <p className="text-xl font-bold">Rs. 500</p>
          </div>
          <Button>
            <IndianRupee className="size-4" />
            Pay Now
          </Button>
        </CardContent>
      </Card>

      {/* Children's Madrasa */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Children&apos;s Madrasa</CardTitle>
            <Link href="/portal/madrasa" className="text-primary text-sm">View All</Link>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {[
            { name: "Mohammed Faisal", class: "Level 5", attendance: 94, fee: "Paid" },
            { name: "Safiya Rahman", class: "Level 2", attendance: 91, fee: "Paid" },
          ].map(child => (
            <div key={child.name} className="flex items-center gap-3 rounded-lg border p-3">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">{child.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{child.name}</p>
                <p className="text-muted-foreground text-xs">{child.class} | Attendance: {child.attendance}%</p>
              </div>
              <Badge variant="default" className="text-xs">{child.fee}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Announcements */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Announcements</CardTitle>
            <Link href="/portal/announcements" className="text-primary text-sm">View All</Link>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {[
            { title: "Ramadan Timetable Released", time: "2 days ago", category: "Religious" },
            { title: "Madrasa Admission Open 2025-26", time: "1 week ago", category: "Education" },
          ].map(a => (
            <div key={a.title} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                <Bell className="text-primary size-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-muted-foreground text-xs">{a.time}</p>
              </div>
              <ChevronRight className="text-muted-foreground size-4" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Payment History", href: "/portal/payments", icon: CreditCard, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          { label: "Certificates", href: "/portal/certificates", icon: FileText, color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
          { label: "Madrasa Progress", href: "/portal/madrasa", icon: GraduationCap, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
          { label: "Welfare", href: "/portal/certificates", icon: Heart, color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600" },
        ].map(link => (
          <Link key={link.label} href={link.href}>
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardContent className="flex flex-col items-center gap-2 pt-6 pb-4">
                <div className={`flex size-10 items-center justify-center rounded-lg ${link.color}`}>
                  <link.icon className="size-5" />
                </div>
                <span className="text-sm font-medium">{link.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Family Members */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Family Members</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {[
            { name: "Abdul Rahman K", role: "Head", status: "Active" },
            { name: "Fathima Rahman", role: "Spouse", status: "Active" },
            { name: "Mohammed Faisal", role: "Son", status: "Active" },
            { name: "Safiya Rahman", role: "Daughter", status: "Active" },
            { name: "Rashid Ali K", role: "Son", status: "NRI" },
            { name: "Amina Rahman", role: "Mother", status: "Active" },
          ].map(m => (
            <div key={m.name} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-8"><AvatarFallback className="text-xs">{m.name.split(" ").map(n => n[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-muted-foreground text-xs">{m.role}</p>
                </div>
              </div>
              <Badge variant={m.status === "NRI" ? "outline" : "default"} className="text-xs">{m.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
