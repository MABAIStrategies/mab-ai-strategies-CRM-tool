import { Card } from "../../../src/components/ui/card";
import { RapidCapture } from "../../../src/components/rapid-capture";
import { PrimaryButton } from "../../../src/components/ui/primary-button";
import { getWorkspaceSnapshot } from "../../../src/lib/dashboard-queries";

export const revalidate = 60;

const formatStage = (stage: string) =>
  stage
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const formatDate = (date: Date | string) => {
  const normalizedDate = typeof date === "string" ? new Date(date) : date;
  return normalizedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default async function WorkspacePage({
  searchParams
}: {
  searchParams?: { capture?: string };
}) {
  const params = searchParams;
  const { focusDeal, timeline, tasks, assets } = await getWorkspaceSnapshot();

  const dealStage = focusDeal ? formatStage(focusDeal.stage) : "Pipeline";
  const nextStep = focusDeal?.nextStepDate ? formatDate(focusDeal.nextStepDate) : "Queue next step";
  const openRapidCapture = params?.capture === "1";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Workspace</p>
          <h1 className="text-3xl font-semibold text-mab-navy">
            {focusDeal?.companyName ?? "Pipeline Account"}
          </h1>
          <p className="mt-2 text-sm text-mab-slate">
            Deal stage: {dealStage} · Momentum {focusDeal?.momentumScore ?? 0} · Next step: {nextStep}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton label="Advance stage" href="/workspace/advance" ariaLabel="Advance deal stage" />
          <PrimaryButton label="Log activity" variant="outline" href="/workspace/activity" ariaLabel="Log activity" />
        </div>
      </header>

      <RapidCapture defaultOpen={openRapidCapture} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Timeline" subtitle="Calls, notes, and signals" data={timeline}>
          {(items) => (
            <div className="space-y-4 text-sm text-mab-slate">
              {items.length ? (
                items.map((item) => (
                  <div key={item.id}>
                    <p className="font-medium text-mab-navy">
                      {formatStage(item.type)} · {formatDate(item.occurredAt)}
                      {item.durationMinutes ? ` · ${item.durationMinutes} min` : ""}
                    </p>
                    <p>{item.outcome ?? "Outcome captured."}</p>
                  </div>
                ))
              ) : (
                <p className="text-mab-slate/70">Log activity to populate the engagement timeline.</p>
              )}
            </div>
          )}
        </Card>
        <Card title="Tasks" subtitle="AI-suggested + manual" data={tasks}>
          {(items) => (
            <ul className="space-y-3 text-sm text-mab-slate">
              {items.length ? (
                items.map((task) => (
                  <li key={task.id}>
                    {task.title} · {formatStage(task.status)}
                    {task.dueAt ? ` (${formatDate(task.dueAt)})` : ""}
                  </li>
                ))
              ) : (
                <li className="text-mab-slate/70">No open tasks. Add a next step to keep momentum.</li>
              )}
            </ul>
          )}
        </Card>
        <Card title="Assets" subtitle="Recommended for this deal" data={assets}>
          {(items) => (
            <ul className="space-y-3 text-sm text-mab-slate">
              {items.length ? (
                items.map((asset) => (
                  <li key={asset.id}>
                    {asset.title} (v{asset.version}) · {formatStage(asset.status)}
                  </li>
                ))
              ) : (
                <li className="text-mab-slate/70">No assets recommended yet. Upload one to start.</li>
              )}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Copilot" subtitle="Account Brief · Objection Radar · Next Best Action">
        <div className="grid gap-4 text-sm text-mab-slate lg:grid-cols-3">
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
