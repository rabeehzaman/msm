import { cn } from "@/lib/utils";

/** Eight-point star (Rub el Hizb) on an emerald tile, the MSM mark. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-emerald-600 to-teal-900 shadow-[0_6px_16px_-6px] shadow-emerald-950/60 ring-1 ring-inset ring-white/20",
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="size-[62%]">
        <defs>
          <linearGradient id="msm-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f5dc9a" />
            <stop offset="1" stopColor="#c9952f" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#msm-gold)" strokeWidth="2" strokeLinejoin="round">
          <rect x="7" y="7" width="18" height="18" rx="1.5" />
          <rect x="7" y="7" width="18" height="18" rx="1.5" transform="rotate(45 16 16)" />
        </g>
        <circle cx="16" cy="16" r="3.2" fill="url(#msm-gold)" />
      </svg>
    </span>
  );
}
