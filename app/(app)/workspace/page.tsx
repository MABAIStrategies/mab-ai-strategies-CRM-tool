"use client";

import { useEffect, useState, useCallback } from "react";
import { RapidCapture } from "../../../src/components/rapid-capture";

type Deal = {
  id: string;
  title: string | null;
  stage: string;
  value: number | null;
  momentumScore: number;
  offerType: string;
  company: { id: string; name: string };
  primaryContact: { id: string; name: string; email: string | null } | null;
};

export default function WorkspacePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchDeals = useCallback(async () => {
    const res = await fetch("/api/deals?limit=20");
    if (res.ok) {
      const data = await res.json();
      setDeals(data.deals);
      if (data.deals.length > 0 && !selectedDeal) {
        setSelectedDeal(data.deals[0].id);
      }
    }
    setLoading(false);
  }, [selectedDeal]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const current = deals.find((d) => d.id === selectedDeal);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Workspace</p>
          <h1 className="text-3xl font-semibold text-mab-navy">
            {current ? current.company.name : "Select a Deal"}
          </h1>
          {current && (
            <p className="mt-2 text-sm text-mab-slate">
              Deal stage: {current.stage.replace(/_/g, " ")} · Momentum {current.momentumScore} · {current.offerType}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedDeal}
            onChange={(e) => setSelectedDeal(e.target.value)}
            className="rounded-xl border border-mab-navy/10 bg-white px-4 py-2 text-sm focus:border-mab-gold focus:outline-none"
          >
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.company.name} — {d.offerType}
              </option>
            ))}
          </select>
          {current && (
            <a
              href={`/deals/${current.id}`}
              className="inline-flex items-center rounded-xl bg-mab-navy px-5 py-2 text-sm font-medium text-white transition hover:bg-mab-gold hover:text-mab-navy"
            >
              Open Deal
            </a>
          )}
        </div>
      </header>

      {loading ? (
        <div className="py-20 text-center text-mab-slate">Loading...</div>
      ) : deals.length === 0 ? (
        <div className="py-20 text-center text-mab-slate">
          <p>No deals yet.</p>
          <a href="/deals/new" className="mt-2 inline-block text-mab-gold hover:underline">
            Create your first deal
          </a>
        </div>
      ) : (
        <>
          <RapidCapture />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-mab-navy/10 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs uppercase tracking-wider text-mab-gold">Quick Actions</h3>
              <div className="space-y-2">
                <a href={`/deals/${selectedDeal}`} className="block rounded-xl bg-mab-ivory/50 px-4 py-3 text-sm text-mab-navy transition hover:bg-mab-ivory">
                  View deal details and activity
                </a>
                <a href="/outreach" className="block rounded-xl bg-mab-ivory/50 px-4 py-3 text-sm text-mab-navy transition hover:bg-mab-ivory">
                  Compose outreach email
                </a>
                <a href="/companies" className="block rounded-xl bg-mab-ivory/50 px-4 py-3 text-sm text-mab-navy transition hover:bg-mab-ivory">
                  Browse companies
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-mab-navy/10 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs uppercase tracking-wider text-mab-gold">Active Deals</h3>
              <div className="space-y-2">
                {deals.slice(0, 5).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDeal(d.id)}
                    className={`block w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                      d.id === selectedDeal ? "bg-mab-navy text-white" : "bg-mab-ivory/50 text-mab-navy hover:bg-mab-ivory"
                    }`}
                  >
                    <p className="font-medium">{d.company.name}</p>
                    <p className={`text-xs ${d.id === selectedDeal ? "text-white/70" : "text-mab-slate"}`}>
                      {d.stage.replace(/_/g, " ")} · M{d.momentumScore}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-mab-gold/30 bg-mab-navy p-5 text-white shadow-glow">
              <p className="mb-1 text-xs uppercase tracking-[0.3em] text-mab-gold">AI Copilot</p>
              <h3 className="mb-3 text-sm font-semibold">Workspace Intelligence</h3>
              <div className="space-y-3 text-xs text-white/70">
                <div>
                  <p className="font-medium text-white">Next Best Action</p>
                  <p>Open the deal detail page to log activities, generate proposals, and advance deals through the pipeline.</p>
                </div>
                <div>
                  <p className="font-medium text-white">Pipeline Health</p>
                  <p>{deals.length} active deals. Average momentum: {Math.round(deals.reduce((s, d) => s + d.momentumScore, 0) / (deals.length || 1))}.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
