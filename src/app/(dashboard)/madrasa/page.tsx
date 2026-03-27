"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import {
  GraduationCap,
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

const attendanceTrend = [
  { week: "W1", rate: 92 },
  { week: "W2", rate: 89 },
  { week: "W3", rate: 94 },
  { week: "W4", rate: 91 },
  { week: "W5", rate: 88 },
  { week: "W6", rate: 93 },
  { week: "W7", rate: 90 },
  { week: "W8", rate: 95 },
];

const classStrength = [
  { name: "Level 1", students: 45, capacity: 50 },
  { name: "Level 2", students: 42, capacity: 45 },
  { name: "Level 3", students: 38, capacity: 40 },
  { name: "Level 4", students: 35, capacity: 40 },
  { name: "Level 5", students: 32, capacity: 35 },
  { name: "Level 6", students: 28, capacity: 35 },
  { name: "Level 7", students: 25, capacity: 30 },
];

const recentActivity = [
  { action: "Attendance marked", detail: "Level 3 - 36/38 present", time: "30 min ago" },
  { action: "Exam results published", detail: "Level 5 - Term Exam", time: "2 hours ago" },
  { action: "New admission approved", detail: "Aisha K - Level 1", time: "4 hours ago" },
  { action: "Hifz milestone", detail: "Fahad M completed Juz 15", time: "Yesterday" },
  { action: "Fee payment received", detail: "12 students - Rs. 18,000", time: "Yesterday" },
];

const chartConfig = {
  rate: { label: "Attendance %", color: "hsl(var(--chart-1))" },
  students: { label: "Students", color: "hsl(var(--chart-1))" },
};

export default function MadrasaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Madrasa</h1>
          <p className="text-muted-foreground">
            Manage students, classes, attendance, and academic progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/madrasa/attendance" />}>
            <Clock />
            Mark Attendance
          </Button>
          <Button render={<Link href="/madrasa/students" />}>
            <Users />
            Students
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <div className="flex items-center gap-1 text-xs text-green-500">
              <TrendingUp className="size-3" />
              +15 this term
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Attendance</CardTitle>
            <Clock className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91.4%</div>
            <div className="text-muted-foreground text-xs">815 / 892 present</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <div className="text-muted-foreground text-xs">Across 7 levels</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hifz Students</CardTitle>
            <BookOpen className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <div className="text-muted-foreground text-xs">3 completed this year</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        {/* Attendance Trend */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Weekly Attendance Trend</CardTitle>
            <CardDescription>Average attendance rate per week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis domain={[80, 100]} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest Madrasa updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="bg-primary/10 mt-0.5 size-2 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-muted-foreground text-xs">{item.detail}</p>
                  </div>
                  <span className="text-muted-foreground whitespace-nowrap text-xs">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Strength */}
      <Card>
        <CardHeader>
          <CardTitle>Class Strength</CardTitle>
          <CardDescription>Student enrollment by class level</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={classStrength}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="students" fill="var(--color-students)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Students", desc: "892 enrolled", href: "/madrasa/students", icon: Users },
          { title: "Attendance", desc: "Mark today's attendance", href: "/madrasa/attendance", icon: Clock },
          { title: "Hifz Tracker", desc: "48 active memorizers", href: "/madrasa/hifz", icon: BookOpen },
          { title: "Exams & Results", desc: "Upcoming: Term Exam", href: "/madrasa/exams", icon: GraduationCap },
        ].map((link) => (
          <Card key={link.title} className="cursor-pointer transition-colors hover:bg-accent">
            <Link href={link.href}>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="bg-primary/10 flex size-12 items-center justify-center rounded-lg">
                  <link.icon className="text-primary size-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{link.title}</p>
                  <p className="text-muted-foreground text-sm">{link.desc}</p>
                </div>
                <ArrowUpRight className="text-muted-foreground size-4" />
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
