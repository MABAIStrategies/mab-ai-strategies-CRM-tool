"use client";

import { BarChart3, CalendarCheck, FolderOpen, Home, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import BrandLogo from "@/components/branding/BrandLogo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/workspace", label: "Workspace", icon: BarChart3 },
  { href: "/today", label: "Today", icon: CalendarCheck },
  { href: "/assets", label: "Assets", icon: FolderOpen },
  { href: "/search", label: "Search", icon: Search },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-80 flex-col border-r border-white/5 bg-brand-midnight/90 px-6 py-8 lg:flex">
      <BrandLogo />

      <div className="mt-10 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-link group", isActive && "nav-link-active")}
            >
              <span className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gold/10 text-brand-gold transition-transform duration-300 group-hover:scale-105">
                  <Icon size={18} />
                </span>
                {item.label}
              </span>
              <span className="text-xs text-brand-gold/70">View</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto">
        <div className="gold-divider mb-6" />
        <Link
          href="/workspace"
          className="flex items-center gap-3 rounded-3xl border border-brand-gold/20 bg-brand-deep/70 p-4 transition-colors hover:border-brand-gold/50"
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-brand-gold/40">
            <Image
              src="/brand/headshot.svg"
              alt="MAB AI Strategies professional headshot"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-ivory">Jordan M.</p>
            <p className="text-xs text-brand-ivory/60">Strategy Director</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
