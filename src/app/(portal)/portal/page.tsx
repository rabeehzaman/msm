import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { CreditCard, GraduationCap, FileText, Heart } from "lucide-react";
import Link from "next/link";

export default function FamilyPortalHome() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <div>
        <p className="text-lg font-bold">Assalamu Alaikum</p>
        <p className="text-muted-foreground text-sm">Welcome to the family portal</p>
      </div>

      <Card>
        <CardContent>
          <EmptyState message="No family records yet." />
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Payment History", href: "/portal/payments", icon: CreditCard, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          { label: "Certificates", href: "/portal/certificates", icon: FileText, color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
          { label: "Madrasa Progress", href: "/portal/madrasa", icon: GraduationCap, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
          { label: "Welfare", href: "/portal/welfare", icon: Heart, color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600" },
        ].map(link => (
          <Link key={link.label} href={link.href}>
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardContent className="flex flex-col items-center gap-2 pt-6 pb-4">
                <div className={`flex size-10 items-center justify-center rounded-lg ${link.color}`}>
                  <link.icon className="size-5" />
                </div>
                <span className="text-sm font-medium">{link.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
