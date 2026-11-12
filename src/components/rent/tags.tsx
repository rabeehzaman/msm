"use client";

import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/client";

export function VariableTag() {
  const t = useT();
  return (
    <Badge variant="outline" className="h-4 border-amber-400/60 px-1.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
      {t("Variable")}
    </Badge>
  );
}

export function UnsetNote({ count }: { count: number }) {
  const t = useT();
  return (
    <Link
      href="/rent/variable"
      className="flex items-center gap-2 self-start rounded-full bg-amber-500/10 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
    >
      <CircleAlert className="size-4" />
      {t("{n} variable rooms – this month's rent not set", { n: count })}
    </Link>
  );
}
