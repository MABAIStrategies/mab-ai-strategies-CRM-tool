import { TopCommandBar } from "@/components/layout/top-command-bar";
import { Button } from "@/components/ui/button";

const assets = [
  { title: "AI Discovery Deck", tag: "Deck" },
  { title: "Industry Signals Report", tag: "Intel" },
  { title: "CRM Pilot Playbook", tag: "Playbook" }
];

export default function AssetsPage() {
  return (
    <div className="space-y-8">
      <TopCommandBar />
      <div className="grid gap-6 lg:grid-cols-3">
        {assets.map((asset) => (
          <div
            key={asset.title}
            className="rounded-3xl border border-mab-gold/20 bg-mab-blue-2/60 p-6 shadow-panel"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-mab-gold/40 px-3 py-1 text-xs text-mab-gold">
                {asset.tag}
              </span>
              <span className="text-xs text-mab-ivory/60">Updated 2h ago</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-mab-ivory">
              {asset.title}
            </h3>
            <p className="mt-2 text-sm text-mab-ivory/70">
              Launch the latest version, or schedule a tailored update.
            </p>
            <Button size="sm" className="mt-6">
              Open asset
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
