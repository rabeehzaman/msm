import { getCemeteryPlots } from "@/lib/queries/lifecycle";
import { CemeteryClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CemeteryPage() {
  const plots = await getCemeteryPlots();

  return <CemeteryClient plots={plots} />;
}
