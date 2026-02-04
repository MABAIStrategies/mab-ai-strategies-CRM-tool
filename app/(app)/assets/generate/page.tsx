import { Card } from "../../../../src/components/ui/card";
import { PrimaryButton } from "../../../../src/components/ui/primary-button";

export default function GenerateAssetPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Assets</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Generate from Template</h1>
          <p className="mt-2 text-sm text-mab-slate">
            Activate approved templates with AI-driven context so every asset is deal-ready.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton label="Back to Assets" href="/assets" ariaLabel="Back to assets" />
          <PrimaryButton
            label="Open Finish Line"
            variant="outline"
            href="/finish-line"
            ariaLabel="Open finish line dashboard"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Template Activation" subtitle="Choose the right playbook">
          <form className="space-y-4 text-sm text-mab-slate">
            <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Template</label>
            <select className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none">
              <option>ROI Snapshot</option>
              <option>Compliance Playbook</option>
              <option>Discovery Summary</option>
              <option>Executive Update</option>
            </select>
            <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Deal Context</label>
            <textarea
              className="min-h-[140px] w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
              placeholder="Include the client, stage, urgency, and key objections."
            />
            <PrimaryButton label="Generate asset" ariaLabel="Generate asset" />
          </form>
        </Card>

        <Card title="Delivery Options" subtitle="Keep it hyper-interactive">
          <div className="space-y-4 text-sm text-mab-slate">
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3">
              <p className="font-medium text-mab-navy">Send to stakeholder</p>
              <p className="mt-1 text-xs text-mab-slate">
                Package as a personalized summary with next-step CTA.
              </p>
            </div>
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3">
              <p className="font-medium text-mab-navy">Attach to recap</p>
              <p className="mt-1 text-xs text-mab-slate">
                Append to the most recent call notes.
              </p>
            </div>
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3">
              <p className="font-medium text-mab-navy">Schedule internal review</p>
              <p className="mt-1 text-xs text-mab-slate">
                Alert internal strategists before external delivery.
              </p>
            </div>
            <PrimaryButton label="Review templates" variant="outline" href="/assets" ariaLabel="Review templates" />
          </div>
        </Card>
      </div>
    </div>
  );
}
