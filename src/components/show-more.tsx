"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/client";

// Draws a long list 50 rows at a time, so a phone is not asked to lay out hundreds of rows at once.
// Totals and counts on the page still use the whole list.
export function useShowMore<T>(items: T[], step = 50) {
  const t = useT();
  const [limit, setLimit] = useState(step);
  const visible = items.length > limit ? items.slice(0, limit) : items;
  const rest = items.length - visible.length;
  const button =
    rest > 0 ? (
      <div className="flex justify-center pt-3">
        <Button type="button" variant="outline" size="sm" onClick={() => setLimit((l) => l + step)}>
          <ChevronDown className="size-4" />
          {t("Show more")} ({rest})
        </Button>
      </div>
    ) : null;
  return { visible, button };
}
