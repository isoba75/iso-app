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
  { href: "/today",    label: "Today",    icon: "⌂" },
  { href: "/finance",  label: "Finance",  icon: "◈" },
  { href: "/projects", label: "Projects", icon: "▤" },
  { href: "/capture",  label: "Capture",  icon: "✦" },
  { href: "/missions", label: "Missions", icon: "⟶" },
  { href: "/habits",   label: "Habits",   icon: "◎" },
];

const secondaryLinks = [
  { href: "/routines", label: "Routines", icon: "◷" },
];

export function AppSidebar() {
  const path = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-3">
        <span
          className="text-sm font-bold tracking-tight"
          style={{ color: "var(--accent-green, #7dd870)" }}
        >
          iso-life
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainLinks.map(({ href, label, icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={path.startsWith(href)}
                    tooltip={label}
                    render={
                      <Link href={href}>
                        <span className="text-base">{icon}</span>
                        <span>{label}</span>
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
              {secondaryLinks.map(({ href, label, icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={path.startsWith(href)}
                    tooltip={label}
                    render={
                      <Link href={href}>
                        <span className="text-base">{icon}</span>
                        <span>{label}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <span className="text-base">⎋</span>
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
