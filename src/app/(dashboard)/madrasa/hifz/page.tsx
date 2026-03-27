import { getStudents } from "@/lib/queries/madrasa";
import { HifzClient } from "./client";

export const dynamic = "force-dynamic";

export default async function HifzPage() {
  const students = await getStudents();

  return <HifzClient students={students} />;
}
