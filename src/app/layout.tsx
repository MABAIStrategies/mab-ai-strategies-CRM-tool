import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "@/app/providers";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export const metadata: Metadata = {
  title: "MAB AI Strategies CRM",
  description: "Local-first AI CRM cockpit for MAB AI Strategies"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen">
        <Providers>
          <div className="flex min-h-screen bg-mab-blue">
            <SidebarNav />
            <main className="flex-1 px-10 py-8">
              <div className="glow-divider h-px w-full" />
              <div className="mt-8">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
