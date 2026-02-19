import type { ReactNode } from "react";

import Sidebar from "@/components/layout/sidebar";
import TopCommandBar from "@/components/layout/top-command-bar";
import MobileDock from "@/components/layout/mobile-dock";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-mab-navy text-mab-ivory">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopCommandBar />
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
      <MobileDock />
    </div>
  );
}
