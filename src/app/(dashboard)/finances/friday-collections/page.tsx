import { getActiveAccounts } from "@/lib/queries/accounts";
import { getFridayEntries } from "@/lib/queries/collections";
import { FridayCollectionsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function FridayCollectionsPage() {
  const [collections, accounts] = await Promise.all([getFridayEntries(), getActiveAccounts()]);
  return <FridayCollectionsClient collections={collections} accounts={accounts} />;
}
