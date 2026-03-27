"use client";

import { useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, MapPin, Home, Trash2 } from "lucide-react";
import { createWard, deleteWard } from "@/lib/actions/wards";
import { toast } from "sonner";

type Ward = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  householdCount: number;
};

export function WardsClient({ wards }: { wards: Ward[] }) {
  const [open, setOpen] = useState(false);

  async function handleCreate(formData: FormData) {
    try {
      await createWard(formData);
      toast.success("Ward added");
      setOpen(false);
    } catch {
      toast.error("Failed to add ward");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ward "${name}"?`)) return;
    try {
      await deleteWard(id);
      toast.success("Ward deleted");
    } catch {
      toast.error("Failed to delete ward");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wards</h1>
          <p className="text-muted-foreground">Geographic ward management</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}><Plus /> Add Ward</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Ward</DialogTitle>
              <DialogDescription>Create a geographic ward division</DialogDescription>
            </DialogHeader>
            <form action={handleCreate}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Ward Name *</label>
                  <Input id="name" name="name" placeholder="e.g. Ward 1 - Juma Masjid" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="code" className="text-sm font-medium">Code</label>
                  <Input id="code" name="code" placeholder="e.g. W1" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Input id="description" name="description" placeholder="Area description" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit"><Plus /> Add Ward</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"><MapPin className="size-5 text-blue-600" /></div><div><p className="text-muted-foreground text-sm">Total Wards</p><p className="text-2xl font-bold">{wards.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Home className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Total Households</p><p className="text-2xl font-bold">{wards.reduce((s, w) => s + w.householdCount, 0)}</p></div></CardContent></Card>
      </div>

      {wards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="text-muted-foreground mb-4 size-12" />
            <p className="text-muted-foreground text-lg">No wards yet</p>
            <p className="text-muted-foreground text-sm">Add wards to organize households by geographic area.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {wards.map((w) => (
            <Card key={w.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg text-sm font-bold">
                      {w.code || w.name.charAt(0)}
                    </div>
                    <CardTitle className="text-base">{w.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(w.id, w.name)}>
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <Home className="text-muted-foreground size-4" />
                  <span>{w.householdCount} households</span>
                </div>
                {w.description && <p className="text-muted-foreground mt-2 text-xs">{w.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
