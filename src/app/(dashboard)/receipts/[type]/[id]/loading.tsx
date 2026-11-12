import { Skeleton } from "@/components/ui/skeleton";

// Shown at once after a save opens its receipt, instead of waiting on the previous page.
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-[28rem] w-full rounded-2xl" />
    </div>
  );
}
