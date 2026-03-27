import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Shield, Users, FileText, Calendar, Lock } from "lucide-react";

const committeeMembers = [
  { name: "Haji Abdul Kareem", role: "President (Sadr)", since: "2023", phone: "+91 94567 00001" },
  { name: "Mohammed Basheer P", role: "Secretary", since: "2023", phone: "+91 94567 00002" },
  { name: "Ahmed K M", role: "Joint Secretary", since: "2023", phone: "+91 94567 00003" },
  { name: "Kunju Mohammed", role: "Treasurer (Khazin)", since: "2023", phone: "+91 94567 00004" },
  { name: "Imam Yusuf Ali", role: "Imam / Khatib", since: "2020", phone: "+91 94567 00005" },
  { name: "Rashid K", role: "Committee Member", since: "2023", phone: "+91 94567 00006" },
  { name: "Haris P K", role: "Committee Member", since: "2023", phone: "+91 94567 00007" },
  { name: "Aslam K M", role: "Youth Sub-Committee Head", since: "2024", phone: "+91 94567 00008" },
];

const meetings = [
  { id: "M-024", title: "Monthly Executive Meeting - March", type: "Executive Committee", date: "2025-03-20", attendees: 8, status: "minutes_approved", locked: true },
  { id: "M-023", title: "Madrasa Review Meeting", type: "Sub-Committee", date: "2025-03-15", attendees: 5, status: "minutes_approved", locked: true },
  { id: "M-022", title: "Budget Review - Q3", type: "Executive Committee", date: "2025-03-10", attendees: 10, status: "minutes_draft", locked: false },
  { id: "M-021", title: "Annual General Body Meeting", type: "General Body", date: "2025-02-28", attendees: 156, status: "minutes_approved", locked: true },
  { id: "M-020", title: "Building Fund Discussion", type: "Sub-Committee", date: "2025-02-20", attendees: 6, status: "minutes_approved", locked: true },
];

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function GovernancePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Governance</h1>
          <p className="text-muted-foreground">Committee management, meetings, and resolutions</p>
        </div>
        <Button><Plus /> Schedule Meeting</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"><Shield className="size-5 text-blue-600" /></div><div><p className="text-muted-foreground text-sm">Committee Size</p><p className="text-2xl font-bold">12</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Users className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Sub-Committees</p><p className="text-2xl font-bold">5</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><FileText className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Meetings (FY)</p><p className="text-2xl font-bold">24</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Calendar className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Term Ends</p><p className="text-2xl font-bold">Dec 2025</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="committee">
        <TabsList>
          <TabsTrigger value="committee">Committee</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="committee">
          <Card>
            <CardHeader><CardTitle>Executive Committee (2023-2025)</CardTitle><CardDescription>Current governing body members</CardDescription></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {committeeMembers.map(m => (
                  <div key={m.name} className="flex items-center gap-4 rounded-lg border p-4">
                    <Avatar className="size-12">
                      <AvatarFallback>{getInitials(m.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-sm text-primary">{m.role}</p>
                      <p className="text-muted-foreground text-xs">Since {m.since} | {m.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings">
          <Card>
            <CardHeader><CardTitle>Meeting Register</CardTitle><CardDescription>All meetings with minutes status</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead>Attendees</TableHead><TableHead>Minutes</TableHead><TableHead></TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {meetings.map(m => (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono text-sm">{m.id}</TableCell>
                        <TableCell className="font-medium">{m.title}</TableCell>
                        <TableCell><Badge variant="outline">{m.type}</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(m.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</TableCell>
                        <TableCell className="text-sm">{m.attendees}</TableCell>
                        <TableCell>
                          <Badge variant={m.status === "minutes_approved" ? "default" : "secondary"}>
                            {m.status === "minutes_approved" ? "Approved" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>{m.locked && <Lock className="text-muted-foreground size-4" />}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
