import { Card } from "../../../src/components/ui/card";
import { PrimaryButton } from "../../../src/components/ui/primary-button";

const ideaStacks = [
  {
    title: "Pipeline acceleration",
    ideas: [
      "Auto-build a 3-touch follow-up sequence as soon as a discovery call is logged.",
      "Generate competitor battlecards from call notes and attach to active deals.",
      "Predict best send windows for follow-up outreach based on historic replies."
    ]
  },
  {
    title: "Experience design",
    ideas: [
      "Add celebratory micro-animations when a stage advances.",
      "Create at-a-glance confidence and urgency indicators on every deal.",
      "Pin narrative snippets so strategy context never gets lost."
    ]
  },
  {
    title: "Automation opportunities",
    ideas: [
      "Escalate deals stuck for 7+ days with AI-generated unblock suggestions.",
      "Auto-publish an end-of-day executive brief from tasks, notes, and wins.",
      "Create a one-click proposal starter from memory items + approved assets."
    ]
  }
];

export default function BrainstormingPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Brainstorming</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Design the Next Strategic Move</h1>
          <p className="mt-2 max-w-3xl text-sm text-mab-slate">
            Use this room to quickly ideate, prioritize, and route improvements toward execution.
            Every concept here is designed to move MAB AI Strategies CRM beyond MVP quality.
          </p>
        </div>
        <PrimaryButton label="Go to Superpowers" href="/superpowers" ariaLabel="Go to superpowers board" />
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {ideaStacks.map((stack) => (
          <Card key={stack.title} title={stack.title} subtitle="High-leverage ideas">
            <ul className="space-y-3 text-sm text-mab-slate">
              {stack.ideas.map((idea) => (
                <li key={idea} className="rounded-xl border border-mab-navy/10 bg-white/60 p-3">
                  {idea}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
