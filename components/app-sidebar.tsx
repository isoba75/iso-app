"use client"

import * as React from "react"
import Link from "next/link"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  CalendarIcon,
  WalletIcon,
  FolderIcon,
  InboxIcon,
  ListChecksIcon,
  TimerIcon,
  Settings2Icon,
  CircleHelpIcon,
} from "lucide-react"

const navMain = [
  { title: "Today",    url: "/today",    icon: <CalendarIcon /> },
  { title: "Capture",  url: "/capture",  icon: <InboxIcon /> },
  { title: "Feed",     url: "/feed",     icon: <ListChecksIcon /> },
  { title: "Finance",  url: "/finance",  icon: <WalletIcon /> },
  { title: "Projects", url: "/projects", icon: <FolderIcon /> },
  { title: "Routines", url: "/routines", icon: <TimerIcon /> },
]

const navSecondary = [
  { title: "Settings", url: "#", icon: <Settings2Icon /> },
  { title: "Help",     url: "#", icon: <CircleHelpIcon /> },
]

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar: string }
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/today" />}
            >
              <span
                className="text-base font-semibold tracking-tight"
                style={{ color: "var(--accent-green)" }}
              >
                iso·life
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
