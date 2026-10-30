"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/money/page-header";
import { useT } from "@/lib/i18n/client";

type Item = { slug: string; title: string; description: string; group: string };

export function ReportsHub({ reports }: { reports: Item[] }) {
  const t = useT();
  const groups = [...new Set(reports.map((r) => r.group))];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reports" subtitle="Every report can be printed, saved as PDF or downloaded to Excel" />
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle>{t(group)}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {reports
                .filter((r) => r.group === group)
                .map((r) => (
                  <Link
                    key={r.slug}
                    href={`/reports/${r.slug}`}
                    className="hover:bg-primary/5 flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{t(r.title)}</span>
                      <span className="text-muted-foreground block text-xs">{t(r.description)}</span>
                    </span>
                    <ArrowRight className="text-muted-foreground size-4 shrink-0" />
                  </Link>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
