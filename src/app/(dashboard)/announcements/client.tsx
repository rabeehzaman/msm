"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Search, Bell, Clock } from "lucide-react";
import { createAnnouncement } from "@/lib/actions/lifecycle";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

type Announcement = {
  id: string;
  title: string;
  body: string | null;
  category: string | null;
  isPublished: boolean | null;
  publishedAt: Date | null;
  createdAt: Date | null;
};

export function AnnouncementsClient({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = announcements.filter((a) => {
    return !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.body && a.body.toLowerCase().includes(search.toLowerCase()));
  });

  const publishedCount = announcements.filter(a => a.isPublished).length;

  async function handleCreate(formData: FormData) {
    setLoading(true);
    try {
      try {
        await createAnnouncement(formData);
        toast.success("Announcement published successfully");
        setOpen(false);
      } catch {
        toast.error("Failed to create announcement");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">Create and manage community announcements</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}><Plus /> New Announcement</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
              <DialogDescription>Publish a community announcement</DialogDescription>
            </DialogHeader>
            <form action={handleCreate}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input name="title" placeholder="Announcement title" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input name="category" placeholder="e.g. Religious, Financial, Education" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Body *</label>
                  <Textarea name="body" placeholder="Announcement content..." rows={4} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? <Loader2 className="size-4 animate-spin" /> : null} {loading ? "Publishing..." : "Publish Announcement"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent><p className="text-muted-foreground text-sm">Total</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">{announcements.length}</p></CardContent></Card>
        <Card><CardContent><p className="text-muted-foreground text-sm">Published</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">{publishedCount}</p></CardContent></Card>
        <Card><CardContent><p className="text-muted-foreground text-sm">Draft</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">{announcements.length - publishedCount}</p></CardContent></Card>
        <Card><CardContent><p className="text-muted-foreground text-sm">Showing</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">{filtered.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>All Announcements</CardTitle><CardDescription>Community notices and updates</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input placeholder="Search announcements..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <p className="text-muted-foreground text-lg">No announcements yet</p>
              <p className="text-muted-foreground text-sm">{announcements.length === 0 ? "Create your first announcement." : "Try adjusting your search."}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map(a => (
                <div key={a.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                    <Bell className="text-primary size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{a.title}</p>
                      <Badge variant={a.isPublished ? "default" : "outline"}>
                        {a.isPublished ? "published" : "draft"}
                      </Badge>
                      {a.category && <Badge variant="outline">{a.category}</Badge>}
                    </div>
                    <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {a.publishedAt ? formatDate(a.publishedAt) : formatDate(a.createdAt)}
                      </span>
                      {a.body && <span className="truncate max-w-[400px]">{a.body}</span>}
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
