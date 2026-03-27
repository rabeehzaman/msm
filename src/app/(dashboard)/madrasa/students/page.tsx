import { getStudents, getClasses } from "@/lib/queries/madrasa";
import { StudentsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const [students, classes] = await Promise.all([
    getStudents(),
    getClasses(),
  ]);

  return <StudentsClient students={students} classes={classes} />;
}
