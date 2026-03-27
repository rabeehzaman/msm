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
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Clock, MapPin } from "lucide-react";
import { createEvent } from "@/lib/actions/lifecycle";
import { toast } from "sonner";

type Event = {
  id: string;
  title: string;
  type: string | null;
  description: string | null;
  date: string | null;
  venue: string | null;
  status: string | null;
};

const statusColors: Record<string, "default" | "secondary" | "outline"> = {
  scheduled: "default", draft: "outline", ongoing: "secondary", completed: "secondary", cancelled: "outline",
};

export function EventsClient({
  events,
}: {
  events: Event[];
}) {
  const [open, setOpen] = useState(false);

  const upcoming = events.filter(e => {
    if (!e.date) return true;
    return new Date(e.date) >= new Date(new Date().toDateString());
  });

  const past = events.filter(e => {
    if (!e.date) return false;
    return new Date(e.date) < new Date(new Date().toDateString());
  });

  async function handleCreate(formData: FormData) {
    try {
      await createEvent(formData);
      toast.success("Event created successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to create event");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events & Programs</h1>
          <p className="text-muted-foreground">Manage community events and programs</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}><Plus /> Create Event</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Schedule a community event or program</DialogDescription>
            </DialogHeader>
            <form action={handleCreate}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input name="title" placeholder="Event title" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Type *</label>
                    <Select name="type" required>
                      <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="religious">Religious</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="youth">Youth</SelectItem>
                        <SelectItem value="ramadan">Ramadan</SelectItem>
                        <SelectItem value="marriage">Marriage</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Date *</label>
                    <Input type="date" name="date" required />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Venue</label>
                  <Input name="venue" placeholder="Location" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea name="description" placeholder="Event details..." rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Create Event</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Events</p><p className="text-2xl font-bold">{events.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Upcoming</p><p className="text-2xl font-bold">{upcoming.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Past</p><p className="text-2xl font-bold">{past.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Scheduled</p><p className="text-2xl font-bold">{events.filter(e => e.status === "scheduled").length}</p></CardContent></Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader><CardTitle>All Events</CardTitle><CardDescription>Scheduled programs and activities</CardDescription></CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">No events yet</p>
              <p className="text-muted-foreground text-sm">Create your first event to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {events.map(e => (
                <div key={e.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex size-14 flex-col items-center justify-center rounded-lg bg-primary/10 text-center">
                    {e.date ? (
                      <>
                        <span className="text-primary text-xs font-medium">{new Date(e.date).toLocaleDateString("en-IN", { month: "short" })}</span>
                        <span className="text-primary text-xl font-bold">{new Date(e.date).getDate()}</span>
                      </>
                    ) : (
                      <span className="text-primary text-xs">TBD</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{e.title}</p>
                      <Badge variant={statusColors[e.status || "draft"] || "outline"}>{e.status || "draft"}</Badge>
                      {e.type && <Badge variant="outline">{e.type}</Badge>}
                    </div>
                    <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                      {e.venue && <span className="flex items-center gap-1"><MapPin className="size-3" /> {e.venue}</span>}
                      {e.description && <span className="truncate max-w-[300px]">{e.description}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
