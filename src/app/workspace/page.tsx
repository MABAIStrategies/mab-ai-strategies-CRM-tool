import Link from "next/link";
import { ArrowUpRight, Activity, Layers, Sparkles } from "lucide-react";

import PageHero from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkspacePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHero
        title="Workspace Intelligence"
        description="Orchestrate every strategic signal across the MAB AI Strategies ecosystem. Deploy playbooks, monitor KPI resonance, and activate the team with one glimmering command."
        badge="Workspace"
        ctaLabel="Open Strategy Canvas"
        ctaHref="/assets"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Executive Pulse",
            description: "Track pipeline velocity, revenue impact, and live AI strategy initiatives.",
            icon: Activity
          },
          {
            title: "Brand Orchestration",
            description: "Align assets, messaging, and competitive intel inside one living library.",
            icon: Layers
          },
          {
            title: "Momentum Triggers",
            description: "Launch the next strategic action with guided AI recommendations.",
            icon: Sparkles
          }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="transition hover:-translate-y-1 hover:border-mab-gold/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-mab-gold/40 bg-mab-navy-700">
                    <Icon className="h-6 w-6 text-mab-gold" />
                  </div>
                  <div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/today">
                    Deploy Action
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
