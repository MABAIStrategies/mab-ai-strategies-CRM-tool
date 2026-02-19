"use client";

import { useEffect, useState } from "react";
import { Card } from "../../../src/components/ui/card";
import { PrimaryButton } from "../../../src/components/ui/primary-button";
import { getTodayDashboardData } from "../../../src/lib/dashboard-queries";

export const revalidate = 60;

const formatTime = (date: Date | string) => {
  const normalizedDate = typeof date === "string" ? new Date(date) : date;
  return normalizedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
};

const formatStage = (stage: string) =>
  stage
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export default async function TodayPage() {
  const { priorityTasks, upcomingActivities, topDeals } = await getTodayDashboardData();

  const prioritySubtitle = `${priorityTasks.length} due · ${priorityTasks.filter((task) => task.status === "DOING").length} in motion`;
  const callsSubtitle = upcomingActivities.length
    ? "Auto-sorted by urgency"
    : "No upcoming calls yet";
  const dealsSubtitle = topDeals.length ? "AI-calculated engagement" : "Add deals to see momentum";

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
          <PrimaryButton
            label="Start rapid capture"
            href="/workspace?capture=1"
            ariaLabel="Start rapid capture flow"
          />
          <PrimaryButton
            label="Launch command palette"
            variant="outline"
            href="/search"
            ariaLabel="Open command palette"
          />
          <PrimaryButton
            label="View finish line"
            variant="outline"
            href="/finish-line"
            ariaLabel="View finish line dashboard"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Today’s Priority Tasks" subtitle={prioritySubtitle} data={priorityTasks}>
          {(tasks) => (
            <ul className="space-y-3 text-sm text-mab-slate">
              {tasks.length ? (
                tasks.map((task) => (
                  <li key={task.id}>
                    {task.title} · {task.companyName}
                    {task.dealStage ? ` (${formatStage(task.dealStage)})` : ""}
                  </li>
                ))
              ) : (
                <li className="text-mab-slate/70">No tasks due yet. Queue the next action in Rapid Capture.</li>
              )}
            </ul>
          )}
        </Card>
        <Card title="Next Calls" subtitle={callsSubtitle} data={upcomingActivities}>
          {(activities) => (
            <ul className="space-y-3 text-sm text-mab-slate">
              {activities.length ? (
                activities.map((activity) => (
                  <li key={activity.id}>
                    {formatTime(activity.occurredAt)} — {activity.contactName ?? "Unassigned"} ({activity.companyName})
                  </li>
                ))
              ) : (
                <li className="text-mab-slate/70">Schedule a call to populate your command queue.</li>
              )}
            </ul>
          )}
        </Card>
        <Card title="Top Deals by Momentum" subtitle={dealsSubtitle} data={topDeals}>
          {(deals) => (
            <ul className="space-y-3 text-sm text-mab-slate">
              {deals.length ? (
                deals.map((deal) => (
                  <li key={deal.id}>
                    {deal.companyName} — Momentum {deal.momentumScore}
                  </li>
                ))
              ) : (
                <li className="text-mab-slate/70">No momentum data yet. Add a deal to start scoring.</li>
              )}
            </ul>
          )}
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
