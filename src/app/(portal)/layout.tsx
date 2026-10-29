import { Menu } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { PortalNav } from "@/components/portal/portal-nav";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 overflow-hidden border-b border-white/10 bg-emerald-950/85 text-white backdrop-blur-xl">
        <div className="absolute inset-0 bg-pattern opacity-15 mix-blend-screen" />
        <div className="relative mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <BrandMark className="size-9" />
            <div className="leading-tight">
              <p className="font-heading text-base font-semibold">Mahallu Smart Manager</p>
              <p className="text-xs tracking-wide text-amber-200/80">Family Portal</p>
            </div>
          </div>
          <button className="flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 transition-colors hover:bg-white/20">
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-stagger flex-1 p-4 pb-28">{children}</main>

      {/* Bottom Navigation */}
      <PortalNav />
    </div>
  );
}
