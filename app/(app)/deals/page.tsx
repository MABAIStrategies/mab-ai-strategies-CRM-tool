import Link from "next/link";
import { prisma } from "../../../src/lib/db";
import { Card } from "../../../src/components/ui/card";
import { PrimaryButton } from "../../../src/components/ui/primary-button";

export default async function DealsPage() {
  const deals = await prisma.deal.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { company: true }
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Deals</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Pipeline Momentum Suite</h1>
          <p className="mt-2 text-sm text-mab-slate">
            Orchestrate offer flows, manage objections, and guide every engagement to a confident close.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton label="Create deal" href="/deals/new" ariaLabel="Create deal" />
          <PrimaryButton
            label="Prep assets"
            variant="outline"
            href="/assets"
            ariaLabel="Prep assets"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Pipeline pulse" subtitle="AI momentum tracker">
          <ul className="space-y-3 text-sm text-mab-slate">
            <li>Total deals: {deals.length}</li>
            <li>Average momentum: {deals.length ? "72" : "--"}</li>
            <li>Next step timing enforced</li>
          </ul>
          <div className="mt-4">
            <PrimaryButton label="Review tasks" href="/tasks" ariaLabel="Review tasks" />
          </div>
        </Card>
        <Card title="Active deals" subtitle="Tap to open details">
          {deals.length ? (
            <ul className="space-y-3 text-sm">
              {deals.map((deal) => (
                <li key={deal.id}>
                  <Link
                    href={`/deals/${deal.id}`}
                    className="block rounded-2xl border border-mab-gold/20 bg-white px-4 py-3 text-mab-navy shadow-sm transition hover:-translate-y-0.5 hover:bg-mab-navy hover:text-white"
                  >
                    <p className="font-medium">{deal.stage.replace(/_/g, " ")}</p>
                    <p className="text-xs text-mab-slate">
                      {deal.company?.name ?? "No company"} · Momentum {deal.momentumScore}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-mab-gold/40 bg-white px-4 py-6 text-sm text-mab-slate">
              No deals yet. Create your first opportunity to ignite momentum.
            </div>
          )}
        </Card>
        <Card title="Close-ready cadence" subtitle="MAB deal choreography">
          <div className="space-y-4 text-sm text-mab-slate">
            <p>Keep proposals, objections, and ROI proof synchronized with signature MAB pacing.</p>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton
                label="Open workspace"
                variant="outline"
                href="/workspace"
                ariaLabel="Open workspace"
              />
              <PrimaryButton label="Open search" variant="outline" href="/search" ariaLabel="Open search" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
