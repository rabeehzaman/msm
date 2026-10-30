import { getActiveAccounts } from "@/lib/queries/accounts";
import { getCollectionCategories, getCollections } from "@/lib/queries/collections";
import { dateRange } from "@/lib/reports/helpers";
import { CollectionsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = dateRange(await searchParams, 1);
  const [entries, categories, accounts] = await Promise.all([
    getCollections(from, to),
    getCollectionCategories(),
    getActiveAccounts(),
  ]);
  return <CollectionsClient entries={entries} categories={categories} accounts={accounts} from={from} to={to} />;
}
