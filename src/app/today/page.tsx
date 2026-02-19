import { ArrowUpRight, CheckCircle2, Clock, Sun } from "lucide-react";
import Link from "next/link";

import InsightCard from "@/components/layout/InsightCard";
import { Button } from "@/components/ui/button";

export default function TodayPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-brand-gold/70">
            Today
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-brand-ivory">
            Focus on the top priorities for a high-impact day.
          </h2>
        </div>
        <Button variant="outline" asChild>
          <Link href="/search">
            Run a Quick Search <ArrowUpRight size={16} />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <InsightCard
          title="Morning Brief"
          description="Review your executive summary with overnight changes and key stakeholder updates."
          icon={<Sun size={20} />}
        />
        <InsightCard
          title="Momentum Queue"
          description="Lock in next actions for pipeline deals, partnership follow-ups, and renewal touchpoints."
          icon={<Clock size={20} />}
        />
        <InsightCard
          title="Mission Completion"
          description="Close loops on mission-critical deliverables and notify account leaders automatically."
          icon={<CheckCircle2 size={20} />}
        />
      </div>
    </section>
  );
}
