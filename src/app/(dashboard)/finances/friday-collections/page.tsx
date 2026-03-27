import { getFridayCollections } from "@/lib/queries/finance";
import { FridayCollectionsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function FridayCollectionsPage() {
  const collections = await getFridayCollections();

  return <FridayCollectionsClient collections={collections} />;
}
