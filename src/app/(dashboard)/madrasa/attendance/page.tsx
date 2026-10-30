import { getClasses } from "@/lib/queries/madrasa";
import { getClassRegister } from "@/lib/queries/fees";
import { todayIST } from "@/lib/format";
import { AttendanceClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; date?: string }>;
}) {
  const params = await searchParams;
  const classes = await getClasses();
  const classId = classes.find((c) => c.id === params.class)?.id ?? classes[0]?.id ?? "";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params.date ?? "") ? params.date! : todayIST();
  const register = classId ? await getClassRegister(classId, date) : { students: [], saved: false, absent: [] };
  return <AttendanceClient key={`${classId}-${date}`} classes={classes} classId={classId} date={date} register={register} />;
}
