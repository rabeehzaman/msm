import { getCollectionCategories } from "@/lib/queries/collections";
import { getExpenseCategories } from "@/lib/queries/expenses";
import { getFunds } from "@/lib/queries/finance";
import { CategoriesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [expense, collection, funds] = await Promise.all([getExpenseCategories(), getCollectionCategories(), getFunds()]);
  return <CategoriesClient expense={expense} collection={collection} funds={funds.map((f) => ({ id: f.id, name: f.name }))} />;
}
