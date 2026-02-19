"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Calendar, FolderOpen, Search } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/workspace", label: "Workspace", icon: Briefcase, blurb: "Command center" },
  { href: "/today", label: "Today", icon: Calendar, blurb: "Daily pulse" },
  { href: "/assets", label: "Assets", icon: FolderOpen, blurb: "Sales library" },
  { href: "/search", label: "Search", icon: Search, blurb: "Memory vault" }
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-72 flex-col gap-8 border-r border-mab-gold/10 bg-mab-blue/80 px-6 py-8">
      <div className="flex items-center gap-3">
        <Image src="/mab-logo.svg" alt="MAB AI Strategies" width={180} height={52} />
      </div>
      <div className="rounded-3xl border border-mab-gold/10 bg-mab-blue-2/60 p-4 shadow-panel">
        <div className="flex items-center gap-4">
          <Image
            src="/headshot.svg"
            alt="Professional headshot"
            width={60}
            height={68}
            className="animate-float rounded-2xl border border-mab-gold/40"
          />
          <div>
            <p className="text-sm font-semibold text-mab-ivory">Avery Caldwell</p>
            <p className="text-xs text-mab-ivory/70">VP, Strategic Growth</p>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-xs text-mab-ivory/60">
          <p>Pipeline: 18 active accounts</p>
          <p>Next action: 2 discovery calls today</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map(({ href, label, icon: Icon, blurb }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 transition-all",
                active
                  ? "border-mab-gold/50 bg-mab-blue-2/80 shadow-glow"
                  : "hover:border-mab-gold/30 hover:bg-mab-blue-2/40"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-2xl border border-mab-gold/30 bg-mab-blue-2/50 text-mab-gold transition group-hover:shadow-glow",
                    active && "bg-mab-gold text-mab-blue"
                  )}
                >
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-mab-ivory">{label}</p>
                  <p className="text-xs text-mab-ivory/60">{blurb}</p>
                </div>
              </div>
              <span className="text-xs text-mab-gold/70">↵</span>
            </Link>
          );
        })}
      </nav>
      <div className="animate-pulse-soft rounded-2xl border border-mab-gold/20 bg-mab-blue-2/70 p-4 text-xs text-mab-ivory/70">
        <p className="font-semibold text-mab-ivory">Engagement tips</p>
        <p className="mt-2">Use ⌘K to open the command bar and jump anywhere.</p>
      </div>
    </aside>
  );
}
