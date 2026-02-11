"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCommandPalette } from "./use-command-palette";

const actions = [
  { label: "New Note", href: "/workspace" },
  { label: "New Deal", href: "/workspace" },
  { label: "Attach Asset", href: "/assets" },
  { label: "Generate Proposal", href: "/assets" },
  { label: "Search Memory", href: "/search" }
];

export function CommandPalette() {
  const { isOpen, close, open } = useCommandPalette();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
      if (event.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [close, open]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mab-navy/60 backdrop-blur">
      <div className="w-full max-w-xl rounded-2xl border border-mab-gold/40 bg-white p-6 shadow-glow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-mab-navy">Command Palette</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close command palette"
            className="rounded-full border border-mab-gold/40 px-3 py-1 text-xs text-mab-navy"
          >
            ESC
          </button>
        </div>
        <p className="mt-2 text-sm text-mab-slate">Jump to actions, instantly.</p>
        <div className="mt-4 grid gap-3">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center justify-between rounded-xl border border-mab-gold/20 px-4 py-3 text-sm text-mab-navy transition hover:-translate-y-0.5 hover:border-mab-gold hover:shadow-glow"
              onClick={close}
            >
              {action.label}
              <span className="text-xs text-mab-slate">Enter ↵</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
