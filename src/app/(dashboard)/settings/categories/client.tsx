"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmButton } from "@/components/money/confirm-button";
import { NativeSelect, SaveButton, useAction } from "@/components/money/form";
import { PageHeader } from "@/components/money/page-header";
import { saveCollectionCategory } from "@/lib/actions/collections";
import { saveExpenseCategory } from "@/lib/actions/expenses";
import { deleteIncomeHead, saveIncomeHead } from "@/lib/actions/other-income";
import { useT } from "@/lib/i18n/client";
import type { ActionResult } from "@/lib/money/action";

type Category = { id: string; name: string; isActive: boolean; fundId?: string | null; entries?: number };
type Fund = { id: string; name: string };
type Save = (formData: FormData) => Promise<ActionResult<unknown>>;

export function CategoriesClient({
  expense,
  collection,
  heads,
  funds,
}: {
  expense: Category[];
  collection: Category[];
  heads: Category[];
  funds: Fund[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Categories" subtitle="Rename, add or hide the categories people choose from." />
      <div className="grid gap-4 md:grid-cols-2">
        <CategoryCard title="Collection categories" items={collection} save={saveCollectionCategory} funds={funds} />
        <CategoryCard title="Expense categories" items={expense} save={saveExpenseCategory} />
        <CategoryCard title="Other Income heads" items={heads} save={saveIncomeHead} deletable />
      </div>
    </div>
  );
}

function CategoryCard({
  title,
  items,
  save,
  funds,
  deletable,
}: {
  title: string;
  items: Category[];
  save: Save;
  funds?: Fund[];
  deletable?: boolean;
}) {
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
        {adding && <CategoryRow save={save} funds={funds} onDone={() => setAdding(false)} />}
        {items.map((c) => (
          <CategoryRow key={c.id} category={c} save={save} funds={funds} deletable={deletable} />
        ))}
      </CardContent>
    </Card>
  );
}

function CategoryRow({
  category,
  save,
  funds,
  onDone,
  deletable,
}: {
  category?: Category;
  save: Save;
  funds?: Fund[];
  onDone?: () => void;
  deletable?: boolean;
}) {
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
    <form onSubmit={action.submit} className="flex flex-wrap items-center gap-2">
      {category && <input type="hidden" name="id" value={category.id} />}
      <Input name="name" className="min-w-40 flex-1" defaultValue={category?.name} required aria-label={t("Name")} />
      {funds && (
        <NativeSelect
          name="fundId"
          aria-label={t("Fund")}
          className="w-auto min-w-36 flex-1"
          defaultValue={category?.fundId ?? funds.find((f) => f.name === "General Fund")?.id}
        >
          {funds.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </NativeSelect>
      )}
      {category && (
        <label className="flex shrink-0 items-center gap-1 text-xs">
          <input type="hidden" name="isActive" value="off" />
          <input type="checkbox" name="isActive" value="on" defaultChecked={category.isActive} className="size-4" />
          {t("Show")}
        </label>
      )}
      <SaveButton pending={action.pending} size="sm" />
      {/* Only a head with no entries can be deleted; one with entries can only be hidden. */}
      {deletable && category && category.entries === 0 && <DeleteHead id={category.id} />}
    </form>
  );
}

function DeleteHead({ id }: { id: string }) {
  const t = useT();
  const router = useRouter();
  const remove = useAction(deleteIncomeHead, { success: "Deleted", onDone: () => router.refresh() });
  return (
    <ConfirmButton
      title="Delete this head?"
      description="It has no entries. This is logged."
      onConfirm={() => remove.call(id)}
      trigger={
        <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={t("Delete")} disabled={remove.pending}>
          <Trash2 className="size-4" />
        </Button>
      }
    />
  );
}
