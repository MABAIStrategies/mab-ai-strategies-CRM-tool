"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { SearchInput } from "./ui/search-input";

type SearchState = "idle" | "loading" | "error";

type CompanyHit = {
  id: string;
  name: string;
  industry: string | null;
  region: string | null;
  domain: string | null;
};

type NoteHit = {
  id: string;
  summary: string | null;
  createdAt: string;
  company: { name: string };
};

type MemoryHit = {
  id: string;
  sourceType: string;
  sourceId: string;
  searchText: string | null;
  createdAt: string;
  companyName: string | null;
  matchType: "semantic" | "keyword";
};

type SearchResults = {
  companies: CompanyHit[];
  notes: NoteHit[];
  memoryItems: MemoryHit[];
};

const emptyResults: SearchResults = { companies: [], notes: [], memoryItems: [] };

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [state, setState] = useState<SearchState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalHits = useMemo(
    () =>
      results.companies.length + results.notes.length + results.memoryItems.length,
    [results]
  );

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults(emptyResults);
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
      const data = (await response.json()) as SearchResults;
      setResults({
        companies: data.companies ?? [],
        notes: data.notes ?? [],
        memoryItems: data.memoryItems ?? []
      });
      setState("idle");
    } catch (error) {
      setState("error");
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-mab-gold/30 bg-mab-ivory/80 p-4 shadow-sm">
        <Image
          src="/branding/mab-logo.svg"
          alt="MAB AI Strategies logo"
          width={160}
          height={48}
          className="h-10 w-auto"
        />
        <div className="flex-1 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-mab-gold">
            MAB AI Strategies
          </p>
          <p className="text-sm text-mab-slate">
            Hyper-interactive memory intelligence for every conversation.
          </p>
        </div>
        <Image
          src="/branding/mab-headshot.svg"
          alt="MAB AI Strategies professional headshot"
          width={64}
          height={64}
          className="h-14 w-14 rounded-full border border-mab-gold/60 bg-white shadow-glow"
        />
      </div>

      <div className="space-y-4">
        <SearchInput
          placeholder="Search memory artifacts, notes, and companies"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <div className="flex items-center justify-between text-xs text-mab-slate">
          <span>{state === "loading" ? "Searching..." : "Press Enter to search"}</span>
          <span className="font-medium text-mab-navy">
            {totalHits > 0 ? `${totalHits} curated hits` : "Awaiting your query"}
          </span>
        </div>
        {errorMessage ? (
          <p className="text-xs text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>

      {totalHits > 0 ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-mab-navy">Companies</h3>
              <span className="text-xs text-mab-slate">
                {results.companies.length} results
              </span>
            </div>
            <div className="space-y-3">
              {results.companies.map((company) => (
                <div
                  key={company.id}
                  className="group rounded-xl border border-mab-gold/20 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-mab-gold/60 hover:shadow-glow"
                >
                  <p className="text-sm font-semibold text-mab-navy">{company.name}</p>
                  <p className="mt-1 text-xs text-mab-slate">
                    {company.industry ?? "Industry TBD"} ·{" "}
                    {company.region ?? "Region TBD"}
                  </p>
                  {company.domain ? (
                    <p className="mt-1 text-xs text-mab-slate">{company.domain}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-mab-navy">Notes</h3>
              <span className="text-xs text-mab-slate">{results.notes.length} results</span>
            </div>
            <div className="space-y-3">
              {results.notes.map((note) => (
                <div
                  key={note.id}
                  className="group rounded-xl border border-mab-gold/20 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-mab-gold/60 hover:shadow-glow"
                >
                  <p className="text-xs font-semibold text-mab-gold">
                    {note.company?.name ?? "Company"}
                  </p>
                  <p className="mt-2 text-sm text-mab-navy">
                    {note.summary ?? "Summary pending — open for detail."}
                  </p>
                  <p className="mt-2 text-[11px] text-mab-slate">
                    Captured: {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-mab-navy">Memory Brain</h3>
              <span className="text-xs text-mab-slate">
                {results.memoryItems.length} results
              </span>
            </div>
            <div className="space-y-3">
              {results.memoryItems.map((memory) => (
                <div
                  key={memory.id}
                  className="group rounded-xl border border-mab-gold/20 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-mab-gold/60 hover:shadow-glow"
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-mab-gold">
                    <span>{memory.sourceType}</span>
                    <span>{memory.matchType}</span>
                  </div>
                  <p className="mt-2 text-sm text-mab-navy">
                    {memory.searchText ?? "Memory context loading..."}
                  </p>
                  <p className="mt-2 text-[11px] text-mab-slate">
                    {memory.companyName ?? "Company TBD"} ·{" "}
                    {new Date(memory.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
