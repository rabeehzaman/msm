"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Users,
  BookOpen,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

type MadrasaStats = {
  students: number;
  teachers: number;
  classes: number;
};

type ClassInfo = {
  id: string;
  name: string;
  level: number | null;
  studentCount: number;
  capacity: number | null;
};

export function MadrasaClient({
  stats,
  classes,
}: {
  stats: MadrasaStats;
  classes: ClassInfo[];
}) {
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
          <Link href="/madrasa/attendance">
            <Button variant="outline">
              <Clock />
              Mark Attendance
            </Button>
          </Link>
          <Link href="/madrasa/students">
            <Button>
              <Users />
              Students
            </Button>
          </Link>
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
            <div className="text-2xl font-bold">{stats.students}</div>
            <div className="text-muted-foreground text-xs">enrolled in all classes</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <BookOpen className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.classes}</div>
            <div className="text-muted-foreground text-xs">active classes</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachers}</div>
            <div className="text-muted-foreground text-xs">on staff</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Class Size</CardTitle>
            <GraduationCap className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.classes > 0 ? Math.round(stats.students / stats.classes) : 0}
            </div>
            <div className="text-muted-foreground text-xs">students per class</div>
          </CardContent>
        </Card>
      </div>

      {/* Class Strength */}
      {classes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Class Strength</CardTitle>
            <CardDescription>Student enrollment by class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {classes.map((c) => (
                <div key={c.id} className="flex flex-col gap-2 rounded-lg border p-4">
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xl font-bold">{c.studentCount}</span>
                  <span className="text-muted-foreground text-xs">
                    {c.capacity ? `${c.studentCount} / ${c.capacity} capacity` : `${c.studentCount} students`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Students", desc: `${stats.students} enrolled`, href: "/madrasa/students", icon: Users },
          { title: "Attendance", desc: "Mark today's attendance", href: "/madrasa/attendance", icon: Clock },
          { title: "Hifz Tracker", desc: "Memorization progress", href: "/madrasa/hifz", icon: BookOpen },
          { title: "Exams & Results", desc: "Manage exams", href: "/madrasa/exams", icon: GraduationCap },
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

      {stats.students === 0 && stats.classes === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground text-lg">No madrasa data yet</p>
          <p className="text-muted-foreground text-sm">
            Start by creating classes and enrolling students.
          </p>
        </div>
      )}
    </div>
  );
}
