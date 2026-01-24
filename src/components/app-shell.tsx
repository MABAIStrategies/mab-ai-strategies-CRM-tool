"use client";

import { useState } from "react";
import { CommandPalette } from "./command-palette";
import { CommandPaletteProvider } from "./use-command-palette";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <CommandPaletteProvider>
      <div className="min-h-screen bg-mab-ivory">
        <TopBar onOpenMenu={() => setIsMobileNavOpen(true)} />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 px-6 pb-10 pt-8">{children}</main>
        </div>
        <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
        <CommandPalette />
      </div>
    </CommandPaletteProvider>
  );
}
