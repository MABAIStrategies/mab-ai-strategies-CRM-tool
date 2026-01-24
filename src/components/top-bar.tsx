"use client";

import { useCommandPalette } from "./use-command-palette";

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { open } = useCommandPalette();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/60 bg-white/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          className="rounded-full border border-mab-gold/40 bg-white px-3 py-2 text-sm font-medium text-mab-navy shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow lg:hidden"
        >
          ☰
        </button>
        <button
          type="button"
          onClick={open}
          aria-label="Open command palette"
          className="rounded-full border border-mab-gold/40 bg-white px-4 py-2 text-sm font-medium text-mab-navy shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow"
        >
          ⌘K Command
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.35em] text-mab-gold">Operator</p>
          <p className="text-sm font-semibold text-mab-navy">MAB Strategist</p>
        </div>
        <img
          src="/branding/mab-headshot.svg"
          alt="Professional headshot"
          className="h-10 w-10 rounded-full border-2 border-mab-gold object-cover"
        />
      </div>
    </header>
  );
}
