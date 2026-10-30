"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Banknote, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";
import type { ActionResult } from "@/lib/money/action";

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="text-muted-foreground text-xs">{hint}</span>}
    </label>
  );
}

// Native on purpose: phones show their own easy picker.
export function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-input bg-white/65 px-3 text-base shadow-[inset_0_1px_2px] shadow-black/[0.03] backdrop-blur-sm transition-colors outline-none hover:border-primary/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-white/5 [&>option]:text-black",
        className,
      )}
      {...props}
    />
  );
}

export type AccountOption = { id: string; name: string; type: "cash" | "bank" };

// "Received/Paid via": every money form uses this, so nothing can skip choosing an account.
export function AccountPicker({
  accounts,
  label,
  name = "accountId",
  defaultValue,
}: {
  accounts: AccountOption[];
  label: string;
  name?: string;
  defaultValue?: string | null;
}) {
  const t = useT();
  const first = defaultValue ?? accounts.find((a) => a.type === "cash")?.id ?? accounts[0]?.id;
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        {accounts.map((a) => {
          const Icon = a.type === "cash" ? Banknote : Landmark;
          return (
            <label
              key={a.id}
              className="has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-input bg-white/50 px-3 py-2 text-sm font-medium transition-colors dark:bg-white/5"
            >
              <input type="radio" name={name} value={a.id} defaultChecked={a.id === first} required className="sr-only" />
              <Icon className="size-4 shrink-0" />
              <span className="min-w-0 truncate">{a.name}</span>
            </label>
          );
        })}
      </div>
      {accounts.length === 0 && (
        <p className="text-destructive text-sm">{t("Add a Cash or Bank account first.")}</p>
      )}
    </fieldset>
  );
}

// Runs a server action from a form or a button. Shows the reason on failure, and asks
// before saving anyway when the server gives a warning instead of a hard stop.
export function useAction<A extends unknown[], R = undefined>(
  action: (...args: A) => Promise<ActionResult<R>>,
  options?: { success?: string; onDone?: (data: R | undefined) => void },
) {
  const t = useT();
  const [pending, startTransition] = useTransition();
  const [lastError, setLastError] = useState<string | null>(null);

  function call(...args: A) {
    setLastError(null);
    startTransition(async () => {
      const result = await action(...args);
      if (result.ok) {
        if (options?.success) toast.success(t(options.success));
        options?.onDone?.(result.data);
      } else if (result.needsConfirm && args[0] instanceof FormData) {
        if (window.confirm(`${t(result.error)}\n\n${t("Save anyway?")}`)) {
          args[0].set("force", "1");
          call(...args);
        }
      } else {
        setLastError(result.error);
        toast.error(t(result.error));
      }
    });
  }
  return { pending, call, lastError };
}

export function SaveButton({
  pending,
  label = "Save",
  ...props
}: { pending: boolean; label?: string } & React.ComponentProps<typeof Button>) {
  const t = useT();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {t(pending ? "Saving..." : label)}
    </Button>
  );
}
