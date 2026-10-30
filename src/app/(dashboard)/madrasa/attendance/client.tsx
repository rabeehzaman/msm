"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { Field, NativeSelect, useAction } from "@/components/money/form";
import { PageHeader, StatCard } from "@/components/money/page-header";
import { saveRegister } from "@/lib/actions/students";
import { useT } from "@/lib/i18n/client";

type Register = {
  students: { id: string; fullName: string; admissionNumber: string | null }[];
  saved: boolean;
  absent: string[];
};

export function AttendanceClient({
  classes,
  classId,
  date,
  register,
}: {
  classes: { id: string; name: string; section: string | null }[];
  classId: string;
  date: string;
  register: Register;
}) {
  const t = useT();
  const router = useRouter();
  const [absent, setAbsent] = useState(new Set(register.absent));
  const save = useAction(saveRegister, { success: "Attendance saved", onDone: () => router.refresh() });
  const total = register.students.length;

  function go(nextClass: string, nextDate: string) {
    router.push(`/madrasa/attendance?class=${nextClass}&date=${nextDate}`);
  }

  function toggle(id: string) {
    const next = new Set(absent);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setAbsent(next);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Attendance" subtitle="Everyone is Present by default. Tap a student to mark them Absent.">
        <Button variant="outline" render={<Link href="/reports/attendance-monthly" />}>
          {t("Monthly report")}
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="flex flex-wrap gap-3">
          <Field label={t("Class")} className="w-full sm:w-56">
            <NativeSelect value={classId} onChange={(e) => go(e.target.value, date)}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.section ? ` ${c.section}` : ""}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t("Date")} className="w-full sm:w-44">
            <Input type="date" value={date} onChange={(e) => e.target.value && go(classId, e.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={String(total)} />
        <StatCard label="Present" value={String(total - absent.size)} />
        <StatCard label="Absent" value={String(absent.size)} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3">
          {classes.length === 0 ? (
            <EmptyState message={t("Add a class first.")} />
          ) : total === 0 ? (
            <EmptyState message={t("This class has no students.")} />
          ) : (
            <>
              {register.saved && <Badge variant="secondary" className="self-start">{t("Already saved. Saving again replaces it.")}</Badge>}
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {register.students.map((s) => {
                  const isAbsent = absent.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={isAbsent}
                      onClick={() => toggle(s.id)}
                      className={`flex min-h-12 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
                        isAbsent ? "border-red-500/60 bg-red-500/10" : "border-emerald-500/40 bg-emerald-500/10"
                      }`}
                    >
                      <span className="min-w-0 truncate font-medium">{s.fullName}</span>
                      <span className={`flex shrink-0 items-center gap-1 text-sm font-medium ${isAbsent ? "text-red-600" : "text-emerald-700 dark:text-emerald-400"}`}>
                        {isAbsent ? <X className="size-4" /> : <Check className="size-4" />}
                        {t(isAbsent ? "Absent" : "Present")}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Button className="self-start" disabled={save.pending} onClick={() => save.call(classId, date, [...absent])}>
                {t(save.pending ? "Saving..." : "Save attendance")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
