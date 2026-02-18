"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchInput } from "./ui/search-input";
import { PrimaryButton } from "./ui/primary-button";

type SearchState = "idle" | "loading" | "error";

type SearchResult =
  | {
      type: "company";
      id: string;
      title: string;
      subtitle: string;
      href: string;
    }
  | {
      type: "memory";
      id: string;
      sourceType: "NOTE" | "ACTIVITY" | "ASSET" | "EMAIL" | "DOC_LINK" | "OTHER";
      sourceId: string;
      title: string;
      excerpt: string;
      distance: number;
      href: string;
    };

const badgeMap: Record<SearchResult["type"], string> = {
  company: "Company",
  memory: "Memory"
};

const memoryLabelMap: Record<
  Extract<SearchResult, { type: "memory" }>["sourceType"],
  string
> = {
  NOTE: "Signal note",
  ACTIVITY: "Activity log",
  ASSET: "Sales asset",
  EMAIL: "Email memory",
  DOC_LINK: "Document link",
  OTHER: "Memory signal"
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [state, setState] = useState<SearchState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setState("loading");
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: { "x-csrf-token": "local-dev" }
      });
      if (!response.ok) {
        throw new Error("Search failed.");
      }
      const data = await response.json();
      setResults(data.results ?? []);
      setState("idle");
    } catch (error) {
      setState("error");
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-mab-gold/30 bg-mab-ivory/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-mab-gold/40 bg-white shadow-glow">
            <img src="/branding/mab-logo.svg" alt="MAB AI Strategies logo" className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-mab-gold">
              MAB Memory Console
            </p>
            <h2 className="text-xl font-semibold text-mab-navy">
              Hyper-interactive semantic search
            </h2>
            <p className="text-sm text-mab-slate">
              Surface the highest-intent signals across notes, assets, and activity.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">Lead Strategist</p>
            <p className="text-sm font-semibold text-mab-navy">MAB AI Strategies</p>
          </div>
          <img
            src="/branding/mab-headshot.svg"
            alt="Professional headshot"
            className="h-12 w-12 rounded-full border-2 border-mab-gold object-cover"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <SearchInput
          placeholder="Search memory artifacts, notes, assets, and companies"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <div className="flex flex-wrap gap-3">
          <PrimaryButton
            label={state === "loading" ? "Calibrating..." : "Run memory scan"}
            onClick={handleSearch}
            ariaLabel="Run memory scan"
            disabled={state === "loading"}
          />
          <PrimaryButton
            label="Open memory workspace"
            variant="outline"
            href="/workspace"
            ariaLabel="Open memory workspace"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-mab-slate">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 animate-pulse-glow rounded-full bg-mab-gold" />
          {state === "loading" ? "Synchronizing embeddings..." : "Press Enter or click Run memory scan"}
        </div>
        <span className="rounded-full border border-mab-gold/40 bg-white px-3 py-1 uppercase tracking-[0.3em] text-mab-navy">
          Semantic + exact
        </span>
      </div>

      {errorMessage ? (
        <p className="text-xs text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {results.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {results.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              className="group flex h-full flex-col justify-between gap-4 rounded-2xl border border-mab-gold/20 bg-white/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-mab-slate">
                  <span className="rounded-full border border-mab-gold/40 bg-mab-ivory px-3 py-1 uppercase tracking-[0.3em] text-mab-navy">
                    {badgeMap[result.type]}
                  </span>
                  {result.type === "memory" ? (
                    <span className="text-mab-gold">
                      {memoryLabelMap[result.sourceType]}
                    </span>
                  ) : null}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-mab-navy">
                    {result.title}
                  </h3>
                  <p className="mt-2 text-sm text-mab-slate">
                    {result.type === "memory" ? result.excerpt : result.subtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-mab-slate">
                <span>
                  {result.type === "memory"
                    ? `Relevance score: ${Math.max(0, 1 - result.distance).toFixed(2)}`
                    : "Account signal"}
                </span>
                <Link
                  href={result.href}
                  className="rounded-full border border-mab-gold/40 px-3 py-1 text-xs font-medium text-mab-navy transition hover:bg-mab-navy hover:text-white"
                >
                  Open signal →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-mab-gold/40 bg-white/60 p-6 text-sm text-mab-slate">
          Start with a high-intent query like “procurement urgency” to surface memory artifacts.
        </div>
      )}
    </div>
  );
}
