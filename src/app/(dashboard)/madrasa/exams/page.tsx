import { getExams, getClasses } from "@/lib/queries/madrasa";
import { ExamsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const [exams, classes] = await Promise.all([
    getExams(),
    getClasses(),
  ]);

  return <ExamsClient exams={exams} classes={classes} />;
}
