"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { Fragment, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { BrandMark } from "@/components/brand";

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, index + 1).join("/"),
    isLast: index === segments.length - 1,
  }));
}

export function Header() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const { resolvedTheme, setTheme } = useTheme();
  // Theme is only known on the client; render the moon icon until mounted.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white/50 bg-background/55 px-4 shadow-[0_1px_0_0] shadow-black/[0.03] backdrop-blur-2xl backdrop-saturate-150 md:px-6 dark:border-white/5 dark:bg-background/50">
      <SidebarTrigger className="-ml-1 rounded-lg" />
      <Separator orientation="vertical" className="mr-1 hidden h-5 md:block" />
      <div className="flex items-center gap-2 md:hidden">
        <BrandMark className="size-7" />
        <span className="font-heading text-base font-semibold">Mahallu</span>
      </div>

      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, i) => (
            <Fragment key={crumb.href}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href} className="hover:text-primary">
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1 rounded-full border border-white/60 bg-white/50 p-1 shadow-glass backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon" className="size-8 rounded-full" />}>
            <Search className="size-4" />
            <span className="sr-only">Search</span>
          </TooltipTrigger>
          <TooltipContent>Search (Cmd+K)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon" className="relative size-8 rounded-full" />}>
            <Bell className="size-4" />
            <Badge className="absolute -top-0.5 -right-0.5 size-4 justify-center rounded-full bg-gold p-0 text-[10px] font-semibold text-gold-foreground ring-2 ring-background">
              3
            </Badge>
            <span className="sr-only">Notifications</span>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                onClick={() => setTheme(isDark ? "light" : "dark")}
              />
            }
          >
            {isDark ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </TooltipTrigger>
          <TooltipContent>Toggle theme</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
