import { getProfessionals } from "@/lib/queries/community";
import { ProfessionalsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ProfessionalsPage() {
  const professionals = await getProfessionals();

  return <ProfessionalsClient professionals={professionals} />;
}
