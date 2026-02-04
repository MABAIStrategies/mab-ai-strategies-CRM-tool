import { Card } from "../../../src/components/ui/card";
import { PrimaryButton } from "../../../src/components/ui/primary-button";

export default function TodayPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Today</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Momentum Command Center</h1>
          <p className="mt-2 text-sm text-mab-slate">
            Focus on calls, follow-ups, and next-step commitments. Everything here is auto-prioritized.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton label="Start rapid capture" href="/workspace" ariaLabel="Start rapid capture flow" />
          <PrimaryButton
            label="Launch command palette"
            variant="outline"
            href="/search"
            ariaLabel="Open command palette"
          />
          <PrimaryButton
            label="View finish line"
            variant="outline"
            href="/finish-line"
            ariaLabel="View finish line dashboard"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Today’s Priority Tasks" subtitle="7 due, 3 critical">
          <ul className="space-y-3 text-sm text-mab-slate">
            <li>Prepare follow-up for Brightline Logistics (Deal: Implementation)</li>
            <li>Send proposal draft to HarborTech</li>
            <li>Confirm discovery agenda with Westbridge Capital</li>
          </ul>
        </Card>
        <Card title="Next Calls" subtitle="Auto-sorted by urgency">
          <ul className="space-y-3 text-sm text-mab-slate">
            <li>11:00 AM – Margo Lee (Westbridge Capital)</li>
            <li>2:30 PM – Liam Chen (Brightline Logistics)</li>
            <li>4:15 PM – Pre-brief with internal team</li>
          </ul>
        </Card>
        <Card title="Top Deals by Momentum" subtitle="AI-calculated engagement">
          <ul className="space-y-3 text-sm text-mab-slate">
            <li>Westbridge Capital — Momentum 92</li>
            <li>Brightline Logistics — Momentum 81</li>
            <li>HarborTech — Momentum 76</li>
          </ul>
        </Card>
        <Card title="Finish Line Focus" subtitle="Unified progress snapshot">
          <div className="space-y-3 text-sm text-mab-slate">
            <p>Capture, memory, assets, and compliance are converging toward the final loop.</p>
            <PrimaryButton label="Open finish line" href="/finish-line" ariaLabel="Open finish line" />
          </div>
        </Card>
      </div>
    </div>
  );
}
