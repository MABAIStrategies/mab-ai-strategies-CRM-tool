import { Card } from "../../../../src/components/ui/card";
import { PrimaryButton } from "../../../../src/components/ui/primary-button";

export default function UploadAssetPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Assets</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Upload New Asset</h1>
          <p className="mt-2 text-sm text-mab-slate">
            Add approved collateral so it can be surfaced automatically during follow-ups.
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
        <Card title="Asset Details" subtitle="Ensure versioned control">
          <form className="space-y-4 text-sm text-mab-slate">
            <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Asset Title</label>
            <input
              type="text"
              placeholder="Compliance Automation One-Pager"
              className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
            />
            <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Version</label>
            <input
              type="text"
              placeholder="v2.1"
              className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
            />
            <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Asset Tags</label>
            <input
              type="text"
              placeholder="Compliance, ROI, Executive"
              className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
            />
            <PrimaryButton label="Upload asset" ariaLabel="Upload asset" />
          </form>
        </Card>

        <Card title="Distribution Plan" subtitle="Where should it show up?">
          <div className="space-y-4 text-sm text-mab-slate">
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3">
              <p className="font-medium text-mab-navy">Discovery Calls</p>
              <p className="mt-1 text-xs text-mab-slate">
                Surface automatically after compliance or AI readiness questions.
              </p>
            </div>
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3">
              <p className="font-medium text-mab-navy">ROI Workshops</p>
              <p className="mt-1 text-xs text-mab-slate">
                Recommend for workshops with CFO or finance stakeholders.
              </p>
            </div>
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3">
              <p className="font-medium text-mab-navy">Executive Updates</p>
              <p className="mt-1 text-xs text-mab-slate">
                Use during quarterly check-ins for leadership teams.
              </p>
            </div>
            <PrimaryButton label="Review assets" variant="outline" href="/assets" ariaLabel="Review assets" />
          </div>
        </Card>
      </div>
    </div>
  );
}
