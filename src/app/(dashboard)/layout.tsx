import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { getAppUser } from "@/lib/auth/guard";
import { SessionProvider } from "@/lib/auth/session";
import { LanguageProvider } from "@/lib/i18n/client";
import { getLang } from "@/lib/i18n/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appUser, lang] = await Promise.all([getAppUser(), getLang()]);
  if (!appUser?.role || !appUser.isActive) redirect("/no-access");
  const session = {
    name: appUser.displayName || appUser.email,
    email: appUser.email,
    role: appUser.role,
  };

  return (
    <LanguageProvider lang={lang}>
      <SessionProvider value={session}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <main className="page-stagger mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-8 md:py-8 [&>div]:gap-6 md:[&>div]:gap-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </SessionProvider>
    </LanguageProvider>
  );
}
