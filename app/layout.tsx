import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "iso-life",
  description: "Personal life OS",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="bg-background text-foreground">
          {children}
        </body>
      </html>
    );
  }

  const user = {
    name: session.user?.name ?? "Ismaila",
    email: session.user?.email ?? "",
    avatar: session.user?.image ?? "",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <TooltipProvider>
          {/* Desktop: dashboard-01 sidebar layout */}
          <SidebarProvider
            className="hidden md:flex"
            style={{
              "--sidebar-width": "calc(var(--spacing) * 56)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
          >
            <AppSidebar variant="inset" user={user} />
            <SidebarInset>
              <SiteHeader title="iso-life" />
              {children}
            </SidebarInset>
          </SidebarProvider>

          {/* Mobile: top bar + bottom tabs */}
          <div className="flex md:hidden flex-col min-h-screen">
            <MobileNav />
            <main className="flex-1 overflow-auto px-4 py-4 pb-28">
              {children}
            </main>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
