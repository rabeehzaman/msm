"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, DoorOpen, Loader2, Plus, Users } from "lucide-react";
import { createClass } from "@/lib/actions/madrasa";
import { toast } from "sonner";
import Link from "next/link";

type ClassInfo = {
  id: string;
  name: string;
  level: number | null;
  section: string | null;
  room: string | null;
  capacity: number | null;
  studentCount: number;
};

export function ClassesClient({ classes }: { classes: ClassInfo[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    try {
      await createClass(formData);
      toast.success("Class created successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to create class");
    } finally {
      setLoading(false);
    }
  }

  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity ?? 0), 0);
  const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">Create and manage Madrasa class divisions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus />
            New Class
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Class</DialogTitle>
              <DialogDescription>Add a class before enrolling students or marking attendance.</DialogDescription>
            </DialogHeader>
            <form action={handleCreate}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Class Name *</label>
                  <Input name="name" placeholder="Level 1" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Level *</label>
                    <Input type="number" name="level" min="1" placeholder="1" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Section</label>
                    <Input name="section" placeholder="A" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Room</label>
                    <Input name="room" placeholder="Room 1" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Capacity</label>
                    <Input type="number" name="capacity" min="1" placeholder="40" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : <Plus />}
                  {loading ? "Saving..." : "Create Class"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
              <BookOpen className="text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Classes</p>
              <p className="text-2xl font-bold">{classes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
              <Users className="text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Students Assigned</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
              <DoorOpen className="text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Capacity</p>
              <p className="text-2xl font-bold">{totalCapacity || "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Register</CardTitle>
          <CardDescription>Classes available for student admission, exams, and attendance</CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No classes created yet</p>
              <p className="text-muted-foreground text-sm">Create your first class to unlock student admission.</p>
              <Button className="mt-4" onClick={() => setOpen(true)}>
                <Plus />
                Create Class
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">
                        {classItem.name}
                        {classItem.section ? ` - ${classItem.section}` : ""}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Level {classItem.level ?? "-"}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {classItem.room || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {classItem.capacity
                          ? `${classItem.studentCount} / ${classItem.capacity}`
                          : classItem.studentCount}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href="/madrasa/students">
                          <Button variant="ghost" size="sm">
                            <Users />
                            Students
                          </Button>
                        </Link>
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
