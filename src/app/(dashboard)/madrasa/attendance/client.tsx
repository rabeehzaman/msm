"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Save, Loader2 } from "lucide-react";
import { saveAttendance } from "@/lib/actions/madrasa";
import { toast } from "sonner";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

type Student = {
  id: string;
  fullName: string;
  classId: string | null;
  className: string | null;
};

type ClassInfo = {
  id: string;
  name: string;
  level: number | null;
};

const statusConfig: Record<AttendanceStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  present: { icon: CheckCircle2, color: "text-green-500", label: "Present" },
  absent: { icon: XCircle, color: "text-red-500", label: "Absent" },
  late: { icon: Clock, color: "text-yellow-500", label: "Late" },
  excused: { icon: AlertTriangle, color: "text-blue-500", label: "Excused" },
};

export function AttendanceClient({
  students,
  classes,
}: {
  students: Student[];
  classes: ClassInfo[];
}) {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);

  const classStudents = students.filter((s) => s.classId === selectedClass);

  // Initialize attendance for current class students
  const getStatus = (studentId: string): AttendanceStatus => {
    return attendance[studentId] || "present";
  };

  const toggleStatus = (id: string) => {
    const order: AttendanceStatus[] = ["present", "absent", "late", "excused"];
    const current = getStatus(id);
    const next = order[(order.indexOf(current) + 1) % order.length];
    setAttendance((prev) => ({ ...prev, [id]: next }));
  };

  const counts = classStudents.reduce(
    (acc, s) => {
      const status = getStatus(s.id);
      return { ...acc, [status]: (acc[status] || 0) + 1 };
    },
    {} as Record<string, number>
  );

  async function handleSave() {
    if (!selectedClass || classStudents.length === 0) {
      toast.error("No students to mark attendance for");
      return;
    }
    setLoading(true);
    try {
      const records = classStudents.map((s) => ({
        studentId: s.id,
        classId: selectedClass,
        date,
        status: getStatus(s.id),
      }));
      await saveAttendance(records);
      toast.success("Attendance saved successfully");
    } catch {
      toast.error("Failed to save attendance");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">Quick attendance marking - tap to toggle status</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Save />}
          {loading ? "Saving..." : "Save Attendance"}
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v ?? "")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[200px]" />
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
          <CardTitle>{classes.find(c => c.id === selectedClass)?.name || "Select a class"} - Attendance</CardTitle>
          <CardDescription>
            Tap on a student&apos;s status to cycle through: Present → Absent → Late → Excused
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No classes created yet</p>
              <p className="text-muted-foreground text-sm">Create classes first to start marking attendance.</p>
            </div>
          ) : classStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No students in this class</p>
              <p className="text-muted-foreground text-sm">Enroll students in this class to mark attendance.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">#</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="w-[150px] text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classStudents.map((student, idx) => {
                    const status = getStatus(student.id);
                    const cfg = statusConfig[status];
                    const Icon = cfg.icon;
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-sm">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{student.fullName}</TableCell>
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
          )}
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
                <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
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
