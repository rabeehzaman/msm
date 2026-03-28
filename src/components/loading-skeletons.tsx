import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function HeaderSkeleton({ hasAction = true }: { hasAction?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      {hasAction && <Skeleton className="h-9 w-32" />}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-7 w-16" />
      </CardContent>
    </Card>
  );
}

function StatCardsWithIconSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-1 h-7 w-20" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}

function SearchBarSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Skeleton className="h-9 flex-1" />
      <Skeleton className="h-9 w-[150px]" />
    </div>
  );
}

function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 border-b px-4 py-3">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${Math.floor(60 + Math.random() * 60)}px` }}
        />
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <SearchBarSkeleton />
        <div className="mt-4 rounded-md border">
          <div className="flex items-center gap-4 border-b bg-muted/50 px-4 py-3">
            {Array.from({ length: cols }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-16" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardsWithIconSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-4">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-44" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-lg" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <CardGridSkeleton count={4} />
    </div>
  );
}

export function TablePageSkeleton({
  statCards = 3,
  tableCols = 6,
  tableRows = 8,
}: {
  statCards?: number;
  tableCols?: number;
  tableRows?: number;
} = {}) {
  return (
    <div className="flex flex-col gap-6">
      <HeaderSkeleton />
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(statCards, 4)}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: statCards }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton rows={tableRows} cols={tableCols} />
    </div>
  );
}

export function OverviewPageSkeleton({
  statCards = 4,
  gridCards = 4,
}: {
  statCards?: number;
  gridCards?: number;
} = {}) {
  return (
    <div className="flex flex-col gap-6">
      <HeaderSkeleton />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: statCards }).map((_, i) => (
          <StatCardsWithIconSkeleton key={i} />
        ))}
      </div>
      <CardGridSkeleton count={gridCards} />
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-lg border p-4">
                <Skeleton className="size-8 rounded" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="flex gap-2 border-b pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-md" />
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <Skeleton className="h-9 w-24" />
        </CardContent>
      </Card>
    </div>
  );
}
