"use client";

import { useEffect, useState, useCallback } from "react";

type Deal = {
  id: string;
  title: string | null;
  stage: string;
  value: number | null;
  probability: number;
  momentumScore: number;
  offerType: string;
  company: { id: string; name: string };
  primaryContact: { id: string; name: string } | null;
};

const STAGES = [
  { key: "PROSPECT_IDENTIFIED", label: "Prospect", color: "bg-gray-100" },
  { key: "ENRICHED", label: "Enriched", color: "bg-blue-50" },
  { key: "OUTREACH_SENT", label: "Outreach", color: "bg-indigo-50" },
  { key: "DISCOVERY_SCHEDULED", label: "Discovery", color: "bg-purple-50" },
  { key: "DISCOVERY_COMPLETED", label: "Qualified", color: "bg-yellow-50" },
  { key: "OFFER_PRESENTED", label: "Offer", color: "bg-orange-50" },
  { key: "PROPOSAL_SENT", label: "Proposal", color: "bg-amber-50" },
  { key: "CLOSED_WON", label: "Won", color: "bg-green-50" },
  { key: "CLOSED_LOST", label: "Lost", color: "bg-red-50" }
];

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = useCallback(async () => {
    const res = await fetch("/api/deals?limit=50");
    if (res.ok) {
      const data = await res.json();
      setDeals(data.deals);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const advanceDeal = async (dealId: string) => {
    const res = await fetch(`/api/deals/${dealId}/advance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    if (res.ok) {
      fetchDeals();
    }
  };

  const grouped = STAGES.map((stage) => ({
    ...stage,
    deals: deals.filter((d) => d.stage === stage.key)
  }));

  const totalValue = deals
    .filter((d) => d.stage !== "CLOSED_LOST")
    .reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Pipeline</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Deal Pipeline</h1>
          <p className="mt-1 text-sm text-mab-slate">
            {deals.length} deals &middot; Pipeline value: $
            {totalValue.toLocaleString()}
          </p>
        </div>
        <a
          href="/deals/new"
          className="inline-flex items-center rounded-xl bg-mab-navy px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-mab-gold hover:text-mab-navy"
        >
          + New Deal
        </a>
      </header>

      {loading ? (
        <div className="py-20 text-center text-mab-slate">Loading pipeline...</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {grouped.map((stage) => (
            <div
              key={stage.key}
              className={`min-w-[240px] flex-shrink-0 rounded-2xl border border-mab-navy/10 ${stage.color} p-3`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-mab-navy">
                  {stage.label}
                </h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-mab-slate">
                  {stage.deals.length}
                </span>
              </div>
              <div className="space-y-2">
                {stage.deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md"
                  >
                    <a
                      href={`/deals/${deal.id}`}
                      className="block text-sm font-medium text-mab-navy hover:text-mab-gold"
                    >
                      {deal.company.name}
                    </a>
                    {deal.title && (
                      <p className="text-xs text-mab-slate">{deal.title}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-mab-slate">
                        {deal.value ? `$${deal.value.toLocaleString()}` : "TBD"}
                      </span>
                      <span className="text-xs font-medium text-mab-gold">
                        M{deal.momentumScore}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-mab-slate">
                      <span>{deal.offerType}</span>
                      <span>{deal.probability}%</span>
                    </div>
                    {stage.key !== "CLOSED_WON" && stage.key !== "CLOSED_LOST" && (
                      <button
                        onClick={() => advanceDeal(deal.id)}
                        className="mt-2 w-full rounded-lg bg-mab-navy/5 px-2 py-1 text-xs text-mab-navy transition hover:bg-mab-navy hover:text-white"
                      >
                        Advance →
                      </button>
                    )}
                  </div>
                ))}
                {stage.deals.length === 0 && (
                  <p className="py-4 text-center text-xs text-mab-slate/50">No deals</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
