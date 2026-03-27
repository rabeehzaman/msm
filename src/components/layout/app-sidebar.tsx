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
} from "lucide-react";

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
      { title: "Finance Overview", url: "/finances", icon: Wallet },
      { title: "Income", url: "/finances/income", icon: TrendingUp },
      { title: "Expenses", url: "/finances/expenses", icon: CreditCard },
      { title: "Friday Collections", url: "/finances/friday-collections", icon: Landmark },
      { title: "Subscriptions", url: "/subscriptions", icon: Receipt },
      { title: "Zakat", url: "/finances/zakat", icon: Heart },
      { title: "Qard Hasan", url: "/finances/qard-hasan", icon: Handshake },
    ],
  },
  {
    label: "Education",
    items: [
      { title: "Madrasa Overview", url: "/madrasa", icon: GraduationCap },
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

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg font-bold">
                M
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  Mahallu Smart Manager
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  Community ERP
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={pathname.startsWith(item.url)}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
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
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin User</span>
                  <span className="text-muted-foreground truncate text-xs">
                    admin@mahallu.app
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
                    Super Admin
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/settings" />}>
                  <Settings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut />
                  Sign out
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
