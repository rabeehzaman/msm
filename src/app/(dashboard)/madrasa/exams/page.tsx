"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, Download, Calendar } from "lucide-react";

const exams = [
  { id: "E001", name: "Monthly Test - March", class: "Level 5", subject: "Quran Recitation", type: "Monthly Test", date: "2025-03-20", maxMarks: 50, avgMarks: 38, passRate: 92 },
  { id: "E002", name: "Term Exam - Fiqh", class: "Level 6", subject: "Fiqh", type: "Term Exam", date: "2025-03-18", maxMarks: 100, avgMarks: 72, passRate: 85 },
  { id: "E003", name: "Oral Recitation - Hifz", class: "Level 7 (Hifz)", subject: "Hifz", type: "Oral Recitation", date: "2025-03-15", maxMarks: 50, avgMarks: 44, passRate: 100 },
  { id: "E004", name: "Monthly Test - March", class: "Level 3", subject: "Arabic", type: "Monthly Test", date: "2025-03-14", maxMarks: 50, avgMarks: 35, passRate: 88 },
  { id: "E005", name: "Term Exam - Hadith", class: "Level 4", subject: "Hadith", type: "Term Exam", date: "2025-03-12", maxMarks: 100, avgMarks: 68, passRate: 82 },
  { id: "E006", name: "Written Exam - Tajweed", class: "Level 2", subject: "Tajweed", type: "Written Exam", date: "2025-03-10", maxMarks: 50, avgMarks: 40, passRate: 95 },
];

const gradeDistribution = [
  { grade: "A+", label: "90%+", count: 45, color: "bg-green-500" },
  { grade: "A", label: "80-89%", count: 78, color: "bg-green-400" },
  { grade: "B+", label: "70-79%", count: 120, color: "bg-blue-400" },
  { grade: "B", label: "60-69%", count: 95, color: "bg-yellow-400" },
  { grade: "C+", label: "50-59%", count: 52, color: "bg-orange-400" },
  { grade: "C", label: "40-49%", count: 28, color: "bg-red-400" },
  { grade: "F", label: "<40%", count: 12, color: "bg-red-600" },
];

const totalStudents = gradeDistribution.reduce((s, g) => s + g.count, 0);

export default function ExamsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams & Results</h1>
          <p className="text-muted-foreground">Create exams, enter grades, and generate report cards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText />
            Generate Report Cards
          </Button>
          <Dialog>
            <DialogTrigger render={<Button />}>
              <Plus />
              Create Exam
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
                <DialogDescription>Set up an exam for a class</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Exam Name</label>
                  <Input placeholder="e.g. Monthly Test - March" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Class</label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7].map(l => <SelectItem key={l} value={`l${l}`}>Level {l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quran">Quran Recitation</SelectItem>
                        <SelectItem value="tajweed">Tajweed</SelectItem>
                        <SelectItem value="hifz">Hifz</SelectItem>
                        <SelectItem value="arabic">Arabic</SelectItem>
                        <SelectItem value="hadith">Hadith</SelectItem>
                        <SelectItem value="fiqh">Fiqh</SelectItem>
                        <SelectItem value="aqeedah">Aqeedah</SelectItem>
                        <SelectItem value="seerah">Seerah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly Test</SelectItem>
                        <SelectItem value="term">Term Exam</SelectItem>
                        <SelectItem value="oral">Oral Recitation</SelectItem>
                        <SelectItem value="written">Written Exam</SelectItem>
                        <SelectItem value="final">Final Exam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Max Marks</label>
                    <Input type="number" placeholder="100" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input type="date" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Exam</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution (This Term)</CardTitle>
          <CardDescription>Overall grading across all classes and subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            {gradeDistribution.map((g) => (
              <div key={g.grade} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-sm font-bold">{g.count}</span>
                <div
                  className={`w-full rounded-t-md ${g.color}`}
                  style={{ height: `${(g.count / totalStudents) * 300}px`, minHeight: "20px" }}
                />
                <span className="text-xs font-semibold">{g.grade}</span>
                <span className="text-muted-foreground text-xs">{g.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exam List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exam Register</CardTitle>
              <CardDescription>All exams with results summary</CardDescription>
            </div>
            <Button variant="outline" size="sm"><Download className="size-4" /> Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {[1,2,3,4,5,6,7].map(l => <SelectItem key={l} value={`l${l}`}>Level {l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="term">Term</SelectItem>
                <SelectItem value="oral">Oral</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Max</TableHead>
                  <TableHead>Avg</TableHead>
                  <TableHead>Pass Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((e) => (
                  <TableRow key={e.id} className="cursor-pointer">
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell><Badge variant="outline">{e.class}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{e.subject}</TableCell>
                    <TableCell><Badge variant="secondary">{e.type}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </TableCell>
                    <TableCell className="text-sm">{e.maxMarks}</TableCell>
                    <TableCell className="font-medium">{e.avgMarks}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={e.passRate} className="h-2 w-16" />
                        <span className={`text-sm font-medium ${e.passRate >= 90 ? "text-green-600" : e.passRate >= 75 ? "text-yellow-600" : "text-red-500"}`}>
                          {e.passRate}%
                        </span>
                      </div>
                    </TableCell>
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
