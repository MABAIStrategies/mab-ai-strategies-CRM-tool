import { ArrowUpRight, Layers, Radar, Sparkles } from "lucide-react";
import Link from "next/link";

import InsightCard from "@/components/layout/InsightCard";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="space-y-10">
      <div className="brand-panel relative overflow-hidden px-8 py-10">
        <div className="absolute inset-0 bg-brand-sheen opacity-70" />
        <div className="relative space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-brand-gold/70">
                Command Overview
              </p>
              <h2 className="mt-3 text-4xl font-semibold text-brand-ivory">
                Orchestrate every client touchpoint with luminous precision.
              </h2>
              <p className="mt-4 max-w-2xl text-sm text-brand-ivory/70">
                The MAB AI Strategies CRM surfaces your critical priorities, adaptive
                workflows, and strategic assets in a single high-touch interface.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild>
                <Link href="/workspace">
                  Enter Workspace <ArrowUpRight size={16} />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/today">View Today</Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-brand-ivory/70">
            <span className="rounded-full border border-brand-gold/30 px-3 py-1">
              3 live missions
            </span>
            <span className="rounded-full border border-brand-gold/30 px-3 py-1">
              12 active assets
            </span>
            <span className="rounded-full border border-brand-gold/30 px-3 py-1">
              98% momentum score
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <InsightCard
          title="Workspace Focus"
          description="Dive into the strategic workspace to guide campaigns, playbooks, and relationship pipelines."
          icon={<Layers size={20} />}
        />
        <InsightCard
          title="Signal Radar"
          description="Surface every client signal and action item with live intelligence syncing."
          icon={<Radar size={20} />}
        />
        <InsightCard
          title="Experience Spark"
          description="Activate personalized journeys that keep stakeholders engaged and aligned."
          icon={<Sparkles size={20} />}
        />
      </div>
    </section>
  );
}
