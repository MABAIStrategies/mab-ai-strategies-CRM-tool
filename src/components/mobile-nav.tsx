"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-lg font-semibold text-mab-navy">MAB CRM</p>
          <button onClick={onClose} className="text-mab-slate">
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
