import { TopCommandBar } from "@/components/layout/top-command-bar";
import { Button } from "@/components/ui/button";

const priorities = [
  {
    title: "Morning pipeline review",
    detail: "6 accounts need strategic notes before noon."
  },
  {
    title: "Discovery call — Orion Labs",
    detail: "Prep AI briefing + 3 deep-dive questions."
  },
  {
    title: "Follow-up pulse",
    detail: "Send recap to 2 stakeholders in Financial Services."
  }
];

export default function TodayPage() {
  return (
    <div className="space-y-8">
      <TopCommandBar />
      <div className="rounded-3xl border border-mab-gold/20 bg-mab-blue-2/60 p-8 shadow-panel">
        <h2 className="text-xl font-semibold text-mab-ivory">Today's priorities</h2>
        <div className="mt-6 space-y-4">
          {priorities.map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between rounded-2xl border border-mab-gold/10 bg-mab-blue/60 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-mab-ivory">{item.title}</p>
                <p className="text-xs text-mab-ivory/70">{item.detail}</p>
              </div>
              <Button variant="outline" size="sm">
                Act now
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
