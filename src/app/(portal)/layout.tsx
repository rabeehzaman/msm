import { Home, CreditCard, GraduationCap, Menu } from "lucide-react";
import Link from "next/link";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white/20 font-bold">M</div>
          <div>
            <p className="text-sm font-semibold">Mahallu Smart Manager</p>
            <p className="text-xs opacity-80">Family Portal</p>
          </div>
        </div>
        <button className="flex size-8 items-center justify-center rounded-lg bg-white/10">
          <Menu className="size-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="bg-background fixed bottom-0 left-0 right-0 z-50 border-t">
        <div className="flex items-center justify-around py-2">
          {[
            { label: "Home", href: "/portal", icon: Home },
            { label: "Payments", href: "/portal/payments", icon: CreditCard },
            { label: "Madrasa", href: "/portal/madrasa", icon: GraduationCap },
            { label: "More", href: "/portal/certificates", icon: Menu },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1 px-3 py-1 text-muted-foreground transition-colors hover:text-primary">
              <item.icon className="size-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
