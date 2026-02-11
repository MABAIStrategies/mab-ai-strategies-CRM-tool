import { TopCommandBar } from "@/components/layout/top-command-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <TopCommandBar />
      <div className="rounded-3xl border border-mab-gold/20 bg-mab-blue-2/60 p-8 shadow-panel">
        <h2 className="text-xl font-semibold text-mab-ivory">Search the vault</h2>
        <p className="mt-2 text-sm text-mab-ivory/70">
          Query every interaction, asset, and AI insight in one place.
        </p>
        <div className="mt-6 flex flex-col gap-4 lg:flex-row">
          <Input placeholder="Search people, accounts, or signals" />
          <Button className="lg:w-48">Scan memory</Button>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[
            "Last 30 days of discovery calls",
            "Top opportunities with high AI confidence",
            "Assets shared with healthcare prospects",
            "Unanswered questions from note capture"
          ].map((prompt) => (
            <button
              key={prompt}
              className="rounded-2xl border border-mab-gold/20 bg-mab-blue/60 p-4 text-left text-sm text-mab-ivory/80 transition hover:border-mab-gold/60 hover:text-mab-ivory"
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
