import { getStudents, getClasses } from "@/lib/queries/madrasa";
import { AttendanceClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const [students, classes] = await Promise.all([
    getStudents(),
    getClasses(),
  ]);

  return <AttendanceClient students={students} classes={classes} />;
}
