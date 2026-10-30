"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SaveButton, useAction } from "@/components/money/form";
import { PageHeader } from "@/components/money/page-header";
import { saveCollectionCategory } from "@/lib/actions/collections";
import { saveExpenseCategory } from "@/lib/actions/expenses";
import { useT } from "@/lib/i18n/client";

type Category = { id: string; name: string; isActive: boolean };
type Save = (formData: FormData) => ReturnType<typeof saveExpenseCategory>;

export function CategoriesClient({ expense, collection }: { expense: Category[]; collection: Category[] }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Categories" subtitle="Rename, add or hide the categories people choose from." />
      <div className="grid gap-4 md:grid-cols-2">
        <CategoryCard title="Collection categories" items={collection} save={saveCollectionCategory} />
        <CategoryCard title="Expense categories" items={expense} save={saveExpenseCategory} />
      </div>
    </div>
  );
}

function CategoryCard({ title, items, save }: { title: string; items: Category[]; save: Save }) {
  const t = useT();
  const [adding, setAdding] = useState(false);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          {t(title)}
          <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-3.5" />
            {t("Add")}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {adding && <CategoryRow save={save} onDone={() => setAdding(false)} />}
        {items.map((c) => (
          <CategoryRow key={c.id} category={c} save={save} />
        ))}
      </CardContent>
    </Card>
  );
}

function CategoryRow({ category, save, onDone }: { category?: Category; save: Save; onDone?: () => void }) {
  const t = useT();
  const router = useRouter();
  const action = useAction(save, {
    success: "Saved",
    onDone: () => {
      onDone?.();
      router.refresh();
    },
  });
  return (
    <form action={action.call} className="flex items-center gap-2">
      {category && <input type="hidden" name="id" value={category.id} />}
      <Input name="name" defaultValue={category?.name} required aria-label={t("Name")} />
      {category && (
        <label className="flex shrink-0 items-center gap-1 text-xs">
          <input type="hidden" name="isActive" value="off" />
          <input type="checkbox" name="isActive" value="on" defaultChecked={category.isActive} className="size-4" />
          {t("Show")}
        </label>
      )}
      <SaveButton pending={action.pending} size="sm" />
    </form>
  );
}
