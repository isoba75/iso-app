"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Command", icon: "⌂" },
  { href: "/finance",   label: "Finance",  icon: "◈" },
  { href: "/capture",   label: "Capture",  icon: "✦" },
  { href: "/projects",  label: "Projects", icon: "▤" },
];

export function Nav() {
  const path = usePathname();

  return (
    <>
      {/* ── Desktop top nav ── */}
      <nav
        className="hidden md:flex sticky top-0 z-50"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-12 w-full">
          <span className="text-sm font-bold mr-4" style={{ color: "var(--accent)" }}>iso-life</span>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-md text-sm transition"
              style={{
                background: path.startsWith(href) ? "var(--surface2)" : "transparent",
                color: path.startsWith(href) ? "var(--text)" : "var(--muted)",
              }}
            >
              {label}
            </Link>
          ))}
          <div className="ml-auto">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs px-3 py-1.5 rounded-md transition hover:opacity-80"
              style={{ color: "var(--muted)" }}
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile top bar (logo + sign out only) ── */}
      <nav
        className="flex md:hidden sticky top-0 z-50 px-4 h-11 items-center justify-between"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
      >
        <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>iso-life</span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs px-3 py-1.5 rounded-md"
          style={{ color: "var(--muted)" }}
        >
          Sign out
        </button>
      </nav>

      {/* ── Mobile bottom tab bar (iOS style) ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {links.map(({ href, label, icon }) => {
          const active = path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition"
              style={{ color: active ? "var(--accent)" : "var(--muted)" }}
            >
              <span className="text-lg leading-none">{icon}</span>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
