"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, FileText, Calendar, Lock } from "lucide-react";

type Committee = {
  id: string;
  name: string;
  type: string;
  termStart: string | null;
  termEnd: string | null;
  isActive: boolean | null;
  [key: string]: unknown;
};

type Meeting = {
  id: string;
  title: string;
  type: string;
  date: string;
  agenda: string | null;
  minutes: string | null;
  minutesLocked: boolean | null;
  [key: string]: unknown;
};

export function GovernanceClient({
  committees,
  meetings,
}: {
  committees: Committee[];
  meetings: Meeting[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Governance</h1>
          <p className="text-muted-foreground">Committee management, meetings, and resolutions</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"><Shield className="size-5 text-blue-600" /></div><div><p className="text-muted-foreground text-sm">Committees</p><p className="text-2xl font-bold">{committees.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><FileText className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Meetings</p><p className="text-2xl font-bold">{meetings.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Calendar className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Approved Minutes</p><p className="text-2xl font-bold">{meetings.filter(m => m.status === "minutes_approved").length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Users className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Draft Minutes</p><p className="text-2xl font-bold">{meetings.filter(m => m.status === "minutes_draft").length}</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="committees">
        <TabsList>
          <TabsTrigger value="committees">Committees</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="committees">
          <Card>
            <CardHeader><CardTitle>Committees</CardTitle><CardDescription>All governing committees</CardDescription></CardHeader>
            <CardContent>
              {committees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground text-lg">No committees set up yet</p>
                  <p className="text-muted-foreground text-sm">Committee data will appear here once configured.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {committees.map(c => (
                    <div key={c.id} className="flex items-center gap-4 rounded-lg border p-4">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <Shield className="text-primary size-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-muted-foreground text-sm">{c.type || "Committee"}</p>
                        {(c.termStart || c.termEnd) && (
                          <p className="text-muted-foreground text-xs">
                            {c.termStart && `From ${c.termStart}`}{c.termEnd && ` to ${c.termEnd}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings">
          <Card>
            <CardHeader><CardTitle>Meeting Register</CardTitle><CardDescription>All meetings with minutes status</CardDescription></CardHeader>
            <CardContent>
              {meetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground text-lg">No meetings recorded yet</p>
                  <p className="text-muted-foreground text-sm">Meeting records will appear here.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Title</TableHead><TableHead>Date</TableHead><TableHead>Minutes</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {meetings.map(m => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.title || "Meeting"}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{m.date ? new Date(m.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-"}</TableCell>
                          <TableCell>
                            <Badge variant={m.status === "minutes_approved" ? "default" : "secondary"}>
                              {m.status === "minutes_approved" ? "Approved" : "Draft"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
