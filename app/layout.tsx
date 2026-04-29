import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "iso-life",
  description: "Personal life OS",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f0f0f] text-[#e8e8e8]">
        {session && <Nav />}
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
