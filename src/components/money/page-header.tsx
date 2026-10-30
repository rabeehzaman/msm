"use client";

import { useT } from "@/lib/i18n/client";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const t = useT();
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{t(title)}</h1>
        {subtitle && <p className="page-subtitle">{t(subtitle)}</p>}
      </div>
      {children && <div className="no-print flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  caption,
  tone = "",
  icon: Icon,
}: {
  label: string;
  value: string;
  caption?: string;
  tone?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const t = useT();
  return (
    <div data-slot="card" className="glass flex items-start justify-between gap-2 rounded-2xl p-3 sm:gap-3 sm:p-4">
      <div className="min-w-0">
        <p className="text-muted-foreground text-sm font-medium">{t(label)}</p>
        <p className="font-heading mt-1 truncate text-xl leading-tight font-semibold tracking-tight sm:text-2xl">{value}</p>
        {caption && <p className="text-muted-foreground mt-1 text-xs">{caption}</p>}
      </div>
      {Icon && (
        <div className={`stat-icon max-sm:hidden ${tone}`}>
          <Icon className="size-5" />
        </div>
      )}
    </div>
  );
}
