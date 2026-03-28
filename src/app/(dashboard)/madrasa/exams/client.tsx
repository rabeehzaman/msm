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
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, FileText, Loader2 } from "lucide-react";
import { createExam } from "@/lib/actions/madrasa";
import { toast } from "sonner";

type Exam = {
  id: string;
  name: string;
  type: string | null;
  date: string | null;
  maxMarks: number | null;
  className: string | null;
};

type ClassInfo = {
  id: string;
  name: string;
  level: number | null;
};

export function ExamsClient({
  exams,
  classes,
}: {
  exams: Exam[];
  classes: ClassInfo[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    try {
      await createExam(formData);
      toast.success("Exam created successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to create exam");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams & Results</h1>
          <p className="text-muted-foreground">Create exams, enter grades, and track results</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
              <Plus />
              Create Exam
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
                <DialogDescription>Set up an exam for a class</DialogDescription>
              </DialogHeader>
              <form action={handleCreate}>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Exam Name *</label>
                    <Input name="name" placeholder="e.g. Monthly Test - March" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Class</label>
                      <Select name="classId">
                        <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Type</label>
                      <Select name="type">
                        <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly_test">Monthly Test</SelectItem>
                          <SelectItem value="term_exam">Term Exam</SelectItem>
                          <SelectItem value="oral_recitation">Oral Recitation</SelectItem>
                          <SelectItem value="written_exam">Written Exam</SelectItem>
                          <SelectItem value="final_exam">Final Exam</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Max Marks</label>
                      <Input type="number" name="maxMarks" placeholder="100" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Date *</label>
                      <Input type="date" name="date" required />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading}>{loading ? <Loader2 className="size-4 animate-spin" /> : <Plus />} {loading ? "Saving..." : "Create Exam"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Exams</p><p className="text-2xl font-bold">{exams.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Classes</p><p className="text-2xl font-bold">{classes.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Monthly Tests</p><p className="text-2xl font-bold">{exams.filter(e => e.type === "monthly_test").length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Term Exams</p><p className="text-2xl font-bold">{exams.filter(e => e.type === "term_exam").length}</p></CardContent></Card>
      </div>

      {/* Exam List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exam Register</CardTitle>
              <CardDescription>All exams</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No exams created yet</p>
              <p className="text-muted-foreground text-sm">Create your first exam to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Max Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell><Badge variant="outline">{e.className || "All"}</Badge></TableCell>
                      <TableCell><Badge variant="secondary">{(e.type || "test").replace("_", " ")}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {e.date ? new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-"}
                      </TableCell>
                      <TableCell className="text-sm">{e.maxMarks || "-"}</TableCell>
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
