import Link from "next/link";
import { FolderPlus, ShieldCheck, Palette } from "lucide-react";

import PageHero from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssetsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHero
        title="Assets Vault"
        description="Curate the official MAB AI Strategies intelligence library. Protect brand standards, deploy creative campaigns, and keep every artifact aligned."
        badge="Assets"
        ctaLabel="Search Assets"
        ctaHref="/search"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Brand Standards",
            description: "Logos, colors, and executive messaging guidelines.",
            icon: ShieldCheck
          },
          {
            title: "Campaign Kits",
            description: "Launch-ready collateral and AI-powered strategy briefs.",
            icon: Palette
          },
          {
            title: "New Asset",
            description: "Add a new artifact to the intelligence vault.",
            icon: FolderPlus
          }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="transition hover:-translate-y-1 hover:border-mab-gold/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-mab-gold/40 bg-mab-navy-700">
                    <Icon className="h-5 w-5 text-mab-gold" />
                  </div>
                  {card.title}
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/workspace">Open {card.title}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
