import { prisma } from "../../../src/lib/db";
import { Card } from "../../../src/components/ui/card";
import { PrimaryButton } from "../../../src/components/ui/primary-button";
import { RapidCapture } from "../../../src/components/rapid-capture";

const activityLabels = {
  CALL: "Call",
  MEETING: "Meeting",
  EMAIL: "Email",
  LINKEDIN: "LinkedIn",
  OTHER: "Touchpoint"
};

export default async function WorkspacePage() {
  const [recentActivities, recentTasks] = await Promise.all([
    prisma.activity.findMany({
      where: { deletedAt: null },
      orderBy: { occurredAt: "desc" },
      take: 4,
      include: { contact: true, deal: true }
    }),
    prisma.task.findMany({
      where: { deletedAt: null, status: { not: "DONE" } },
      orderBy: { createdAt: "desc" },
      take: 4
    })
  ]);
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
        <Card title="Recent activity" subtitle="Live signals from inbox + calendar">
          <div className="space-y-4 text-sm text-mab-slate">
            {recentActivities.length ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-mab-gold/20 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow">
                  <p className="font-medium text-mab-navy">
                    {activityLabels[activity.type]} ·{" "}
                    {activity.durationMinutes ? `${activity.durationMinutes} min` : "Signal"}{" "}
                    <span className="text-xs text-mab-slate">
                      {new Date(activity.occurredAt).toLocaleString()}
                    </span>
                  </p>
                  <p className="mt-2">{activity.outcome ?? "Inbound update captured."}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.35em] text-mab-gold">
                    {activity.deal?.stage ?? "Active pipeline"} · {activity.contact?.name ?? "Primary stakeholder"}
                  </p>
                </div>
              ))
            ) : (
              <p>No live activity yet. Sync your inbox to start the flow.</p>
            )}
          </div>
        </Card>
        <Card title="Tasks" subtitle="AI-suggested + manual">
          <ul className="space-y-3 text-sm text-mab-slate">
            {recentTasks.length ? (
              recentTasks.map((task) => (
                <li
                  key={task.id}
                  className="rounded-xl border border-mab-gold/20 bg-white/70 px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-glow"
                >
                  <p className="font-medium text-mab-navy">{task.title}</p>
                  {task.description ? <p className="mt-1 text-xs">{task.description}</p> : null}
                </li>
              ))
            ) : (
              <>
                <li>Draft follow-up email with ROI snapshot</li>
                <li>Attach Compliance Playbook asset</li>
                <li>Confirm stakeholder map with VP Ops</li>
              </>
            )}
          </ul>
        </Card>
        <Card title="Assets" subtitle="Recommended for this deal">
          <ul className="space-y-3 text-sm text-mab-slate">
            <li>Compliance Automation One-Pager (v2.1)</li>
            <li>ROI Calculator Template (v1.4)</li>
            <li>Discovery Call Script (v3.0)</li>
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
    </div>
  );
}
