import { ArrowUpRight, Filter, Radar, SearchIcon } from "lucide-react";
import Link from "next/link";

import InsightCard from "@/components/layout/InsightCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SearchPage() {
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

      <div className="brand-panel flex flex-wrap items-center gap-4 px-6 py-5">
        <div className="flex min-w-[240px] flex-1 items-center gap-3">
          <SearchIcon size={18} className="text-brand-gold" />
          <Input placeholder="Search signals, clients, and assets..." />
        </div>
        <Button variant="outline">
          <Filter size={16} />
          Filter Signals
        </Button>
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
