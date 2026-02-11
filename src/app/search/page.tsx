"use client";

import { ArrowUpRight, Filter, Radar, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import InsightCard from "@/components/layout/InsightCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const filters = ["clients", "assets", "signals"] as const;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<(typeof filters)[number][]>([
    "clients",
  ]);

  const toggleFilter = (filter: (typeof filters)[number]) => {
    setActiveFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter]
    );
  };

  const helperText = useMemo(() => {
    if (activeFilters.length === 0) {
      return "No filters selected. Showing all intelligence sources.";
    }

    return `Filtering ${activeFilters.join(", ")} ${query ? `for \"${query}\"` : ""}`;
  }, [activeFilters, query]);

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-brand-gold/70">
            Search
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-brand-ivory">
            Illuminate every client record, asset, and insight instantly.
          </h2>
        </div>
        <Button variant="outline" asChild>
          <Link href="/today">
            Back to Today <ArrowUpRight size={16} />
          </Link>
        </Button>
      </div>

      <div className="brand-panel space-y-4 px-6 py-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex min-w-[240px] flex-1 items-center gap-3">
            <SearchIcon size={18} className="text-brand-gold" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search signals, clients, and assets..."
            />
          </div>
          <Button asChild>
            <Link href={`/search?q=${encodeURIComponent(query)}`}>
              <Filter size={16} />
              Apply Search
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = activeFilters.includes(filter);
            return (
              <Button
                key={filter}
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                onClick={() => toggleFilter(filter)}
              >
                {filter}
              </Button>
            );
          })}
        </div>

        <p className="text-xs text-brand-ivory/70">{helperText}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightCard
          title="Signal Spotlight"
          description="Pinpoint the most active conversations and top-performing campaigns."
          icon={<Radar size={20} />}
        />
        <InsightCard
          title="Priority Threads"
          description="Instantly access the highest-value client journeys with one command."
          icon={<SearchIcon size={20} />}
        />
      </div>
    </section>
  );
}
