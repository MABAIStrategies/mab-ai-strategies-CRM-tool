"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Zap, Command } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { commandSchema } from "@/lib/schemas";

export default function TopCommandBar() {
  const [command, setCommand] = React.useState("");
  const validation = React.useMemo(() => commandSchema.safeParse(command), [command]);

  return (
    <header className="flex w-full flex-col gap-4 border-b border-mab-navy-700/70 bg-mab-navy/80 px-6 py-5 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-mab-gold/40 bg-mab-navy-700">
            <Command className="h-5 w-5 text-mab-gold" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-mab-gold/70">
              Command Bar
            </p>
            <h1 className="text-xl font-semibold">MAB AI Strategies CRM</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/search">
              <Sparkles className="h-4 w-4" />
              Deep Search
            </Link>
          </Button>
          <Button asChild>
            <Link href="/assets">
              <Zap className="h-4 w-4" />
              Launch Asset
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Input
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              placeholder="Type a command, query, or action (e.g. ‘Summarize Q4 pipeline’)"
              className="h-12 pl-12"
            />
            <Sparkles className="absolute left-4 top-3.5 h-5 w-5 text-mab-gold/70" />
          </div>
          <Button variant="secondary" className="h-12" asChild>
            <Link href="/today">Activate Daily Focus</Link>
          </Button>
        </div>
        <p className="text-xs text-mab-ivory/60">
          {validation.success
            ? "Glimmer-ready. Press enter to deploy or tap a destination above."
            : "Minimum 3 characters to calibrate a command."}
        </p>
      </div>
    </header>
  );
}
