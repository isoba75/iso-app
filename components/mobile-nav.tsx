"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const primaryTabs = [
  { href: "/today",    label: "Today",    icon: "⌂" },
  { href: "/capture",  label: "Capture",  icon: "✦" },
  { href: "/feed",     label: "Feed",     icon: "≡" },
  { href: "/finance",  label: "Finance",  icon: "◈" },
];

const moreLinks = [
  { href: "/projects", label: "Projects", icon: "▤" },
  { href: "/routines", label: "Routines", icon: "◷" },
];

export function MobileNav() {
  const path = usePathname();

  return (
    <>
      {/* Mobile top bar */}
      <nav className="flex md:hidden sticky top-0 z-50 px-4 h-11 items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50">
        <span className="text-sm font-bold tracking-tight text-[#7dd870]">
          iso·life
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition"
        >
          Sign out
        </button>
      </nav>

      {/* Floating Apple-style bottom tab bar */}
      <div
        className="fixed z-50 flex md:hidden"
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 12px)",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 32px)",
          maxWidth: "420px",
        }}
      >
        <nav
          className="flex-1 flex items-center rounded-2xl px-1 py-1 gap-0.5"
          style={{
            background: "rgba(24, 24, 27, 0.82)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset, 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          {primaryTabs.map(({ href, label, icon }) => {
            const active = path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 rounded-xl transition-all"
                style={{
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  color: active ? "#7dd870" : "rgba(255,255,255,0.45)",
                }}
              >
                <span className="text-xl leading-none">{icon}</span>
                <span
                  className="text-[11px] font-semibold tracking-wide"
                  style={{ color: active ? "#7dd870" : "rgba(255,255,255,0.4)" }}
                >
                  {label.toUpperCase()}
                </span>
              </Link>
            );
          })}

          {/* More */}
          <Sheet>
            <SheetTrigger
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 rounded-xl transition-all"
              style={{ color: "rgba(255,255,255,0.45)", background: "transparent", border: "none" }}
            >
              <span className="text-xl leading-none">···</span>
              <span className="text-[11px] font-semibold tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>
                MORE
              </span>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="rounded-t-2xl border-0"
              style={{
                background: "rgba(24, 24, 27, 0.95)",
                backdropFilter: "blur(20px)",
                paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
              }}
            >
              <div className="py-2 space-y-0.5">
                {moreLinks.map(({ href, label, icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition text-sm text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <span className="text-base w-6 text-center opacity-70">{icon}</span>
                    <span>{label}</span>
                  </Link>
                ))}
                <div className="pt-2 border-t border-white/10 mt-2">
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl transition text-sm text-white/40 hover:text-white/60 hover:bg-white/5"
                  >
                    <span className="text-base w-6 text-center">⎋</span>
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </>
  );
}
