import { TopCommandBar } from "@/components/layout/top-command-bar";
import { Button } from "@/components/ui/button";

export default function WorkspacePage() {
  return (
    <div className="space-y-8">
      <TopCommandBar />
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Launch discovery log",
            description:
              "Capture call notes, sentiment, and next steps with AI assist."
          },
          {
            title: "Start account briefing",
            description:
              "Generate a tailored briefing with strategy, org intel, and risks."
          },
          {
            title: "Draft follow-up",
            description:
              "Trigger an email, LinkedIn message, or task list in one click."
          }
        ].map((card) => (
          <div
            key={card.title}
            className="group rounded-3xl border border-mab-gold/20 bg-mab-blue-2/60 p-6 transition hover:-translate-y-1 hover:border-mab-gold/60 hover:shadow-glow"
          >
            <h2 className="text-lg font-semibold text-mab-ivory">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-mab-ivory/70">
              {card.description}
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              Engage
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
