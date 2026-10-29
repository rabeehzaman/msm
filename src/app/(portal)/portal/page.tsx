import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { CreditCard, GraduationCap, FileText, Heart } from "lucide-react";
import Link from "next/link";

export default function FamilyPortalHome() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <section className="relative isolate overflow-hidden rounded-3xl shadow-glass-lg">
        <Image
          src="/images/prayer-hall.webp"
          alt="Sunlight streaming into a wooden prayer hall"
          fill
          priority
          sizes="(min-width: 512px) 512px, 100vw"
          className="-z-10 object-cover object-[center_55%]"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/80 via-black/35 to-black/10" />
        <div className="flex min-h-48 flex-col justify-end p-5 text-white">
          <p lang="ar" dir="rtl" className="text-left text-lg text-amber-200">ٱلسَّلَامُ عَلَيْكُمْ</p>
          <p className="font-heading text-2xl font-semibold">Assalamu Alaikum</p>
          <p className="text-sm text-white/80">Welcome to the family portal</p>
        </div>
      </section>

      <Card>
        <CardContent>
          <EmptyState message="No family records yet." />
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Payment History", href: "/portal/payments", icon: CreditCard, tone: "stat-icon-lagoon" },
          { label: "Certificates", href: "/portal/certificates", icon: FileText, tone: "" },
          { label: "Madrasa Progress", href: "/portal/madrasa", icon: GraduationCap, tone: "stat-icon-indigo" },
          { label: "Welfare", href: "/portal/welfare", icon: Heart, tone: "stat-icon-gold" },
        ].map(link => (
          <Link key={link.label} href={link.href}>
            <Card className="h-full cursor-pointer transition-transform duration-200 hover:-translate-y-0.5">
              <CardContent className="flex flex-col items-center gap-2.5 py-2 text-center">
                <div className={`stat-icon size-11 ${link.tone}`}>
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
