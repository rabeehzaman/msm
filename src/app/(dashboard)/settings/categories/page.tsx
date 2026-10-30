import { getExpenseCategories } from "@/lib/queries/expenses";
import { CategoriesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const expense = await getExpenseCategories();
  return <CategoriesClient expense={expense} />;
}
