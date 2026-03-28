import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="text-8xl font-bold text-muted-foreground/30">404</div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
          <p className="mt-2 text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/portal"
            className="inline-flex items-center rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Family Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
