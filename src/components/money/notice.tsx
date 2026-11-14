import { CircleAlert } from "lucide-react";

// A warning or a hard stop shown inside a popup before saving.
export function Notice({ tone = "warning", children }: { tone?: "warning" | "error"; children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className={`flex items-start gap-2 rounded-xl p-3 text-sm ${
        tone === "error" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-800 dark:text-amber-300"
      }`}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
