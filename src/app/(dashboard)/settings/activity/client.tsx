"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/money/page-header";
import { formatDateTime, formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n/client";

type Row = {
  id: string;
  action: string;
  tableName: string | null;
  who: string | null;
  createdAt: Date;
  oldValue: unknown;
  newValue: unknown;
};

const labels: Record<string, string> = {
  cash_accounts: "Cash/Bank account",
  cash_transfers: "Transfer",
  app_users: "User access",
  rent_payments: "Rent payment",
  salary_payments: "Salary payment",
  expense_entries: "Expense",
  bills: "Bill",
  income_entries: "Collection",
  friday_collections: "Friday collection",
  subscription_payments: "Subscription payment",
  fee_payments: "Fee payment",
  maintenance_logs: "Maintenance",
};

function amountOf(row: Row) {
  const value = (row.newValue ?? row.oldValue) as { amount?: string; totalAmount?: string } | null;
  return value?.amount ?? value?.totalAmount ?? null;
}

export function ActivityClient({ rows }: { rows: Row[] }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Activity Log" subtitle="Who added, changed or deleted what, and when. The latest 200 changes." />
      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState message={t("Nothing recorded yet.")} />
          ) : (
            <ul className="divide-border flex flex-col divide-y">
              {rows.map((r) => {
                const amount = amountOf(r);
                return (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {t(labels[r.tableName ?? ""] ?? r.tableName ?? "")}
                        {amount ? ` · ${formatMoney(amount)}` : ""}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {r.who} · {formatDateTime(r.createdAt)}
                      </p>
                    </div>
                    <Badge variant={r.action === "delete" ? "destructive" : "secondary"}>
                      {t(r.action === "create" ? "Added" : r.action === "update" ? "Changed" : "Deleted")}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
