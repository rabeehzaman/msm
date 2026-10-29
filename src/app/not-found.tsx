import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-emerald-950 p-6">
      <Image
        src="/images/prayer-hall.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_60%] opacity-90"
      />
      <div className="absolute inset-0 bg-linear-to-b from-emerald-950/70 via-emerald-950/50 to-emerald-950/85" />
      <div className="glass-strong animate-rise relative flex max-w-md flex-col items-center gap-6 rounded-[1.75rem] p-8 text-center ring-1 ring-white/50 dark:ring-white/10">
        <div className="font-heading text-gradient-gold text-8xl font-semibold">404</div>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Page not found</h1>
          <p className="mt-2 text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_6px_18px_-8px] shadow-primary/60 hover:bg-primary/90"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/portal"
            className="inline-flex items-center rounded-xl border bg-white/60 px-4 py-2.5 text-sm font-medium hover:bg-white/90 dark:bg-white/5 dark:hover:bg-white/10"
          >
            Family Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
