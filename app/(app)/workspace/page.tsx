import { Card } from "../../../src/components/ui/card";
import { PrimaryButton } from "../../../src/components/ui/primary-button";
import { RapidCapture } from "../../../src/components/rapid-capture";

export default function WorkspacePage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Workspace</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Westbridge Capital</h1>
          <p className="mt-2 text-sm text-mab-slate">
            Deal stage: Discovery Completed · Momentum 92 · Next step: ROI inputs by Friday
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton label="Advance stage" href="/workspace" ariaLabel="Advance deal stage" />
          <PrimaryButton label="Log activity" variant="outline" href="/workspace" ariaLabel="Log activity" />
        </div>
      </header>

      <RapidCapture />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Timeline" subtitle="Calls, notes, and signals">
          <div className="space-y-4 text-sm text-mab-slate">
            <div>
              <p className="font-medium text-mab-navy">Discovery Call · 42 min</p>
              <p>Strong urgency around compliance automation. CFO wants ROI modeling.</p>
            </div>
            <div>
              <p className="font-medium text-mab-navy">LinkedIn Touchpoint</p>
              <p>Shared AI readiness checklist. Waiting on feedback.</p>
            </div>
          </div>
        </Card>
        <Card title="Tasks" subtitle="AI-suggested + manual">
          <ul className="space-y-3 text-sm text-mab-slate">
            <li>Draft follow-up email with ROI snapshot</li>
            <li>Attach Compliance Playbook asset</li>
            <li>Confirm stakeholder map with VP Ops</li>
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
