"use client";

import { Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const commandSchema = z
  .string()
  .trim()
  .min(2, "Enter at least 2 characters")
  .max(100, "Command is too long");

const commandRoutes: Record<string, string> = {
  workspace: "/workspace",
  today: "/today",
  assets: "/assets",
  search: "/search",
};

export default function TopBar() {
  const router = useRouter();
  const [command, setCommand] = useState("");
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(
    () => [
      { label: "Open Workspace", href: "/workspace" },
      { label: "Focus Today", href: "/today" },
      { label: "Browse Assets", href: "/assets" },
      { label: "Run Search", href: "/search" },
    ],
    []
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = commandSchema.safeParse(command);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid command");
      return;
    }

    setError(null);
    const normalized = parsed.data.toLowerCase();
    const routeMatch = Object.keys(commandRoutes).find((key) =>
      normalized.includes(key)
    );

    router.push(routeMatch ? commandRoutes[routeMatch] : `/search?q=${encodeURIComponent(parsed.data)}`);
  };

  return (
    <div className="space-y-3">
      <form className="flex flex-wrap items-center justify-between gap-4" onSubmit={onSubmit}>
        <div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-full border border-brand-gold/20 bg-brand-deep/80 px-4 py-2 shadow-[inset_0_0_20px_rgba(10,28,59,0.55)]">
          <Sparkles className="text-brand-gold" size={18} />
          <Input
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            placeholder="Command the workspace..."
            className="border-none bg-transparent px-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <span className="rounded-full border border-brand-gold/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-brand-gold/80">
            ⌘ K
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/search">
              <Zap size={16} />
              Intelligent Search
            </Link>
          </Button>
          <Button type="submit">Go</Button>
        </div>
      </form>

      {error ? <p className="text-xs text-red-300">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Button key={suggestion.href} size="sm" variant="ghost" asChild>
            <Link href={suggestion.href}>{suggestion.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
