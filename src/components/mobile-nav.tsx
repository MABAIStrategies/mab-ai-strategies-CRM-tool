"use client";

import Link from "next/link";
import { useBrandingAssets } from "./use-branding-assets";
<<<<<<< codex/connect-mcp-to-fetch-brand-assets-rim7ae
=======
import { usePathname } from "next/navigation";
>>>>>>> main

const navItems = [
  { href: "/today", label: "Today" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/companies", label: "Companies" },
  { href: "/contacts", label: "Contacts" },
  { href: "/outreach", label: "Outreach" },
  { href: "/workspace", label: "Workspace" },
  { href: "/assets", label: "Assets" },
  { href: "/search", label: "Search" },
  { href: "/finish-line", label: "Finish Line" }
];

export function MobileNav({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { assets } = useBrandingAssets();
<<<<<<< codex/connect-mcp-to-fetch-brand-assets-rim7ae
=======
  const pathname = usePathname();
>>>>>>> main

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-mab-navy/70 backdrop-blur lg:hidden">
      <div className="flex h-full flex-col bg-mab-ivory px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={assets.logo.primary.uri}
              alt="MAB AI Strategies logo"
              className="h-10 w-10"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">MAB AI</p>
              <p className="text-lg font-semibold text-mab-navy">Strategies CRM</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-full border border-mab-gold/40 px-3 py-1 text-xs text-mab-navy"
          >
            Close
          </button>
        </div>
        <nav className="space-y-1 text-sm">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`block rounded-xl px-4 py-2.5 transition ${
                  active
                    ? "bg-mab-navy text-white"
                    : "text-mab-slate hover:bg-mab-navy/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="mt-6 w-full rounded-xl px-4 py-2 text-left text-xs text-mab-slate transition hover:bg-red-50 hover:text-red-600"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
