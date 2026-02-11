import { AssetsDashboard } from "../../../src/components/assets-dashboard";
import { TemplatesDashboard } from "../../../src/components/templates-dashboard";
import { PrimaryButton } from "../../../src/components/ui/primary-button";

export default function AssetsPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Assets</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Sales Material Repository</h1>
          <p className="mt-2 text-sm text-mab-slate">
            Curate templates, calculators, and approved narratives with versioned control.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton label="Upload asset" href="/assets/upload" ariaLabel="Upload asset" />
          <PrimaryButton
            label="Generate from template"
            variant="outline"
            href="/assets/generate"
            ariaLabel="Generate asset from template"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <AssetsDashboard />
        <TemplatesDashboard />
      </div>
    </div>
  );
}
