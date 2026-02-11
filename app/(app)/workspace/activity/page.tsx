import { Card } from "../../../../src/components/ui/card";
import { PrimaryButton } from "../../../../src/components/ui/primary-button";

export default function ActivityLogPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Workspace</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Log Activity</h1>
          <p className="mt-2 text-sm text-mab-slate">
            Capture every interaction, signal, and follow-up commitment in the MAB CRM memory brain.
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
        <Card title="New Activity" subtitle="Feed the memory brain">
          <form className="space-y-4 text-sm text-mab-slate">
            <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Activity Type</label>
            <select className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none">
              <option>Call Recap</option>
              <option>Follow-up Email</option>
              <option>Internal Strategy</option>
              <option>Asset Share</option>
            </select>
            <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Key Signals</label>
            <input
              type="text"
              placeholder="e.g. Compliance urgency, ROI interest, timing constraints"
              className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
            />
            <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Recap Notes</label>
            <textarea
              className="min-h-[140px] w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
              placeholder="Summarize the conversation and the next best action."
            />
            <PrimaryButton label="Save activity" ariaLabel="Save activity" />
          </form>
        </Card>

        <Card title="Suggested Next Moves" subtitle="Hyper-interactive follow-up">
          <div className="space-y-4 text-sm text-mab-slate">
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3 transition hover:-translate-y-1 hover:shadow-glow">
              <p className="font-medium text-mab-navy">Draft ROI snapshot</p>
              <p className="mt-1 text-xs text-mab-slate">
                Auto-generate the ROI summary for Westbridge Capital.
              </p>
              <div className="mt-3">
                <PrimaryButton label="Open Assets" href="/assets" ariaLabel="Open assets" />
              </div>
            </div>
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3 transition hover:-translate-y-1 hover:shadow-glow">
              <p className="font-medium text-mab-navy">Schedule technical workshop</p>
              <p className="mt-1 text-xs text-mab-slate">
                Coordinate internal AI engineer participation.
              </p>
              <div className="mt-3">
                <PrimaryButton label="Review Today" variant="outline" href="/today" ariaLabel="Review today" />
              </div>
            </div>
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3 transition hover:-translate-y-1 hover:shadow-glow">
              <p className="font-medium text-mab-navy">Confirm compliance approval</p>
              <p className="mt-1 text-xs text-mab-slate">
                Log approval for outbound assets and outreach.
              </p>
              <div className="mt-3">
                <PrimaryButton label="Advance Stage" href="/workspace/advance" ariaLabel="Advance stage" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
