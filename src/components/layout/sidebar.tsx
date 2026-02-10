"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative hidden h-screen w-72 flex-col justify-between border-r border-mab-navy-700/70 bg-mab-navy/80 p-6 md:flex">
      <div className="absolute inset-0 mab-glow opacity-70" aria-hidden />
      <div className="relative z-10 flex h-full flex-col gap-8">
        <div className="flex items-center justify-between">
          <Link href="/workspace" className="flex items-center gap-3">
            <Image
              src="/images/mab-logo.svg"
              alt="MAB AI Strategies logo"
              width={160}
              height={48}
              priority
            />
          </Link>
          <Badge className="animate-glimmer">Prime</Badge>
        </div>

        <nav className="flex flex-col gap-3">
          {navigationItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-start gap-3 rounded-xl border border-transparent px-4 py-3 transition hover:border-mab-gold/40 hover:bg-mab-navy-700/50",
                  active &&
                    "border-mab-gold/60 bg-mab-navy-700/80 shadow-gold-glow"
                )}
              >
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-mab-navy-700 text-mab-gold group-hover:scale-105 group-hover:text-mab-ivory">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-mab-ivory">
                    {item.label}
                  </span>
                  <span className="text-xs text-mab-ivory/60">
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-mab-navy-700/70 bg-mab-navy/60 p-4">
          <div className="flex items-center gap-4">
            <Image
              src="/images/headshot.svg"
              alt="Professional headshot"
              width={56}
              height={56}
              className="rounded-full border border-mab-gold/40"
            />
            <div>
              <p className="text-sm font-semibold">MAB Strategy Lead</p>
              <p className="text-xs text-mab-ivory/60">Executive Command</p>
            </div>
          </div>
          <Button variant="secondary" className="mt-4 w-full" asChild>
            <Link href="/workspace">Open Command Center</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
