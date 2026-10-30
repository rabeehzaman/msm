"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Phone, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { ConfirmButton } from "@/components/money/confirm-button";
import { Field, NativeSelect, SaveButton, useAction } from "@/components/money/form";
import { PageHeader, StatCard } from "@/components/money/page-header";
import { PhotoButton, PhotoField } from "@/components/money/photo";
import { deleteStudent, saveStudent } from "@/lib/actions/students";
import { useSession } from "@/lib/auth/session";
import { formatDate, todayIST } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import { LEFT_STATUSES } from "@/lib/madrasa/fees";

type Student = {
  id: string;
  fullName: string;
  admissionNumber: string | null;
  gender: string | null;
  guardianName: string | null;
  houseAddress: string | null;
  photoPath: string | null;
  dateOfBirth: string | null;
  parentPhone: string | null;
  status: string;
  admissionDate: string | null;
  classId: string | null;
  className: string | null;
};

type ClassInfo = { id: string; name: string; section?: string | null };

export function StudentsClient({ students, classes }: { students: Student[]; classes: ClassInfo[] }) {
  const t = useT();
  const router = useRouter();
  const { canEnter, isAdmin } = useSession();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [editing, setEditing] = useState<Student | "new" | null>(null);
  const remove = useAction(deleteStudent, { success: "Student deleted", onDone: () => router.refresh() });
  const q = search.toLowerCase();
  const shown = students.filter(
    (s) =>
      (classFilter === "all" || s.classId === classFilter) &&
      (s.fullName.toLowerCase().includes(q) || (s.admissionNumber ?? "").toLowerCase().includes(q)),
  );
  const active = students.filter((s) => !LEFT_STATUSES.includes(s.status)).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Students" subtitle="Admission number, class, guardian and contact details.">
        {canEnter && (
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            {t("Add student")}
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active" value={String(active)} />
        <StatCard label="Left" value={String(students.length - active)} />
        <StatCard label="Classes" value={String(classes.length)} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            aria-label={t("Search student")}
            placeholder={t("Search student")}
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <NativeSelect aria-label={t("Class")} className="sm:w-52" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="all">{t("All classes")}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.section ? ` ${c.section}` : ""}
            </option>
          ))}
        </NativeSelect>
      </div>

      {shown.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState message={t("No students found.")} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading truncate text-lg font-semibold">{s.fullName}</p>
                    <p className="text-muted-foreground text-sm">
                      {[s.admissionNumber ? `#${s.admissionNumber}` : null, s.className].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Badge variant={LEFT_STATUSES.includes(s.status) ? "secondary" : "default"}>
                    {t(LEFT_STATUSES.includes(s.status) ? "Left" : "Active")}
                  </Badge>
                </div>
                {s.guardianName && <p className="text-sm">{s.guardianName}</p>}
                {s.houseAddress && <p className="text-muted-foreground text-sm">{s.houseAddress}</p>}
                <p className="text-muted-foreground text-xs">
                  {s.dateOfBirth ? `${t("Born")} ${formatDate(s.dateOfBirth)} · ` : ""}
                  {t("Admitted")} {formatDate(s.admissionDate)}
                </p>
                <div className="flex items-center gap-1">
                  {s.parentPhone && (
                    <Button variant="ghost" size="sm" render={<a href={`tel:${s.parentPhone}`} />}>
                      <Phone className="size-3.5" />
                      {s.parentPhone}
                    </Button>
                  )}
                  {s.photoPath && <PhotoButton path={s.photoPath} />}
                  {isAdmin && (
                    <>
                      <Button variant="ghost" size="icon" className="size-8" aria-label={t("Edit")} onClick={() => setEditing(s)}>
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmButton
                        title="Delete this student?"
                        description="This cannot be undone. If they have stopped coming, mark them as Left instead."
                        onConfirm={() => remove.call(s.id)}
                        trigger={
                          <Button variant="ghost" size="icon" className="size-8" aria-label={t("Delete")}>
                            <Trash2 className="size-4" />
                          </Button>
                        }
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editing && <StudentDialog student={editing === "new" ? null : editing} classes={classes} onClose={() => setEditing(null)} />}
    </div>
  );
}

function StudentDialog({ student, classes, onClose }: { student: Student | null; classes: ClassInfo[]; onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const save = useAction(saveStudent, {
    success: "Student saved",
    onDone: () => {
      onClose();
      router.refresh();
    },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t(student ? "Edit student" : "Add student")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save.submit} className="flex flex-col gap-4">
          {student && <input type="hidden" name="id" value={student.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Name")}>
              <Input name="fullName" defaultValue={student?.fullName} required />
            </Field>
            <Field label={t("Admission number")}>
              <Input name="admissionNumber" defaultValue={student?.admissionNumber ?? ""} />
            </Field>
            <Field label={t("Class / division")}>
              <NativeSelect name="classId" defaultValue={student?.classId ?? ""}>
                <option value="">{t("None")}</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.section ? ` ${c.section}` : ""}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label={t("Gender")}>
              <NativeSelect name="gender" defaultValue={student?.gender ?? ""}>
                <option value="">{t("Select")}</option>
                <option value="male">{t("Male")}</option>
                <option value="female">{t("Female")}</option>
              </NativeSelect>
            </Field>
            <Field label={t("Date of birth")}>
              <Input name="dateOfBirth" type="date" defaultValue={student?.dateOfBirth ?? ""} />
            </Field>
            <Field label={t("Admission date")}>
              <Input name="admissionDate" type="date" defaultValue={student?.admissionDate ?? todayIST()} />
            </Field>
            <Field label={t("Father / guardian name")}>
              <Input name="guardianName" defaultValue={student?.guardianName ?? ""} />
            </Field>
            <Field label={t("Phone")}>
              <Input name="parentPhone" type="tel" inputMode="tel" defaultValue={student?.parentPhone ?? ""} />
            </Field>
            <Field label={t("House / address")}>
              <Input name="houseAddress" defaultValue={student?.houseAddress ?? ""} />
            </Field>
            <Field label={t("Status")}>
              <NativeSelect name="status" defaultValue={student && LEFT_STATUSES.includes(student.status) ? "withdrawn" : "active"}>
                <option value="active">{t("Active")}</option>
                <option value="withdrawn">{t("Left")}</option>
              </NativeSelect>
            </Field>
          </div>
          <PhotoField folder="students" label={t(student?.photoPath ? "Replace the photo" : "Photo")} />
          <SaveButton pending={save.pending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
