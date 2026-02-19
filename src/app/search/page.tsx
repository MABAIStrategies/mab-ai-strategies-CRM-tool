"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Filter, Radar } from "lucide-react";

import PageHero from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { commandSchema } from "@/lib/schemas";

const suggestions = [
  "Surface top AI strategy opportunities",
  "Find active MAB AI Strategies partnerships",
  "Audit brand assets with low engagement"
];

export default function SearchPage() {
  const [query, setQuery] = React.useState("");
  const validation = React.useMemo(() => commandSchema.safeParse(query), [query]);

  return (
    <div className="flex flex-col gap-8">
      <PageHero
        title="Search Intelligence"
        description="Explore every insight with precision. Ask a question, scan the vault, or trigger an AI-guided discovery across the strategy stack."
        badge="Search"
        ctaLabel="Return to Today"
        ctaHref="/today"
      />

      <Card className="transition hover:-translate-y-1 hover:border-mab-gold/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Search className="h-5 w-5 text-mab-gold" />
            AI Search Console
          </CardTitle>
          <CardDescription>
            Query across assets, relationships, and strategic signals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask the strategy engine..."
              className="h-12 pl-12"
            />
            <Radar className="absolute left-4 top-3.5 h-5 w-5 text-mab-gold/70" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuery(item)}
                className="rounded-full border border-mab-gold/30 bg-mab-navy-700/50 px-4 py-2 text-xs text-mab-ivory/80 transition hover:border-mab-gold hover:text-mab-gold"
              >
                {item}
              </button>
            ))}
          </div>
          <p className="text-xs text-mab-ivory/60">
            {validation.success
              ? "Command parsed. Route results to Workspace or Assets."
              : "Enter at least 3 characters to ignite the intelligence scan."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/workspace">Route to Workspace</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/assets">
                <Filter className="h-4 w-4" />
                Filter Assets
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
