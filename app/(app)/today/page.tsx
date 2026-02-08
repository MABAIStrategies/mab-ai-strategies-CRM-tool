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
            Focus on calls, follow-ups, and next-step commitments. Everything here is auto-prioritized.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton label="Start rapid capture" href="/workspace" ariaLabel="Start rapid capture flow" />
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
        </Card>
      </div>
    </div>
  );
}
