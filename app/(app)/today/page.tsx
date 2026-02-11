"use client";

import { useEffect, useState } from "react";

type DashboardStats = {
  companies: number;
  contacts: number;
  deals: number;
  openDeals: number;
  wonDeals: number;
  lostDeals: number;
  tasksOpen: number;
  tasksDone: number;
  activitiesThisWeek: number;
  outreachSent: number;
  pipelineValue: number;
};

type TopDeal = {
  id: string;
  title: string | null;
  stage: string;
  momentumScore: number;
  value: number | null;
  offerType: string;
  company: { name: string };
  primaryContact: { name: string } | null;
};

type UpcomingTask = {
  id: string;
  title: string;
  status: string;
  dueAt: string | null;
  company: { name: string } | null;
  deal: { title: string | null } | null;
};

type RecentActivity = {
  id: string;
  type: string;
  occurredAt: string;
  outcome: string | null;
  company: { name: string };
  contact: { name: string } | null;
};

export default function TodayPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topDeals, setTopDeals] = useState<TopDeal[]>([]);
  const [tasks, setTasks] = useState<UpcomingTask[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setTopDeals(data.topDeals ?? []);
        setTasks(data.upcomingTasks ?? []);
        setActivities(data.recentActivities ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getInsight = async () => {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `I have ${stats?.openDeals ?? 0} open deals worth $${stats?.pipelineValue?.toLocaleString() ?? 0}, ${stats?.tasksOpen ?? 0} open tasks, and ${stats?.activitiesThisWeek ?? 0} activities this week. What should I focus on today?`
          }
        ]
      })
    });
    if (res.ok) {
      const data = await res.json();
      setAiInsight(data.response);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-mab-slate">Loading dashboard...</div>;
  }

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

      {aiInsight && (
        <div className="rounded-2xl border border-mab-gold/30 bg-mab-navy p-5 text-sm text-white shadow-glow">
          <p className="mb-1 text-xs uppercase tracking-[0.3em] text-mab-gold">AI Daily Brief</p>
          <pre className="whitespace-pre-wrap text-white/90">{aiInsight}</pre>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-6">
        {[
          { label: "Companies", value: stats?.companies ?? 0 },
          { label: "Contacts", value: stats?.contacts ?? 0 },
          { label: "Open Deals", value: stats?.openDeals ?? 0 },
          { label: "Won", value: stats?.wonDeals ?? 0 },
          { label: "Tasks Open", value: stats?.tasksOpen ?? 0 },
          { label: "Outreach Sent", value: stats?.outreachSent ?? 0 }
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-mab-navy/10 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-semibold text-mab-navy">{s.value}</p>
            <p className="text-xs text-mab-slate">{s.label}</p>
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
