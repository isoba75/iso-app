"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "⌂ Command" },
  { href: "/finance",   label: "◈ Finance"  },
  { href: "/capture",   label: "✦ Capture"  },
  { href: "/projects",  label: "▤ Projects" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="border-b border-[#2a2a2a] bg-[#0f0f0f] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-12">
        <span className="text-sm font-bold text-[#7dd870] mr-4">iso-life</span>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-md text-sm transition ${
              path.startsWith(href)
                ? "bg-[#1e1e1e] text-[#e8e8e8]"
                : "text-[#888] hover:text-[#e8e8e8]"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
