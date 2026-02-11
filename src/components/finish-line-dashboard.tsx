"use client";

import { Card } from "./ui/card";
import { PrimaryButton } from "./ui/primary-button";

const statusCards = [
  {
    title: "Rapid Capture Engine",
    status: "On track",
    progress: 86,
    nextStep: "Refine capture prompts and attach to every deal stage.",
    href: "/workspace"
  },
  {
    title: "Memory Brain",
    status: "Accelerating",
    progress: 78,
    nextStep: "Unify semantic search with recap snippets and action recall.",
    href: "/search"
  },
  {
    title: "Asset Forge",
    status: "In build",
    progress: 72,
    nextStep: "Lock templates + automate asset recommendations.",
    href: "/assets"
  },
  {
    title: "Compliance Guardrails",
    status: "Protected",
    progress: 92,
    nextStep: "Finalize outbound confirmation workflows.",
    href: "/finish-line"
  }
];

const directionSteps = [
  {
    title: "Unify the sales loop",
    detail: "Connect capture → memory → assets → follow-up with one-click actions."
  },
  {
    title: "Finish automation-ready templates",
    detail: "Finalize proposal, ROI, and compliance assets so they can be deployed instantly."
  },
  {
    title: "Operationalize momentum tracking",
    detail: "Surface momentum scores everywhere to drive daily focus."
  }
];

const loopSteps = [
  {
    title: "Capture",
    detail: "Fast notes + structured signals delivered into the memory graph."
  },
  {
    title: "Synthesize",
    detail: "AI summary + next-best actions broadcast to Today and Workspace."
  },
  {
    title: "Activate",
    detail: "Recommended assets and follow-ups one click away."
  },
  {
    title: "Advance",
    detail: "Stage change, compliance checks, and momentum tracking."
  }
];

export function FinishLineDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {statusCards.map((card) => (
          <Card key={card.title} title={card.title} subtitle={`Status: ${card.status}`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-mab-slate">
                <span>Completion</span>
                <span className="font-semibold text-mab-navy">{card.progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-mab-navy/10">
                <div
                  className="h-2 rounded-full bg-mab-gold transition-all duration-500"
                  style={{ width: `${card.progress}%` }}
                />
              </div>
              <p className="text-sm text-mab-slate">{card.nextStep}</p>
              <PrimaryButton label="Open next step" href={card.href} ariaLabel={`Open ${card.title}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Direction to Move Forward" subtitle="Strategic focus for finishing steps">
          <ol className="space-y-4 text-sm text-mab-slate">
            {directionSteps.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-mab-gold/20 bg-white/60 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">
                  Step {index + 1}
                </p>
                <p className="mt-2 font-medium text-mab-navy">{step.title}</p>
                <p className="mt-1 text-xs text-mab-slate">{step.detail}</p>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Unified Engagement Loop" subtitle="Bring the strands together">
          <div className="space-y-4 text-sm text-mab-slate">
            {loopSteps.map((step) => (
              <div
                key={step.title}
                className="group rounded-xl border border-mab-navy/10 bg-white/70 p-3 transition hover:-translate-y-1 hover:shadow-glow"
              >
                <p className="font-medium text-mab-navy">{step.title}</p>
                <p className="mt-1 text-xs text-mab-slate">{step.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Finish Line Actions" subtitle="Immediate moves to close the loop">
          <div className="space-y-4 text-sm text-mab-slate">
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3">
              <p className="font-medium text-mab-navy">Launch rapid capture</p>
              <p className="mt-1 text-xs text-mab-slate">Collect calls and signal data in seconds.</p>
              <div className="mt-3">
                <PrimaryButton label="Go to Workspace" href="/workspace" ariaLabel="Go to Workspace" />
              </div>
            </div>
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3">
              <p className="font-medium text-mab-navy">Sync assets and templates</p>
              <p className="mt-1 text-xs text-mab-slate">Keep every asset aligned to the next step.</p>
              <div className="mt-3">
                <PrimaryButton label="Open Assets" variant="outline" href="/assets" ariaLabel="Open Assets" />
              </div>
            </div>
            <div className="rounded-xl border border-mab-gold/20 bg-white/70 p-3">
              <p className="font-medium text-mab-navy">Search the memory brain</p>
              <p className="mt-1 text-xs text-mab-slate">Surface insights and next actions instantly.</p>
              <div className="mt-3">
                <PrimaryButton label="Open Search" href="/search" ariaLabel="Open Search" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
