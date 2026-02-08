"use client";

import Link from "next/link";

const navItems = [
  { href: "/today", label: "Today" },
  { href: "/workspace", label: "Workspace" },
  { href: "/companies", label: "Companies" },
  { href: "/contacts", label: "Contacts" },
  { href: "/deals", label: "Deals" },
  { href: "/tasks", label: "Tasks" },
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
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-mab-navy/70 backdrop-blur lg:hidden">
      <div className="flex h-full flex-col bg-mab-ivory px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/branding/mab-logo.svg"
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
        <nav className="mt-10 space-y-3 text-base">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="block rounded-xl border border-mab-gold/20 bg-white px-4 py-3 text-mab-navy shadow-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-mab-gold/30 bg-mab-navy px-4 py-5 text-sm text-white shadow-glow">
          <p className="font-medium">Compliance mode</p>
          <p className="mt-1 text-xs text-white/70">Outbound automation disabled. Confirmation required.</p>
        </div>
      </div>
    </div>
  );
}
