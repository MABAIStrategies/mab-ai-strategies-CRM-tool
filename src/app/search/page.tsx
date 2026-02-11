"use client";

import { ArrowUpRight, Filter, Radar, SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import InsightCard from "@/components/layout/InsightCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const filters = ["clients", "assets", "signals"] as const;
type FilterType = (typeof filters)[number];

function getActiveFilters(paramValue: string | null): FilterType[] {
  if (!paramValue) {
    return ["clients"];
  }

  return paramValue
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is FilterType => filters.includes(item as FilterType));
}

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const activeFilters = getActiveFilters(searchParams.get("filters"));

  const updateParams = (next: { q?: string; filters?: FilterType[] }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (next.q !== undefined) {
      if (next.q.trim()) {
        params.set("q", next.q);
      } else {
        params.delete("q");
      }
    }

    if (next.filters !== undefined) {
      if (next.filters.length) {
        params.set("filters", next.filters.join(","));
      } else {
        params.delete("filters");
      }
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const toggleFilter = (filter: FilterType) => {
    const nextFilters = activeFilters.includes(filter)
      ? activeFilters.filter((item) => item !== filter)
      : [...activeFilters, filter];

    updateParams({ filters: nextFilters });
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
              onChange={(event) => updateParams({ q: event.target.value })}
              placeholder="Search signals, clients, and assets..."
            />
          </div>
          <Button
            type="button"
            onClick={() => updateParams({ q: query, filters: activeFilters })}
          >
            <Filter size={16} />
            Apply Search
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
