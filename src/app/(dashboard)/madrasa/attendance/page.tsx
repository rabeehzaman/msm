"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Save } from "lucide-react";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

const classStudents = [
  { id: "1", rollNo: "501", name: "Mohammed Faisal K", status: "present" as AttendanceStatus },
  { id: "2", rollNo: "502", name: "Rashid Ali", status: "present" as AttendanceStatus },
  { id: "3", rollNo: "503", name: "Safwan K", status: "absent" as AttendanceStatus },
  { id: "4", rollNo: "504", name: "Ibrahim M", status: "present" as AttendanceStatus },
  { id: "5", rollNo: "505", name: "Aslam P", status: "late" as AttendanceStatus },
  { id: "6", rollNo: "506", name: "Najeeb K", status: "present" as AttendanceStatus },
  { id: "7", rollNo: "507", name: "Fahad Ali", status: "present" as AttendanceStatus },
  { id: "8", rollNo: "508", name: "Haris M", status: "present" as AttendanceStatus },
  { id: "9", rollNo: "509", name: "Thanveer A", status: "excused" as AttendanceStatus },
  { id: "10", rollNo: "510", name: "Ashraf K", status: "present" as AttendanceStatus },
  { id: "11", rollNo: "511", name: "Yasir P", status: "present" as AttendanceStatus },
  { id: "12", rollNo: "512", name: "Riyas M", status: "absent" as AttendanceStatus },
];

const statusConfig: Record<AttendanceStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  present: { icon: CheckCircle2, color: "text-green-500", label: "Present" },
  absent: { icon: XCircle, color: "text-red-500", label: "Absent" },
  late: { icon: Clock, color: "text-yellow-500", label: "Late" },
  excused: { icon: AlertTriangle, color: "text-blue-500", label: "Excused" },
};

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(classStudents.map((s) => [s.id, s.status]))
  );

  const toggleStatus = (id: string) => {
    const order: AttendanceStatus[] = ["present", "absent", "late", "excused"];
    const current = attendance[id];
    const next = order[(order.indexOf(current) + 1) % order.length];
    setAttendance((prev) => ({ ...prev, [id]: next }));
  };

  const counts = Object.values(attendance).reduce(
    (acc, s) => ({ ...acc, [s]: (acc[s] || 0) + 1 }),
    {} as Record<string, number>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">Quick attendance marking - tap to toggle status</p>
        </div>
        <Button>
          <Save />
          Save Attendance
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Select defaultValue="level5">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {[1,2,3,4,5,6,7].map(l => <SelectItem key={l} value={`level${l}`}>Level {l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" defaultValue="2025-03-27" className="w-[200px]" />
        <div className="ml-auto flex items-center gap-4">
          {(["present", "absent", "late", "excused"] as AttendanceStatus[]).map((s) => {
            const cfg = statusConfig[s];
            return (
              <div key={s} className="flex items-center gap-1.5">
                <cfg.icon className={`size-4 ${cfg.color}`} />
                <span className="text-sm font-medium">{counts[s] || 0}</span>
              </div>
            );
          })}
          <span className="text-muted-foreground text-sm">
            Total: {classStudents.length}
          </span>
        </div>
      </div>

      {/* Attendance Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Level 5 - Attendance</CardTitle>
          <CardDescription>
            Tap on a student&apos;s status to cycle through: Present → Absent → Late → Excused
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Roll #</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="w-[150px] text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classStudents.map((student) => {
                  const status = attendance[student.id];
                  const cfg = statusConfig[status];
                  const Icon = cfg.icon;
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-sm">{student.rollNo}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`gap-2 ${cfg.color}`}
                          onClick={() => toggleStatus(student.id)}
                        >
                          <Icon className="size-4" />
                          {cfg.label}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        {(["present", "absent", "late", "excused"] as AttendanceStatus[]).map((s) => {
          const cfg = statusConfig[s];
          const Icon = cfg.icon;
          return (
            <Card key={s}>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className={`flex size-10 items-center justify-center rounded-lg bg-muted`}>
                  <Icon className={`size-5 ${cfg.color}`} />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm capitalize">{cfg.label}</p>
                  <p className="text-2xl font-bold">{counts[s] || 0}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
