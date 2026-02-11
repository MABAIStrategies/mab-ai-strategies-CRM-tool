import { Card } from "../../../src/components/ui/card";
import { GlobalSearch } from "../../../src/components/global-search";

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Search</p>
        <h1 className="text-3xl font-semibold text-mab-navy">Memory Brain Search</h1>
        <p className="mt-2 text-sm text-mab-slate">
          Search across companies, contacts, deals, notes, tasks, and memory artifacts.
        </p>
      </header>

      <GlobalSearch />

      <Card title="Recent Memory Hits" subtitle="Semantic + exact match">
        <ul className="space-y-3 text-sm text-mab-slate">
          <li>“Compliance automation urgency” · Note from Westbridge Capital</li>
          <li>“ROI calculator” · Asset recommendation</li>
          <li>“Decision process: CFO + VP Ops” · Discovery note extract</li>
        </ul>
      </Card>
    </div>
  );
}
