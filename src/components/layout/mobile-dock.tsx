"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export default function MobileDock() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex w-[90%] -translate-x-1/2 justify-between rounded-2xl border border-mab-navy-700/70 bg-mab-navy/90 px-4 py-3 shadow-navy-soft backdrop-blur md:hidden">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 text-xs text-mab-ivory/60 transition",
              active && "text-mab-gold"
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-mab-navy-700/70",
                active && "border-mab-gold/60 shadow-gold-glow"
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
