import { ArrowUpRight, BriefcaseBusiness, Target, Workflow } from "lucide-react";
import Link from "next/link";

import InsightCard from "@/components/layout/InsightCard";
import { Button } from "@/components/ui/button";

export default function WorkspacePage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-brand-gold/70">
            Workspace
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-brand-ivory">
            Activate strategic workflows and coordinated client pursuits.
          </h2>
        </div>
        <Button asChild>
          <Link href="/assets">
            Open Asset Vault <ArrowUpRight size={16} />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <InsightCard
          title="Pipeline Pulse"
          description="Track priority deals and orchestrate actions with real-time momentum scoring."
          icon={<Workflow size={20} />}
        />
        <InsightCard
          title="Client Missions"
          description="Align teams to mission-critical outcomes and deploy high-touch engagement."
          icon={<Target size={20} />}
        />
        <InsightCard
          title="Executive Briefings"
          description="Deliver executive-ready insights with curated summaries and board-ready metrics."
          icon={<BriefcaseBusiness size={20} />}
        />
      </div>
    </section>
  );
}
