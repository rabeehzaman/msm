import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="page-stagger mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-8 md:py-8 [&>div]:gap-6 md:[&>div]:gap-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
