"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Star, TrendingUp, Award, Flame } from "lucide-react";

const hifzStudents = [
  { id: "1", name: "Hifzur Rahman", level: "Advanced", juzCompleted: 22, totalJuz: 30, streak: 45, quality: 4.5, lastEntry: "Juz 23 - Surah Yaseen" },
  { id: "2", name: "Fahad M", level: "Advanced", juzCompleted: 15, totalJuz: 30, streak: 32, quality: 4.2, lastEntry: "Juz 16 - Surah Al-Kahf" },
  { id: "3", name: "Safwan K", level: "Intermediate", juzCompleted: 8, totalJuz: 30, streak: 18, quality: 3.8, lastEntry: "Juz 9 - Surah Al-A'raf" },
  { id: "4", name: "Ibrahim Ali", level: "Beginner", juzCompleted: 3, totalJuz: 30, streak: 12, quality: 4.0, lastEntry: "Juz 4 - Surah An-Nisa" },
  { id: "5", name: "Mariyam N", level: "Intermediate", juzCompleted: 10, totalJuz: 30, streak: 25, quality: 4.7, lastEntry: "Juz 11 - Surah Hud" },
  { id: "6", name: "Ashraf K", level: "Beginner", juzCompleted: 2, totalJuz: 30, streak: 8, quality: 3.5, lastEntry: "Juz 3 - Surah Al-Imran" },
];

// Juz grid data for a student (Hifzur Rahman)
const juzGrid = Array.from({ length: 30 }, (_, i) => ({
  juz: i + 1,
  status: i < 22 ? "memorized" : i === 22 ? "in_progress" : "pending",
}));

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

const juzStatusColors: Record<string, string> = {
  memorized: "bg-green-500",
  in_progress: "bg-yellow-500",
  pending: "bg-muted",
};

export default function HifzPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hifz Tracker</h1>
          <p className="text-muted-foreground">Quran memorization progress for all Hifz students</p>
        </div>
        <Button>
          <BookOpen />
          Log Progress
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <BookOpen className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Active Students</p>
              <p className="text-2xl font-bold">48</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Award className="size-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Completed (30/30)</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Flame className="size-5 text-orange-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Avg. Streak</p>
              <p className="text-2xl font-bold">23 days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Star className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Avg. Quality</p>
              <p className="text-2xl font-bold">4.1 / 5</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Juz Progress Grid (Featured Student) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>30 Juz Progress Map</CardTitle>
              <CardDescription>Hifzur Rahman - 22/30 Juz memorized</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded bg-green-500" />
                <span>Memorized</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded bg-yellow-500" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="bg-muted size-3 rounded" />
                <span>Pending</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {juzGrid.map((j) => (
              <div
                key={j.juz}
                className={`flex aspect-square items-center justify-center rounded-lg text-xs font-bold ${juzStatusColors[j.status]} ${j.status === "memorized" ? "text-white" : j.status === "in_progress" ? "text-white" : "text-muted-foreground"}`}
              >
                {j.juz}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Progress value={(22 / 30) * 100} className="h-3 flex-1" />
            <span className="text-lg font-bold">73%</span>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Hifz Students</CardTitle>
          <CardDescription>All students enrolled in the memorization program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Streak</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Last Entry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hifzStudents.map((s) => (
                  <TableRow key={s.id} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">{getInitials(s.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.level === "Advanced" ? "default" : s.level === "Intermediate" ? "secondary" : "outline"}>
                        {s.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={(s.juzCompleted / s.totalJuz) * 100} className="h-2 w-20" />
                        <span className="text-sm font-medium">{s.juzCompleted}/{s.totalJuz}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Flame className={`size-4 ${s.streak >= 30 ? "text-orange-500" : "text-muted-foreground"}`} />
                        <span className="text-sm font-medium">{s.streak}d</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(star => (
                          <Star
                            key={star}
                            className={`size-3 ${star <= Math.floor(s.quality) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                          />
                        ))}
                        <span className="ml-1 text-xs">{s.quality}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{s.lastEntry}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
