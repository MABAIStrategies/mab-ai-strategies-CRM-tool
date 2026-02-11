import "@/env.mjs";
import type { Metadata } from "next";

import Providers from "@/app/providers";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAB AI Strategies | Command Center",
  description: "MAB AI Strategies CRM command center powered by intelligent automation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-midnight">
        <Providers>
          <div className="relative flex min-h-screen">
            <div className="pointer-events-none absolute inset-0 bg-brand-radial opacity-90" />
            <Sidebar />
            <main className="relative flex flex-1 flex-col px-6 py-10 lg:px-10">
              <div className="mb-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-brand-gold/80">
                      MAB AI Strategies
                    </p>
                    <h1 className="text-3xl font-semibold text-brand-ivory">
                      Strategic CRM Command Center
                    </h1>
                  </div>
                  <div className="hidden items-center gap-3 rounded-full border border-brand-gold/20 bg-brand-deep/80 px-4 py-2 text-xs text-brand-ivory/70 lg:flex">
                    <span className="h-2 w-2 animate-glow rounded-full bg-brand-gold" />
                    Live intelligence syncing
                  </div>
                </div>
                <TopBar />
              </div>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
