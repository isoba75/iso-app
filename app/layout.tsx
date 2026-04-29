import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "iso-life",
  description: "Personal life OS",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
        {session && <Nav />}
        {/* pb-24 on mobile to clear fixed bottom nav */}
        <main className="max-w-5xl mx-auto px-4 py-6 pb-28 md:py-8 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
