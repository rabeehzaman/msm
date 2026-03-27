"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Trash2 } from "lucide-react";
import { createStudent, deleteStudent } from "@/lib/actions/madrasa";
import { toast } from "sonner";

type Student = {
  id: string;
  fullName: string;
  dateOfBirth: string | null;
  parentPhone: string | null;
  status: string | null;
  admissionDate: string | null;
  classId: string | null;
  className: string | null;
  classLevel: number | null;
};

type ClassInfo = {
  id: string;
  name: string;
  level: number | null;
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export function StudentsClient({
  students,
  classes,
}: {
  students: Student[];
  classes: ClassInfo[];
}) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = students.filter((s) => {
    const matchesSearch =
      !search ||
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (s.parentPhone && s.parentPhone.includes(search));
    const matchesClass = classFilter === "all" || s.classId === classFilter;
    return matchesSearch && matchesClass;
  });

  const activeCount = students.filter(s => s.status === "active").length;

  async function handleCreate(formData: FormData) {
    try {
      await createStudent(formData);
      toast.success("Student enrolled successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to enroll student");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove student "${name}"?`)) return;
    try {
      await deleteStudent(id);
      toast.success("Student removed");
    } catch {
      toast.error("Failed to remove student");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage Madrasa student enrollment and profiles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}><Plus /> New Admission</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Student Admission</DialogTitle>
              <DialogDescription>Enroll a new student in the Madrasa</DialogDescription>
            </DialogHeader>
            <form action={handleCreate}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input name="fullName" placeholder="Student full name" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Class</label>
                  <Select name="classId">
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Date of Birth</label>
                    <Input type="date" name="dateOfBirth" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Parent Phone</label>
                    <Input name="parentPhone" placeholder="+91 94567 12345" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit"><Plus /> Enroll Student</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Enrolled</p><p className="text-2xl font-bold">{students.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Active</p><p className="text-2xl font-bold">{activeCount}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Classes</p><p className="text-2xl font-bold">{classes.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Showing</p><p className="text-2xl font-bold">{filtered.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Directory</CardTitle>
              <CardDescription>All enrolled students</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input placeholder="Search by name or phone..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={classFilter} onValueChange={(v) => setClassFilter(v ?? "all")}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No students found</p>
              <p className="text-muted-foreground text-sm">
                {students.length === 0 ? "Enroll your first student to get started." : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Parent Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
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
                      <TableCell className="text-muted-foreground text-sm">{s.dateOfBirth || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{s.parentPhone || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status || "active"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id, s.fullName)}>
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
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
