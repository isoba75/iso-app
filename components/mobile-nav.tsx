"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const primaryTabs = [
  { href: "/today",    label: "Today",    icon: "⌂" },
  { href: "/finance",  label: "Finance",  icon: "◈" },
  { href: "/capture",  label: "Capture",  icon: "✦" },
  { href: "/missions", label: "Missions", icon: "⟶" },
];

const moreLinks = [
  { href: "/habits",   label: "Habits",   icon: "◎" },
  { href: "/projects", label: "Projects", icon: "▤" },
  { href: "/routines", label: "Routines", icon: "◷" },
];

export function MobileNav() {
  const path = usePathname();

  return (
    <>
      {/* Mobile top bar */}
      <nav
        className="flex md:hidden sticky top-0 z-50 px-4 h-11 items-center justify-between"
        style={{
          background: "hsl(var(--background))",
          borderBottom: "1px solid hsl(var(--border))",
        }}
      >
        <span
          className="text-sm font-bold tracking-tight"
          style={{ color: "var(--accent-green, #7dd870)" }}
        >
          iso-life
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition"
        >
          Sign out
        </button>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
        style={{
          background: "hsl(var(--background))",
          borderTop: "1px solid hsl(var(--border))",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {primaryTabs.map(({ href, label, icon }) => {
          const active = path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition relative"
              style={{ color: active ? "var(--accent-green, #7dd870)" : "hsl(var(--muted-foreground))" }}
            >
              {active && (
                <span
                  className="absolute top-1 w-1 h-1 rounded-full"
                  style={{ background: "var(--accent-green, #7dd870)" }}
                />
              )}
              <span className="text-lg leading-none">{icon}</span>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}

        {/* More tab */}
        <Sheet>
          <SheetTrigger
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            <span className="text-lg leading-none">···</span>
            <span className="text-[10px] font-medium">More</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-xl" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
            <div className="py-4 space-y-1">
              {moreLinks.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition text-sm"
                >
                  <span className="text-base w-6 text-center">{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
              <div className="pt-2 border-t border-border mt-2">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-muted transition text-sm text-muted-foreground"
                >
                  <span className="text-base w-6 text-center">⎋</span>
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  );
}
