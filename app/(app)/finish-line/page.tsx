import { FinishLineDashboard } from "../../../src/components/finish-line-dashboard";
import { PrimaryButton } from "../../../src/components/ui/primary-button";

export default function FinishLinePage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Finish Line</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Unify the CRM Strands</h1>
          <p className="mt-2 text-sm text-mab-slate">
            This is the project control room—track progress across capture, memory, assets, and compliance,
            then drive everything toward the final operational finish.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton label="Review Today" href="/today" ariaLabel="Review today's priorities" />
          <PrimaryButton
            label="Open Workspace"
            variant="outline"
            href="/workspace"
            ariaLabel="Open workspace"
          />
        </div>
      </header>

      <FinishLineDashboard />
    </div>
  );
}
