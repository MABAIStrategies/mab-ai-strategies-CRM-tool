"use client";

import Link from "next/link";
import { useBrandingAssets } from "./use-branding-assets";

const navItems = [
  { href: "/today", label: "Today" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/companies", label: "Companies" },
  { href: "/contacts", label: "Contacts" },
  { href: "/outreach", label: "Outreach" },
  { href: "/workspace", label: "Workspace" },
  { href: "/companies", label: "Companies" },
  { href: "/contacts", label: "Contacts" },
  { href: "/deals", label: "Deals" },
  { href: "/tasks", label: "Tasks" },
  { href: "/assets", label: "Assets" },
  { href: "/search", label: "Search" },
  { href: "/finish-line", label: "Finish Line" }
 ] as const;

export function Sidebar() {
  const { assets } = useBrandingAssets();

  return (
    <aside className="hidden w-64 flex-col border-r border-white/60 bg-white/70 px-4 pb-6 pt-6 shadow-sm lg:flex">
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
      <nav className="mt-10 space-y-1 text-sm">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-xl px-4 py-2.5 transition ${
                active
                  ? "bg-mab-navy text-white"
                  : "text-mab-slate hover:bg-mab-navy/90 hover:text-white"
              }`}
            >
              {item.label}
              <span
                className={`h-2 w-2 rounded-full bg-mab-gold transition ${
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              />
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-3">
        <div className="rounded-2xl border border-mab-gold/30 bg-mab-navy px-4 py-4 text-sm text-white shadow-glow">
          <p className="font-medium">Compliance mode</p>
          <p className="mt-1 text-xs text-white/70">
            Outbound automation disabled. Confirmation required.
          </p>
        </div>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="w-full rounded-xl px-4 py-2 text-left text-xs text-mab-slate transition hover:bg-red-50 hover:text-red-600"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
