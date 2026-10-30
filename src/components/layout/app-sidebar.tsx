"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Home,
  Wallet,
  GraduationCap,
  Heart,
  FileText,
  Bell,
  Calendar,
  Building2,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  ChevronUp,
  Landmark,
  MapPin,
  TrendingUp,
  CreditCard,
  Receipt,
  BookOpen,
  ClipboardCheck,
  BookMarked,
  Handshake,
  Droplets,
  Plane,
  Briefcase,
  Banknote,
  DoorOpen,
  KeyRound,
  HandCoins,
  Zap,
  Wrench,
} from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { useSession } from "@/lib/auth/session";
import { canOpenPath } from "@/lib/auth/access";

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Community",
    items: [
      { title: "Households", url: "/households", icon: Home },
      { title: "Members", url: "/members", icon: Users },
      { title: "Wards", url: "/wards", icon: MapPin },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Cash & Bank", url: "/cash-bank", icon: Banknote },
      { title: "Finance Overview", url: "/finances", icon: Wallet },
      { title: "Collections", url: "/finances/income", icon: TrendingUp },
      { title: "Expenses", url: "/finances/expenses", icon: CreditCard },
      { title: "KSEB & regular bills", url: "/bills", icon: Zap },
      { title: "Friday Collections", url: "/finances/friday-collections", icon: Landmark },
      { title: "Subscriptions", url: "/subscriptions", icon: Receipt },
      { title: "Zakat", url: "/finances/zakat", icon: Heart },
      { title: "Qard Hasan", url: "/finances/qard-hasan", icon: Handshake },
    ],
  },
  {
    label: "Buildings & Staff",
    items: [
      { title: "Rent", url: "/rent", icon: KeyRound },
      { title: "Rooms & Tenants", url: "/rent/rooms", icon: DoorOpen },
      { title: "Salaries", url: "/salaries", icon: HandCoins },
      { title: "Staff", url: "/salaries/staff", icon: Users },
      { title: "Maintenance", url: "/maintenance", icon: Wrench },
    ],
  },
  {
    label: "Education",
    items: [
      { title: "Madrasa Overview", url: "/madrasa", icon: GraduationCap },
      { title: "Classes", url: "/madrasa/classes", icon: BookOpen },
      { title: "Students", url: "/madrasa/students", icon: BookOpen },
      { title: "Attendance", url: "/madrasa/attendance", icon: ClipboardCheck },
      { title: "Hifz Tracker", url: "/madrasa/hifz", icon: BookMarked },
      { title: "Exams & Results", url: "/madrasa/exams", icon: FileText },
    ],
  },
  {
    label: "Lifecycle",
    items: [
      { title: "Marriages", url: "/marriages", icon: Heart },
      { title: "Deaths & Janazah", url: "/deaths", icon: FileText },
      { title: "Cemetery", url: "/cemetery", icon: MapPin },
      { title: "Hajj & Umrah", url: "/hajj", icon: Plane },
    ],
  },
  {
    label: "Services",
    items: [
      { title: "Welfare", url: "/welfare", icon: Handshake },
      { title: "Certificates", url: "/certificates", icon: FileText },
      { title: "Events", url: "/events", icon: Calendar },
      { title: "Blood Donors", url: "/directory/blood-donors", icon: Droplets },
      { title: "Professionals", url: "/directory/professionals", icon: Briefcase },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Announcements", url: "/announcements", icon: Bell },
      { title: "Assets", url: "/assets", icon: Building2 },
      { title: "Governance", url: "/governance", icon: Shield },
      { title: "Reports", url: "/reports", icon: BarChart3 },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

const allUrls = navGroups.flatMap((group) => group.items.map((item) => item.url));

// Highlight only the most specific nav entry that matches the current path.
function isNavActive(pathname: string, url: string) {
  const matches = (u: string) => pathname === u || pathname.startsWith(u + "/");
  if (!matches(url)) return false;
  return !allUrls.some((other) => other.length > url.length && matches(other));
}

export function AppSidebar() {
  const pathname = usePathname();
  const t = useT();
  const { name, email, role, isAdmin } = useSession();
  const groups = navGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => canOpenPath(role, item.url)) }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <BrandMark className="size-8" />
              <div className="grid flex-1 text-left leading-tight">
                <span className="font-heading truncate text-[0.95rem] font-semibold text-white">
                  Mahallu
                </span>
                <span className="truncate text-[0.7rem] tracking-wide text-sidebar-foreground/65">
                  Smart Manager
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{t(group.label)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isNavActive(pathname, item.url)}
                      tooltip={t(item.title)}
                    >
                      <item.icon />
                      <span>{t(item.title)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent"
                  />
                }
              >
                <Avatar className="size-8 ring-1 ring-sidebar-primary/40">
                  <AvatarFallback className="bg-sidebar-primary/15 text-sidebar-primary text-xs font-semibold">
                    {(name || "?").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    {email}
                  </span>
                </div>
                <ChevronUp className="ml-auto" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-56"
                side="top"
                align="start"
                sideOffset={4}
              >
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Badge variant="secondary" className="text-xs">
                    {t(role === "admin" ? "Admin" : role === "entry" ? "Entry user" : "View only")}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem render={<Link href="/settings" />}>
                      <Settings />
                      {t("Settings")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={async () => {
                    const { signOut } = await import("@/lib/actions/auth");
                    await signOut();
                  }}
                >
                  <LogOut />
                  {t("Sign out")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
