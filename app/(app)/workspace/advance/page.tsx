import { Card } from "../../../../src/components/ui/card";
import { PrimaryButton } from "../../../../src/components/ui/primary-button";

export default function AdvanceStagePage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Workspace</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Advance Deal Stage</h1>
          <p className="mt-2 text-sm text-mab-slate">
            Move the opportunity forward with clear next steps, compliance checks, and momentum signals.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton label="Back to Workspace" href="/workspace" ariaLabel="Back to workspace" />
          <PrimaryButton
            label="Open Finish Line"
            variant="outline"
            href="/finish-line"
            ariaLabel="Open finish line dashboard"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Stage Update" subtitle="Lock in the next milestone">
          <form className="space-y-4 text-sm text-mab-slate">
            <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">New Stage</label>
            <select className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none">
              <option>Discovery Completed</option>
              <option>Solution Mapping</option>
              <option>Proposal Drafting</option>
              <option>Negotiation</option>
            </select>
            <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Momentum Notes</label>
            <textarea
              className="min-h-[140px] w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
              placeholder="Capture why momentum is moving and what must happen next."
            />
            <PrimaryButton label="Confirm stage advance" ariaLabel="Confirm stage advance" />
          </form>
        </Card>

        <Card title="Compliance Checkpoints" subtitle="Required before automation">
          <div className="space-y-4 text-sm text-mab-slate">
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3">
              <p className="font-medium text-mab-navy">Outbound approval</p>
              <p className="mt-1 text-xs text-mab-slate">Confirm stakeholder consent before sending assets.</p>
            </div>
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3">
              <p className="font-medium text-mab-navy">Data residency</p>
              <p className="mt-1 text-xs text-mab-slate">Validate Cloud Run + Cloud SQL deployment plan.</p>
            </div>
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3">
              <p className="font-medium text-mab-navy">Decision path</p>
              <p className="mt-1 text-xs text-mab-slate">Confirm CFO and VP Ops are aligned on ROI review.</p>
            </div>
            <PrimaryButton label="Log compliance confirmation" href="/workspace/activity" ariaLabel="Log compliance confirmation" />
          </div>
        </Card>
      </div>
    </div>
  );
}
