import { getCollectionCategories } from "@/lib/queries/collections";
import { getExpenseCategories } from "@/lib/queries/expenses";
import { CategoriesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [expense, collection] = await Promise.all([getExpenseCategories(), getCollectionCategories()]);
  return <CategoriesClient expense={expense} collection={collection} />;
}
