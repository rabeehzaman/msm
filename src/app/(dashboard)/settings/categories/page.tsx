import { getCollectionCategories } from "@/lib/queries/collections";
import { getExpenseCategories } from "@/lib/queries/expenses";
import { getFunds } from "@/lib/queries/finance";
import { getIncomeHeads } from "@/lib/queries/other-income";
import { CategoriesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [expense, collection, funds, heads] = await Promise.all([
    getExpenseCategories(),
    getCollectionCategories(),
    getFunds(),
    getIncomeHeads(),
  ]);
  return (
    <CategoriesClient
      expense={expense}
      collection={collection}
      heads={heads}
      funds={funds.map((f) => ({ id: f.id, name: f.name }))}
    />
  );
}
