import Image from "next/image";

import { Card } from "../../../src/components/ui/card";
import { PrimaryButton } from "../../../src/components/ui/primary-button";

const engagementSignals = [
  {
    title: "Pulse Check",
    description: "See which accounts are heating up and where to lean in next.",
    action: { label: "Open engagement map", href: "/assets" }
  },
  {
    title: "Deal Momentum",
    description: "Prioritize revenue with AI-ranked momentum and risk scores.",
    action: { label: "Review momentum", href: "/workspace" }
  },
  {
    title: "Command Palette",
    description: "Trigger any workflow with a single, intelligent search.",
    action: { label: "Launch palette", href: "/search" }
  }
];

const rapidMoves = [
  {
    title: "Capture a new signal",
    detail: "Log a call, update a note, or add a stakeholder in seconds.",
    href: "/workspace",
    label: "Start rapid capture"
  },
  {
    title: "Refine next steps",
    detail: "Surface follow-ups that keep deals accelerating today.",
    href: "/assets",
    label: "Open deal canvas"
  },
  {
    title: "Ask the system",
    detail: "Query your CRM like an agentic partner.",
    href: "/search",
    label: "Ask a question"
  }
];

export default function TodayPage() {
  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-3xl border border-mab-gold/30 bg-mab-ivory px-8 py-10 shadow-glow">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mab-navy shadow-glow">
                <Image src="/branding/mab-logo.svg" alt="MAB AI Strategies logo" width={32} height={32} />
              </div>
              <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Today</p>
            </div>
            <h1 className="text-3xl font-semibold text-mab-navy sm:text-4xl">
              Momentum Command Center
            </h1>
            <p className="text-sm text-mab-slate sm:text-base">
              Orchestrate every high-value moment with AI-native guidance, hyper-interactive workflows, and
              always-on next steps.
            </p>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton label="Start rapid capture" href="/workspace" ariaLabel="Start rapid capture flow" />
              <PrimaryButton
                label="Launch command palette"
                variant="outline"
                href="/search"
                ariaLabel="Open command palette"
              />
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-mab-gold/30 bg-white/80 p-5 backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-mab-gold/40">
                <Image src="/branding/mab-headshot.svg" alt="MAB AI Strategies headshot" fill className="object-cover" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">AI Concierge</p>
                <p className="text-lg font-semibold text-mab-navy">MAB Strategy Lead</p>
                <p className="text-xs text-mab-slate">Standing by with precision prompts.</p>
              </div>
            </div>
            <div className="w-full rounded-xl border border-mab-gold/20 bg-mab-ivory/70 p-4">
              <p className="text-sm font-semibold text-mab-navy">Live Guidance</p>
              <p className="mt-2 text-xs text-mab-slate">
                &ldquo;Your best next move is to confirm Brightline&rsquo;s implementation timeline and send the
                stakeholder brief.&rdquo;
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <PrimaryButton label="Open brief" href="/assets" ariaLabel="Open stakeholder brief" size="sm" />
                <PrimaryButton
                  label="Send summary"
                  href="/workspace"
                  ariaLabel="Send summary update"
                  variant="outline"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        {engagementSignals.map((signal) => (
          <Card
            key={signal.title}
            title={signal.title}
            subtitle="AI-orchestrated intelligence"
            className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
          >
            <p className="text-sm text-mab-slate">{signal.description}</p>
            <div className="mt-4">
              <PrimaryButton
                label={signal.action.label}
                href={signal.action.href}
                ariaLabel={signal.action.label}
                size="sm"
                variant="outline"
              />
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card
          title="Rapid Moves"
          subtitle="Hyper-interactive action lane"
          className="space-y-4 border-mab-gold/40 bg-white/80"
        >
          {rapidMoves.map((move) => (
            <div
              key={move.title}
              className="flex flex-col gap-3 rounded-2xl border border-mab-gold/20 bg-mab-ivory/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
            >
              <div>
                <p className="text-sm font-semibold text-mab-navy">{move.title}</p>
                <p className="text-xs text-mab-slate">{move.detail}</p>
              </div>
              <PrimaryButton label={move.label} href={move.href} ariaLabel={move.label} size="sm" />
            </div>
          ))}
        </Card>
        <div className="grid gap-6">
          <Card title="Today’s Priority Tasks" subtitle="7 due, 3 critical" className="animate-pulse-glow">
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
        </div>
      </section>
    </div>
  );
}
