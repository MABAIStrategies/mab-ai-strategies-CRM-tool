"use client";

import { Command, Bell, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopCommandBar() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-mab-gold/70">
            MAB AI Strategies
          </p>
          <h1 className="shimmer-text text-3xl font-semibold">
            Hyper-interactive CRM cockpit
          </h1>
          <p className="mt-2 text-sm text-mab-ivory/70">
            Keep momentum high with the command palette, proactive nudges, and
            quick launch actions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Bell size={16} />
            Alerts
          </Button>
          <Button size="sm">
            <Sparkles size={16} />
            Create quick pulse
          </Button>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-full">
        <Input
          placeholder="Search, jump, or start a workflow (⌘K)"
          className="relative z-10 h-14 bg-mab-blue-2/80 text-base"
        />
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-mab-gold/10 to-transparent opacity-60 blur-lg animate-shimmer" />
        <div className="pointer-events-none absolute right-4 top-1/2 z-20 flex -translate-y-1/2 items-center gap-2 rounded-full border border-mab-gold/30 bg-mab-blue-2/80 px-3 py-1 text-xs text-mab-ivory/70">
          <Command size={14} />
          ⌘K
        </div>
      </div>
    </div>
  );
}
