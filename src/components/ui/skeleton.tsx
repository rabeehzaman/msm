import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-lg bg-primary/8 dark:bg-white/8", className)}
      {...props}
    />
  )
}

export { Skeleton }
