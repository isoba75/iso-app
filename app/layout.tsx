import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";

export const metadata: Metadata = {
  title: "iso-life",
  description: "Personal life OS",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
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
        {/* Desktop: sidebar layout */}
        <div className="hidden md:flex h-screen w-full overflow-hidden">
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex-1 overflow-auto">
              <header className="flex h-10 items-center px-4 border-b border-border shrink-0">
                <SidebarTrigger className="-ml-1" />
              </header>
              <main className="flex-1 overflow-auto p-6">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </div>

        {/* Mobile: top bar + bottom tabs */}
        <div className="flex md:hidden flex-col min-h-screen">
          <MobileNav />
          <main className="flex-1 px-4 py-4 pb-28">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
