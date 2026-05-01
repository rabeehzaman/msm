import { getClasses } from "@/lib/queries/madrasa";
import { ClassesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const classes = await getClasses();

  return <ClassesClient classes={classes} />;
}
