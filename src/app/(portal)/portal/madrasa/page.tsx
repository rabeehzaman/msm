import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Clock, BookOpen, Star, Flame } from "lucide-react";

const children = [
  {
    name: "Mohammed Faisal",
    class: "Level 5",
    rollNo: "501",
    attendance: 94,
    feeStatus: "Paid",
    recentGrades: [
      { subject: "Quran Recitation", grade: "A+", marks: "47/50" },
      { subject: "Fiqh", grade: "A", marks: "82/100" },
      { subject: "Arabic", grade: "B+", marks: "38/50" },
    ],
    recentAttendance: ["P", "P", "P", "A", "P", "P", "L", "P", "P", "P"],
    hifz: null,
  },
  {
    name: "Safiya Rahman",
    class: "Level 2",
    rollNo: "204",
    attendance: 91,
    feeStatus: "Paid",
    recentGrades: [
      { subject: "Quran Recitation", grade: "A", marks: "44/50" },
      { subject: "Tajweed", grade: "A+", marks: "48/50" },
      { subject: "Dua", grade: "A", marks: "42/50" },
    ],
    recentAttendance: ["P", "P", "E", "P", "P", "P", "P", "A", "P", "P"],
    hifz: { juzCompleted: 2, total: 30, streak: 15 },
  },
];

const statusIcon: Record<string, typeof CheckCircle2> = {
  P: CheckCircle2, A: XCircle, L: Clock, E: Clock,
};
const statusColor: Record<string, string> = {
  P: "text-green-500", A: "text-red-500", L: "text-yellow-500", E: "text-blue-500",
};

export default function PortalMadrasaPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-bold">Madrasa Progress</h1>

      <Tabs defaultValue={children[0].name}>
        <TabsList className="w-full">
          {children.map(c => (
            <TabsTrigger key={c.name} value={c.name} className="flex-1">{c.name.split(" ")[0]}</TabsTrigger>
          ))}
        </TabsList>

        {children.map(child => (
          <TabsContent key={child.name} value={child.name} className="flex flex-col gap-4">
            {/* Child Info */}
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <Avatar className="size-14">
                  <AvatarFallback className="text-lg">{child.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-bold">{child.name}</p>
                  <p className="text-muted-foreground text-sm">{child.class} | Roll #{child.rollNo}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="default">Fee: {child.feeStatus}</Badge>
                    <Badge variant={child.attendance >= 90 ? "default" : "secondary"}>{child.attendance}% Attendance</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance (Last 10 Days) */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Recent Attendance</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-1">
                  {child.recentAttendance.map((s, i) => {
                    const Icon = statusIcon[s];
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <Icon className={`size-6 ${statusColor[s]}`} />
                        <span className="text-muted-foreground text-[10px]">D{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Grades */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Recent Grades</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-2">
                {child.recentGrades.map(g => (
                  <div key={g.subject} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{g.subject}</p>
                      <p className="text-muted-foreground text-xs">{g.marks}</p>
                    </div>
                    <Badge variant={g.grade.startsWith("A") ? "default" : "secondary"} className="text-sm font-bold">{g.grade}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Hifz Progress (if applicable) */}
            {child.hifz && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Hifz Progress</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>Juz Memorized</span>
                        <span className="font-bold">{child.hifz.juzCompleted}/{child.hifz.total}</span>
                      </div>
                      <Progress value={(child.hifz.juzCompleted / child.hifz.total) * 100} className="h-3" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="size-4 text-orange-500" />
                      <span className="text-sm font-bold">{child.hifz.streak}d</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
