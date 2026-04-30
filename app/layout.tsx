import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";

export const metadata: Metadata = {
  title: "iso-life",
  description: "Personal life OS",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background text-foreground">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">

        {/* ── Desktop: shadcn sidebar layout (sidebar is fixed, gap div pushes content) ── */}
        <SidebarProvider className="hidden md:flex">
          <AppSidebar />
          <SidebarInset>
            {/* Collapse toggle header */}
            <header className="flex h-10 shrink-0 items-center px-3 border-b border-border">
              <SidebarTrigger />
            </header>
            {/* Page content */}
            <div className="flex-1 overflow-auto p-6">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>

        {/* ── Mobile: top bar + scrollable content + bottom tabs ── */}
        <div className="flex md:hidden flex-col min-h-screen">
          <MobileNav />
          <main className="flex-1 overflow-auto px-4 py-4 pb-28">
            {children}
          </main>
        </div>

      </body>
    </html>
  );
}
