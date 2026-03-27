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
import { Plus, Search, Download } from "lucide-react";

const students = [
  { id: "S001", name: "Mohammed Faisal K", class: "Level 5", rollNo: "501", age: 12, parent: "Abdul Rahman K", house: "MH-001", attendance: 94, fee: "Paid", status: "active" },
  { id: "S002", name: "Aisha Beevi", class: "Level 3", rollNo: "302", age: 9, parent: "Basheer P", house: "MH-002", attendance: 88, fee: "Overdue", status: "active" },
  { id: "S003", name: "Hifzur Rahman", class: "Level 7 (Hifz)", rollNo: "701", age: 14, parent: "Kunju Mohammed P", house: "MH-003", attendance: 97, fee: "Paid", status: "active" },
  { id: "S004", name: "Safiya K", class: "Level 2", rollNo: "204", age: 8, parent: "Haris P K", house: "MH-005", attendance: 91, fee: "Paid", status: "active" },
  { id: "S005", name: "Abdul Basith", class: "Level 6", rollNo: "605", age: 13, parent: "Aslam K M", house: "MH-006", attendance: 72, fee: "Overdue", status: "active" },
  { id: "S006", name: "Mariyam N", class: "Level 4", rollNo: "403", age: 11, parent: "Najeeb K", house: "MH-008", attendance: 95, fee: "Waived", status: "active" },
  { id: "S007", name: "Fahad M", class: "Level 7 (Hifz)", rollNo: "702", age: 15, parent: "Faizal P", house: "MH-007", attendance: 98, fee: "Paid", status: "active" },
  { id: "S008", name: "Thanveer Ali", class: "Level 1", rollNo: "108", age: 6, parent: "Siddique Ali", house: "MH-004", attendance: 85, fee: "Paid", status: "inactive" },
];

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function StudentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage Madrasa student enrollment and profiles</p>
        </div>
        <Button><Plus /> New Admission</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Enrolled", value: "892" },
          { label: "New This Term", value: "38" },
          { label: "Hifz Program", value: "48" },
          { label: "Fee Defaulters", value: "23" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Directory</CardTitle>
              <CardDescription>All enrolled students with academic details</CardDescription>
            </div>
            <Button variant="outline" size="sm"><Download className="size-4" /> Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input placeholder="Search by name, roll number, or parent..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {[1,2,3,4,5,6,7].map(l => <SelectItem key={l} value={`l${l}`}>Level {l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll #</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">{getInitials(s.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{s.rollNo}</TableCell>
                    <TableCell><Badge variant="outline">{s.class}</Badge></TableCell>
                    <TableCell className="text-sm">{s.age}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{s.parent}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${s.attendance >= 90 ? "text-green-600" : s.attendance >= 75 ? "text-yellow-600" : "text-red-500"}`}>
                          {s.attendance}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.fee === "Paid" ? "default" : s.fee === "Overdue" ? "destructive" : "secondary"}>
                        {s.fee}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
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
