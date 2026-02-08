"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "../../../src/components/ui/card";
import { PrimaryButton } from "../../../src/components/ui/primary-button";
import { RapidCapture } from "../../../src/components/rapid-capture";

type Company = {
  id: string;
  name: string;
  domain?: string | null;
  industry?: string | null;
  region?: string | null;
};

type Deal = {
  id: string;
  companyId: string;
  stage: string;
  momentumScore?: number | null;
  nextStepDate?: string | null;
  offerType?: string | null;
};

type Activity = {
  id: string;
  type: string;
  occurredAt: string;
  durationMinutes?: number | null;
  outcome?: string | null;
  contact?: { name?: string | null } | null;
};

type Task = {
  id: string;
  title: string;
  dueAt?: string | null;
};

type Asset = {
  id: string;
  title: string;
  version?: string | null;
  type?: string | null;
};

const dealStages = [
  "PROSPECT_IDENTIFIED",
  "ENRICHED",
  "OUTREACH_SENT",
  "DISCOVERY_SCHEDULED",
  "DISCOVERY_COMPLETED",
  "OFFER_PRESENTED",
  "PROPOSAL_SENT",
  "CLOSED_WON",
  "CLOSED_LOST",
  "DELIVERY_IN_PROGRESS",
  "DELIVERY_COMPLETE"
];

const activityTypes = ["CALL", "MEETING", "EMAIL", "LINKEDIN", "OTHER"];

const formatStage = (stage?: string | null) =>
  stage ? stage.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) : "Unassigned";

const formatDate = (value?: string | null) => {
  if (!value) {
    return "TBD";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function WorkspacePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [stageSelection, setStageSelection] = useState<string>("");
  const [activityForm, setActivityForm] = useState({
    type: "CALL",
    occurredAt: "",
    durationMinutes: "",
    outcome: ""
  });
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId]
  );
  const selectedDeal = useMemo(
    () => deals.find((deal) => deal.id === selectedDealId) ?? null,
    [deals, selectedDealId]
  );

  useEffect(() => {
    let mounted = true;
    const loadCompanies = async () => {
      const response = await fetch("/api/companies", {
        headers: { "x-csrf-token": "local-dev" }
      });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (mounted) {
        setCompanies(data.companies ?? []);
        if (data.companies?.length) {
          setSelectedCompanyId(data.companies[0].id);
        }
      }
    };
    loadCompanies();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) {
      return;
    }
    let mounted = true;
    const loadDeals = async () => {
      const response = await fetch(`/api/deals?companyId=${selectedCompanyId}`, {
        headers: { "x-csrf-token": "local-dev" }
      });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (mounted) {
        setDeals(data.deals ?? []);
        const firstDeal = data.deals?.[0];
        setSelectedDealId(firstDeal?.id ?? null);
      }
    };
    loadDeals();
    return () => {
      mounted = false;
    };
  }, [selectedCompanyId]);

  useEffect(() => {
    if (!selectedCompanyId) {
      return;
    }
    let mounted = true;
    const loadTasks = async () => {
      const params = new URLSearchParams();
      if (selectedDealId) {
        params.set("dealId", selectedDealId);
      } else {
        params.set("companyId", selectedCompanyId);
      }
      const response = await fetch(`/api/tasks?${params.toString()}`, {
        headers: { "x-csrf-token": "local-dev" }
      });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (mounted) {
        setTasks(data.tasks ?? []);
      }
    };
    loadTasks();
    return () => {
      mounted = false;
    };
  }, [selectedCompanyId, selectedDealId]);

  useEffect(() => {
    if (!selectedCompanyId) {
      return;
    }
    let mounted = true;
    const loadActivities = async () => {
      const params = new URLSearchParams();
      if (selectedDealId) {
        params.set("dealId", selectedDealId);
      } else {
        params.set("companyId", selectedCompanyId);
      }
      const response = await fetch(`/api/activities?${params.toString()}`, {
        headers: { "x-csrf-token": "local-dev" }
      });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (mounted) {
        setActivities(data.activities ?? []);
      }
    };
    loadActivities();
    return () => {
      mounted = false;
    };
  }, [selectedCompanyId, selectedDealId]);

  useEffect(() => {
    let mounted = true;
    const loadAssets = async () => {
      const response = await fetch("/api/assets", {
        headers: { "x-csrf-token": "local-dev" }
      });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (mounted) {
        setAssets(data.assets ?? []);
      }
    };
    loadAssets();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedDeal?.stage) {
      setStageSelection(selectedDeal.stage);
    }
  }, [selectedDeal]);

  const handleStageUpdate = async () => {
    if (!selectedDealId || !stageSelection) {
      return;
    }
    setActionStatus("Advancing stage...");
    const response = await fetch(`/api/deals/${selectedDealId}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-csrf-token": "local-dev" },
      body: JSON.stringify({ stage: stageSelection })
    });
    if (!response.ok) {
      setActionStatus("Unable to update stage. Try again.");
      return;
    }
    const data = await response.json();
    setDeals((prev) => prev.map((deal) => (deal.id === selectedDealId ? data.deal : deal)));
    setStageModalOpen(false);
    setActionStatus("Stage updated.");
  };

  const handleActivitySubmit = async () => {
    if (!selectedCompanyId) {
      return;
    }
    setActionStatus("Logging activity...");
    const response = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": "local-dev" },
      body: JSON.stringify({
        companyId: selectedCompanyId,
        dealId: selectedDealId,
        type: activityForm.type,
        occurredAt: activityForm.occurredAt || new Date().toISOString(),
        durationMinutes: activityForm.durationMinutes ? Number(activityForm.durationMinutes) : null,
        outcome: activityForm.outcome || null
      })
    });
    if (!response.ok) {
      setActionStatus("Unable to log activity. Try again.");
      return;
    }
    const data = await response.json();
    setActivities((prev) => [data.activity, ...prev].slice(0, 10));
    setActivityModalOpen(false);
    setActivityForm({ type: "CALL", occurredAt: "", durationMinutes: "", outcome: "" });
    setActionStatus("Activity logged.");
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Workspace</p>
          <h1 className="text-3xl font-semibold text-mab-navy">
            {selectedCompany?.name ?? "Select a company to begin"}
          </h1>
          <p className="mt-2 text-sm text-mab-slate">
            Deal stage: {formatStage(selectedDeal?.stage)} · Momentum {selectedDeal?.momentumScore ?? 0} · Next step:{" "}
            {formatDate(selectedDeal?.nextStepDate)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton
            label="Advance stage"
            onClick={() => setStageModalOpen(true)}
            ariaLabel="Advance deal stage"
            disabled={!selectedDealId}
          />
          <PrimaryButton
            label="Log activity"
            variant="outline"
            onClick={() => setActivityModalOpen(true)}
            ariaLabel="Log activity"
            disabled={!selectedCompanyId}
          />
        </div>
      </header>

      <section className="grid gap-4 rounded-2xl border border-mab-gold/30 bg-white/80 p-6 shadow-glow lg:grid-cols-[2fr_3fr]">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-mab-gold">Context selector</p>
          <h2 className="text-xl font-semibold text-mab-navy">Company + Deal Intelligence</h2>
          <p className="text-sm text-mab-slate">
            Switch context instantly to keep every action tied to the right account, stage, and timeline.
          </p>
          {selectedCompany ? (
            <div className="rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-slate shadow-sm">
              <p className="font-medium text-mab-navy">Account snapshot</p>
              <p>{selectedCompany.industry ?? "Industry not tagged"} · {selectedCompany.region ?? "Region pending"}</p>
              <p className="text-xs text-mab-slate/80">{selectedCompany.domain ?? "Domain unlisted"}</p>
            </div>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-mab-slate">
            <span className="font-medium text-mab-navy">Company</span>
            <select
              value={selectedCompanyId ?? ""}
              onChange={(event) => setSelectedCompanyId(event.target.value)}
              className="w-full rounded-xl border border-mab-navy/20 bg-white px-4 py-3 text-mab-navy shadow-sm transition focus:border-mab-gold focus:outline-none"
            >
              {companies.length ? (
                companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))
              ) : (
                <option value="">Loading companies...</option>
              )}
            </select>
          </label>
          <label className="space-y-2 text-sm text-mab-slate">
            <span className="font-medium text-mab-navy">Deal</span>
            <select
              value={selectedDealId ?? ""}
              onChange={(event) => setSelectedDealId(event.target.value)}
              className="w-full rounded-xl border border-mab-navy/20 bg-white px-4 py-3 text-mab-navy shadow-sm transition focus:border-mab-gold focus:outline-none"
            >
              {deals.length ? (
                deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {formatStage(deal.stage)} · Momentum {deal.momentumScore ?? 0}
                  </option>
                ))
              ) : (
                <option value="">No deals yet</option>
              )}
            </select>
          </label>
        </div>
      </section>

      {actionStatus ? (
        <div className="rounded-2xl border border-mab-gold/40 bg-white/70 px-4 py-3 text-sm text-mab-navy shadow-sm">
          {actionStatus}
        </div>
      ) : null}

      <RapidCapture companyId={selectedCompanyId ?? undefined} dealId={selectedDealId ?? undefined} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Timeline" subtitle="Calls, notes, and signals">
          <div className="space-y-4 text-sm text-mab-slate">
            {activities.length ? (
              activities.map((activity) => (
                <div key={activity.id} className="rounded-xl border border-mab-navy/10 bg-white px-3 py-2 shadow-sm">
                  <p className="font-medium text-mab-navy">
                    {activity.type} · {activity.durationMinutes ? `${activity.durationMinutes} min` : "Captured"}
                  </p>
                  <p>
                    {activity.outcome ?? "Outcome captured in timeline."}{" "}
                    <span className="text-xs text-mab-slate/70">
                      {new Date(activity.occurredAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                      })}
                    </span>
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-mab-gold/30 bg-white px-3 py-2 text-sm text-mab-navy">
                Log an activity to populate the timeline.
              </p>
            )}
          </div>
        </Card>
        <Card title="Tasks" subtitle="AI-suggested + manual">
          <ul className="space-y-3 text-sm text-mab-slate">
            {tasks.length ? (
              tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-2">
                  <span>{task.title}</span>
                  <span className="text-xs text-mab-slate/70">{formatDate(task.dueAt)}</span>
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-mab-gold/30 bg-white px-3 py-2 text-mab-navy">
                No tasks assigned yet.
              </li>
            )}
          </ul>
        </Card>
        <Card title="Assets" subtitle="Recommended for this deal">
          <ul className="space-y-3 text-sm text-mab-slate">
            {assets.length ? (
              assets.slice(0, 3).map((asset) => (
                <li key={asset.id}>
                  {asset.title} {asset.version ? `(v${asset.version})` : null}
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-mab-gold/30 bg-white px-3 py-2 text-mab-navy">
                Asset recommendations will appear here.
              </li>
            )}
          </ul>
        </Card>
      </div>

      <Card title="Copilot" subtitle="Account Brief · Objection Radar · Next Best Action">
        <div className="grid gap-4 lg:grid-cols-3 text-sm text-mab-slate">
          <div>
            <p className="font-medium text-mab-navy">Account Brief</p>
            <p>Focus on compliance workflows, reporting cadence, and vendor risk review.</p>
          </div>
          <div>
            <p className="font-medium text-mab-navy">Objection Radar</p>
            <p>Potential concern: data residency. Suggest Cloud Run + Cloud SQL plan.</p>
          </div>
          <div>
            <p className="font-medium text-mab-navy">Next Best Action</p>
            <p>Send ROI snapshot + confirm technical workshop invite.</p>
          </div>
        </div>
      </Card>

      {stageModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mab-navy/40 p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-mab-gold/40 bg-white p-6 shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-mab-gold">Advance stage</p>
                <h2 className="text-xl font-semibold text-mab-navy">Move the deal forward</h2>
              </div>
              <button
                type="button"
                onClick={() => setStageModalOpen(false)}
                className="rounded-full border border-mab-navy/20 px-3 py-1 text-sm text-mab-navy transition hover:bg-mab-navy hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="space-y-2 text-sm text-mab-slate">
                <span className="font-medium text-mab-navy">New stage</span>
                <select
                  value={stageSelection}
                  onChange={(event) => setStageSelection(event.target.value)}
                  className="w-full rounded-xl border border-mab-navy/20 bg-white px-4 py-3 text-mab-navy shadow-sm focus:border-mab-gold focus:outline-none"
                >
                  {dealStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {formatStage(stage)}
                    </option>
                  ))}
                </select>
              </label>
              <PrimaryButton label="Confirm stage" onClick={handleStageUpdate} ariaLabel="Confirm stage update" />
            </div>
          </div>
        </div>
      ) : null}

      {activityModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mab-navy/40 p-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-mab-gold/40 bg-white p-6 shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-mab-gold">Log activity</p>
                <h2 className="text-xl font-semibold text-mab-navy">Capture the latest touchpoint</h2>
              </div>
              <button
                type="button"
                onClick={() => setActivityModalOpen(false)}
                className="rounded-full border border-mab-navy/20 px-3 py-1 text-sm text-mab-navy transition hover:bg-mab-navy hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-mab-slate">
                <span className="font-medium text-mab-navy">Type</span>
                <select
                  value={activityForm.type}
                  onChange={(event) => setActivityForm((prev) => ({ ...prev, type: event.target.value }))}
                  className="w-full rounded-xl border border-mab-navy/20 bg-white px-4 py-3 text-mab-navy shadow-sm focus:border-mab-gold focus:outline-none"
                >
                  {activityTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatStage(type)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-mab-slate">
                <span className="font-medium text-mab-navy">Occurred at</span>
                <input
                  type="datetime-local"
                  value={activityForm.occurredAt}
                  onChange={(event) => setActivityForm((prev) => ({ ...prev, occurredAt: event.target.value }))}
                  className="w-full rounded-xl border border-mab-navy/20 bg-white px-4 py-3 text-mab-navy shadow-sm focus:border-mab-gold focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-mab-slate">
                <span className="font-medium text-mab-navy">Duration (minutes)</span>
                <input
                  type="number"
                  min="0"
                  value={activityForm.durationMinutes}
                  onChange={(event) => setActivityForm((prev) => ({ ...prev, durationMinutes: event.target.value }))}
                  className="w-full rounded-xl border border-mab-navy/20 bg-white px-4 py-3 text-mab-navy shadow-sm focus:border-mab-gold focus:outline-none"
                  placeholder="30"
                />
              </label>
              <label className="space-y-2 text-sm text-mab-slate sm:col-span-2">
                <span className="font-medium text-mab-navy">Outcome</span>
                <textarea
                  rows={3}
                  value={activityForm.outcome}
                  onChange={(event) => setActivityForm((prev) => ({ ...prev, outcome: event.target.value }))}
                  className="w-full rounded-xl border border-mab-navy/20 bg-white px-4 py-3 text-mab-navy shadow-sm focus:border-mab-gold focus:outline-none"
                  placeholder="Summarize the call, objections, and next steps..."
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <PrimaryButton label="Save activity" onClick={handleActivitySubmit} ariaLabel="Save activity" />
              <PrimaryButton
                label="Cancel"
                variant="outline"
                onClick={() => setActivityModalOpen(false)}
                ariaLabel="Cancel logging"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
