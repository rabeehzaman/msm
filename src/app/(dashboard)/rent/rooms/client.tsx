"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, SaveButton, useAction } from "@/components/money/form";
import { PageHeader } from "@/components/money/page-header";
import { saveBuilding, saveFloor, saveRoom } from "@/lib/actions/rent";
import { useSession } from "@/lib/auth/session";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n/client";

type Tree = {
  id: string;
  name: string;
  floors: {
    id: string;
    name: string;
    rooms: { id: string; name: string; tenantName: string | null; shopName: string | null; rent: number | null }[];
  }[];
}[];

type Edit =
  | { kind: "building"; id?: string; name?: string }
  | { kind: "floor"; id?: string; name?: string; buildingId?: string }
  | { kind: "room"; id?: string; name?: string; floorId?: string };

export function RoomsClient({ tree }: { tree: Tree }) {
  const t = useT();
  const { isAdmin } = useSession();
  const [edit, setEdit] = useState<Edit | null>(null);

  const editButton = (target: Edit, label: string) =>
    isAdmin && (
      <Button variant="ghost" size="sm" onClick={() => setEdit(target)}>
        {target.id ? <Pencil className="size-3.5" /> : <Plus className="size-3.5" />}
        {t(label)}
      </Button>
    );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Rooms & Tenants" subtitle="Buildings, floors and rooms. Tap a room for its tenant, rent and calendar.">
        {isAdmin && (
          <Button onClick={() => setEdit({ kind: "building" })}>
            <Plus className="size-4" />
            {t("Add building")}
          </Button>
        )}
      </PageHeader>

      {tree.map((building) => (
        <Card key={building.id}>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2">
              {building.name}
              <span className="flex gap-1">
                {editButton({ kind: "building", id: building.id, name: building.name }, "Rename")}
                {editButton({ kind: "floor", buildingId: building.id }, "Add floor")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {building.floors.map((floor) => (
              <div key={floor.id} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-primary text-sm font-semibold">{floor.name}</p>
                  <span className="flex gap-1">
                    {editButton({ kind: "floor", id: floor.id, name: floor.name }, "Rename")}
                    {editButton({ kind: "room", floorId: floor.id }, "Add room")}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {floor.rooms.map((room) => (
                    <Link
                      key={room.id}
                      href={`/rent/rooms/${room.id}`}
                      className="hover:border-primary/40 flex items-center justify-between gap-2 rounded-xl border p-3 transition-colors"
                    >
                      <span className="min-w-0">
                        <span className="block font-medium">{room.name}</span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {room.tenantName
                            ? [room.tenantName, room.shopName].filter(Boolean).join(" · ")
                            : t("No tenant")}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {room.tenantName ? (
                          <Badge>{formatMoney(room.rent)}</Badge>
                        ) : (
                          <Badge variant="secondary">{t("Vacant")}</Badge>
                        )}
                        <ChevronRight className="text-muted-foreground size-4" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {edit && <NameDialog edit={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function NameDialog({ edit, onClose }: { edit: Edit; onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const action = edit.kind === "building" ? saveBuilding : edit.kind === "floor" ? saveFloor : saveRoom;
  const save = useAction(action, {
    success: "Saved",
    onDone: () => {
      onClose();
      router.refresh();
    },
  });
  const noun = edit.kind === "building" ? "building" : edit.kind === "floor" ? "floor" : "room";
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(`${edit.id ? "Rename" : "Add"} ${noun}`)}</DialogTitle>
        </DialogHeader>
        <form action={save.call} className="flex flex-col gap-4">
          {edit.id && <input type="hidden" name="id" value={edit.id} />}
          {edit.kind === "floor" && edit.buildingId && <input type="hidden" name="buildingId" value={edit.buildingId} />}
          {edit.kind === "room" && edit.floorId && <input type="hidden" name="floorId" value={edit.floorId} />}
          <Field label={t("Name")}>
            <Input name="name" defaultValue={edit.name} required />
          </Field>
          <SaveButton pending={save.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
