import { Card } from "../../../src/components/ui/card";
import { PrimaryButton } from "../../../src/components/ui/primary-button";

const superpowers = [
  {
    title: "AI Brief Composer",
    impact: "Turns notes + deals + tasks into polished executive briefings in seconds.",
    action: "Open Workspace",
    href: "/workspace"
  },
  {
    title: "Memory Precision Recall",
    impact: "Find the exact commitment, objection, or insight from any account instantly.",
    action: "Search Memory",
    href: "/search"
  },
  {
    title: "Asset Matchmaker",
    impact: "Recommends the best deck, one-pager, or proposal template for each stage.",
    action: "Open Assets",
    href: "/assets"
  },
  {
    title: "Finish Line Orchestrator",
    impact: "Aligns priorities across teams so work advances toward measurable outcomes.",
    action: "Open Finish Line",
    href: "/finish-line"
  }
];

export default function SuperpowersPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Superpowers</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Automation Capabilities Hub</h1>
          <p className="mt-2 max-w-3xl text-sm text-mab-slate">
            Activate high-impact AI capabilities from one screen. Each module is tuned to keep
            prospect momentum high while preserving strategic clarity.
          </p>
        </div>
        <a
          href="/how-to-guide.html"
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full border border-mab-gold/40 px-5 py-2 text-sm font-semibold text-mab-navy transition hover:bg-mab-gold/10"
        >
          Open HTML How-to Guide
        </a>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {superpowers.map((item) => (
          <Card key={item.title} title={item.title} subtitle="Built for MAB AI execution speed">
            <p className="text-sm text-mab-slate">{item.impact}</p>
            <div className="mt-4">
              <PrimaryButton label={item.action} href={item.href} ariaLabel={item.action} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
