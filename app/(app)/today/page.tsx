"use client";

import { useEffect, useState } from "react";
import { Card } from "../../../src/components/ui/card";
import { PrimaryButton } from "../../../src/components/ui/primary-button";

type TodayPayload = {
  priorityTasks: string[];
  nextCalls: string[];
  topDeals: string[];
};

const emptyPayload: TodayPayload = {
  priorityTasks: [],
  nextCalls: [],
  topDeals: []
};

export default function TodayPage() {
  const [payload, setPayload] = useState<TodayPayload>(emptyPayload);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await fetch("/api/today", {
          headers: { "x-csrf-token": "local-dev" }
        });
        if (!response.ok) {
          throw new Error("Unable to load today data.");
        }
        const data = (await response.json()) as TodayPayload;
        if (mounted) {
          setPayload(data);
          setStatus("ready");
        }
      } catch (error) {
        if (mounted) {
          console.error(error);
          setStatus("error");
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Today</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Momentum Command Center</h1>
          <p className="mt-2 text-sm text-mab-slate">
            Pipeline: ${stats?.pipelineValue?.toLocaleString() ?? "0"} · {stats?.openDeals ?? 0} open deals · {stats?.tasksOpen ?? 0} tasks due
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="/deals/new" className="inline-flex rounded-xl bg-mab-navy px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-mab-gold hover:text-mab-navy">
            + New Deal
          </a>
          <a href="/pipeline" className="inline-flex rounded-xl bg-mab-navy/5 px-5 py-3 text-sm font-medium text-mab-navy transition hover:bg-mab-navy hover:text-white">
            View Pipeline
          </a>
          <button
            onClick={getInsight}
            className="rounded-xl bg-mab-gold/20 px-5 py-3 text-sm font-medium text-mab-navy transition hover:bg-mab-gold"
          >
            AI Daily Brief
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Today’s Priority Tasks" subtitle="Auto-ranked from the new pipeline">
          <ul className="space-y-3 text-sm text-mab-slate">
            {payload.priorityTasks.length ? (
              payload.priorityTasks.map((task) => <li key={task}>{task}</li>)
            ) : (
              <li className="rounded-xl border border-mab-gold/30 bg-white/70 px-3 py-2 text-mab-navy">
                {status === "loading"
                  ? "Syncing priorities..."
                  : "No tasks yet. Start a rapid capture to populate this list."}
              </li>
            )}
          </ul>
        </Card>
        <Card title="Next Calls" subtitle="Auto-sorted by urgency">
          <ul className="space-y-3 text-sm text-mab-slate">
            {payload.nextCalls.length ? (
              payload.nextCalls.map((call) => <li key={call}>{call}</li>)
            ) : (
              <li className="rounded-xl border border-mab-gold/30 bg-white/70 px-3 py-2 text-mab-navy">
                {status === "loading" ? "Refreshing call queue..." : "No scheduled calls yet."}
              </li>
            )}
          </ul>
        </Card>
        <Card title="Top Deals by Momentum" subtitle="AI-calculated engagement">
          <ul className="space-y-3 text-sm text-mab-slate">
            {payload.topDeals.length ? (
              payload.topDeals.map((deal) => <li key={deal}>{deal}</li>)
            ) : (
              <li className="rounded-xl border border-mab-gold/30 bg-white/70 px-3 py-2 text-mab-navy">
                {status === "loading" ? "Calculating momentum..." : "No momentum data yet."}
              </li>
            )}
          </ul>
        </Card>
        <Card title="Finish Line Focus" subtitle="Unified progress snapshot">
          <div className="space-y-3 text-sm text-mab-slate">
            <p>Capture, memory, assets, and compliance are converging toward the final loop.</p>
            <PrimaryButton label="Open finish line" href="/finish-line" ariaLabel="Open finish line" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-mab-navy/10 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-xs uppercase tracking-wider text-mab-gold">Top Deals by Momentum</h3>
          <div className="mt-3 space-y-3">
            {topDeals.length === 0 ? (
              <p className="text-sm text-mab-slate">No open deals. <a href="/deals/new" className="text-mab-gold hover:underline">Create one</a>.</p>
            ) : (
              topDeals.map((d) => (
                <a key={d.id} href={`/deals/${d.id}`} className="block rounded-xl bg-mab-ivory/50 p-3 transition hover:bg-mab-ivory">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-mab-navy">{d.company.name}</p>
                    <span className="text-sm font-semibold text-mab-gold">M{d.momentumScore}</span>
                  </div>
                  <p className="text-xs text-mab-slate">
                    {d.stage.replace(/_/g, " ")} · {d.offerType} · {d.value ? `$${d.value.toLocaleString()}` : "TBD"}
                  </p>
                </a>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-mab-navy/10 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-xs uppercase tracking-wider text-mab-gold">Priority Tasks</h3>
          <div className="mt-3 space-y-2">
            {tasks.length === 0 ? (
              <p className="text-sm text-mab-slate">All caught up!</p>
            ) : (
              tasks.map((t) => (
                <div key={t.id} className="rounded-xl bg-mab-ivory/50 p-3 text-xs">
                  <p className="font-medium text-mab-navy">{t.title}</p>
                  <p className="text-mab-slate">
                    {t.company?.name ?? ""} {t.dueAt ? `· Due ${new Date(t.dueAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-mab-navy/10 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-xs uppercase tracking-wider text-mab-gold">Recent Activity</h3>
          <div className="mt-3 space-y-2">
            {activities.length === 0 ? (
              <p className="text-sm text-mab-slate">No recent activity.</p>
            ) : (
              activities.map((a) => (
                <div key={a.id} className="rounded-xl bg-mab-ivory/50 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-mab-navy">{a.type} — {a.company.name}</span>
                    <span className="text-mab-slate">{new Date(a.occurredAt).toLocaleDateString()}</span>
                  </div>
                  {a.outcome && <p className="text-mab-slate">{a.outcome}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
