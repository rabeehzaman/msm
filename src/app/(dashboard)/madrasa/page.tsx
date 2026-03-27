import { getMadrasaStats, getClasses } from "@/lib/queries/madrasa";
import { MadrasaClient } from "./client";

export const dynamic = "force-dynamic";

export default async function MadrasaPage() {
  const [stats, classes] = await Promise.all([
    getMadrasaStats(),
    getClasses(),
  ]);

  return <MadrasaClient stats={stats} classes={classes} />;
}
