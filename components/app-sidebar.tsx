"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const mainLinks = [
  { href: "/today",    label: "Today" },
  { href: "/finance",  label: "Finance" },
  { href: "/projects", label: "Projects" },
  { href: "/capture",  label: "Capture" },
  { href: "/missions", label: "Missions" },
  { href: "/habits",   label: "Habits" },
];

const secondaryLinks = [
  { href: "/routines", label: "Routines" },
];

export function AppSidebar() {
  const path = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 h-12 flex items-center border-b border-border">
        <span className="text-sm font-semibold text-foreground tracking-tight">
          iso<span style={{ color: "var(--accent-green)" }}>·</span>life
        </span>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainLinks.map(({ href, label }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={path.startsWith(href)}
                    tooltip={label}
                    render={
                      <Link href={href} className="text-sm">
                        {label}
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryLinks.map(({ href, label }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={path.startsWith(href)}
                    tooltip={label}
                    render={
                      <Link href={href} className="text-sm">
                        {label}
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4 border-t border-border pt-2">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-muted-foreground hover:text-foreground transition w-full text-left py-1"
        >
          Sign out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
