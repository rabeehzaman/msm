import { getMarriages } from "@/lib/queries/lifecycle";
import { MarriagesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function MarriagesPage() {
  const marriages = await getMarriages();

  return <MarriagesClient marriages={marriages} />;
}
