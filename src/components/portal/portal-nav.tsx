"use client";

import { Home, CreditCard, GraduationCap, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/portal", icon: Home },
  { label: "Payments", href: "/portal/payments", icon: CreditCard },
  { label: "Madrasa", href: "/portal/madrasa", icon: GraduationCap },
  { label: "More", href: "/portal/certificates", icon: Menu },
];

export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="glass mx-auto flex max-w-lg items-center justify-around rounded-2xl p-1.5 ring-1 ring-white/60 dark:ring-white/10">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-muted-foreground transition-colors hover:text-primary",
                active && "bg-primary/10 text-primary"
              )}
            >
              <item.icon className="size-5" />
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
