import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-3xl border border-mab-gold/20 bg-mab-blue-2/60 p-10 shadow-panel">
        <p className="text-xs uppercase tracking-[0.4em] text-mab-gold/70">
          Launch Sequence
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-mab-ivory">
          Welcome to the MAB AI Strategies CRM
        </h1>
        <p className="mt-3 max-w-2xl text-base text-mab-ivory/70">
          Dive into a hyper-interactive workspace crafted for precision
          prospecting, AI-assisted capture, and strategic momentum.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/workspace">Enter Workspace</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/today">View Today's Pulse</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Quick Capture",
            description:
              "Start a new discovery call log, voice memo, or tactical plan in seconds.",
            href: "/workspace"
          },
          {
            title: "Daily Focus",
            description:
              "Surface every priority, follow-up, and recommendation queued for today.",
            href: "/today"
          },
          {
            title: "Asset Vault",
            description:
              "Jump into the latest decks, battlecards, and email sequences.",
            href: "/assets"
          }
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-3xl border border-mab-gold/20 bg-mab-blue-2/60 p-6 transition hover:-translate-y-1 hover:border-mab-gold/60 hover:shadow-glow"
          >
            <h2 className="text-lg font-semibold text-mab-ivory">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-mab-ivory/70">
              {card.description}
            </p>
            <span className="mt-4 inline-flex text-xs font-semibold text-mab-gold">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
