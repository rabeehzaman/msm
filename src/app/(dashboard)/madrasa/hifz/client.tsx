"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { BookOpen, Award } from "lucide-react";

type Student = {
  id: string;
  fullName: string;
  className: string | null;
  status: string | null;
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export function HifzClient({
  students,
}: {
  students: Student[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hifz Tracker</h1>
          <p className="text-muted-foreground">Quran memorization progress for all students</p>
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
              <p className="text-muted-foreground text-sm">Total Students</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Award className="size-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Active</p>
              <p className="text-2xl font-bold">{students.filter(s => s.status === "active").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
              <BookOpen className="text-muted-foreground size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">In Madrasa</p>
              <p className="text-2xl font-bold">{students.filter(s => s.className).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
              <Award className="text-muted-foreground size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Unassigned</p>
              <p className="text-2xl font-bold">{students.filter(s => !s.className).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>All students - Hifz progress tracking requires additional setup</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No students enrolled yet</p>
              <p className="text-muted-foreground text-sm">Enroll students in the Madrasa first.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs">{getInitials(s.fullName)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{s.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{s.className || "Unassigned"}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status || "active"}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
