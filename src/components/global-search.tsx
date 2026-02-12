"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchInput } from "./ui/search-input";

type SemanticMatch = {
  id: string;
  sourceType: string;
  sourceId: string;
  searchText: string | null;
  similarity: number;
};

type SearchResponse = {
  semanticMatches: SemanticMatch[];
  keywordMatches: {
    companies: Array<{ id: string; name: string; industry: string | null }>;
    contacts: Array<{ id: string; name: string; title: string | null; companyId: string }>;
    deals: Array<{ id: string; title: string | null; stage: string; companyId: string }>;
  };
};

type SearchState = "idle" | "loading" | "error";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [response, setResponse] = useState<SearchResponse | null>(null);

  const hasResults = useMemo(() => {
    if (!response) {
      return false;
    }

    return (
      response.semanticMatches.length > 0 ||
      response.keywordMatches.companies.length > 0 ||
      response.keywordMatches.contacts.length > 0 ||
      response.keywordMatches.deals.length > 0
    );
  }, [response]);

  const handleSearch = async () => {
    if (query.trim().length < 2) {
      setResponse(null);
      setErrorMessage("Enter at least 2 characters to launch semantic recall.");
      return;
    }

    setState("loading");
    setErrorMessage(null);

    try {
      const result = await fetch(`/api/memory-items/search?q=${encodeURIComponent(query.trim())}`);
      if (!result.ok) {
        throw new Error("Semantic search was unable to complete.");
      }
      const payload = (await result.json()) as SearchResponse;
      setResponse(payload);
      setState("idle");
    } catch (error) {
      setState("error");
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-mab-gold/35 bg-gradient-to-br from-mab-navy via-[#102740] to-mab-navy p-6 text-mab-ivory shadow-glow">
      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-mab-gold">MAB AI Strategies Semantic Intelligence</p>
          <h2 className="text-2xl font-semibold">Ask once. Retrieve everything.</h2>
          <p className="text-sm text-mab-ivory/80">
            Hyper-interactive memory search across companies, contacts, deals, notes, and embedded insights.
          </p>
          <div className="group flex items-center gap-3 rounded-2xl border border-mab-gold/40 bg-mab-ivory/95 px-3 py-2 text-mab-ink transition-all duration-300 focus-within:border-mab-gold focus-within:shadow-glow hover:border-mab-gold hover:shadow-glow">
            <SearchInput
              placeholder="Try: CFO decision process for compliance automation"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              className="border-0 bg-transparent text-sm"
            />
            <button
              onClick={handleSearch}
              className="rounded-full bg-mab-gold px-4 py-2 text-xs font-semibold text-mab-navy transition-transform duration-200 hover:scale-[1.03]"
              type="button"
            >
              Launch Search
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-mab-ivory/80">
            <button type="button" onClick={() => setQuery("high-priority deal blockers this quarter")} className="rounded-full border border-mab-gold/45 px-3 py-1 hover:bg-mab-gold/20">
              Deal blockers
            </button>
            <button type="button" onClick={() => setQuery("follow-up tasks from discovery calls")} className="rounded-full border border-mab-gold/45 px-3 py-1 hover:bg-mab-gold/20">
              Discovery follow-ups
            </button>
            <Link href="/workspace" className="rounded-full border border-mab-gold/45 px-3 py-1 hover:bg-mab-gold/20">
              Open workspace
            </Link>
          </div>
          <p className="text-xs text-mab-ivory/70">{state === "loading" ? "Scanning vectors + CRM indexes..." : "Press Enter or click Launch Search."}</p>
          {errorMessage ? <p className="text-xs text-red-300">{errorMessage}</p> : null}
        </div>

        <div className="flex items-center justify-center gap-3 rounded-2xl border border-mab-gold/30 bg-mab-ivory/10 p-3">
          <Image src="/branding/mab-headshot.svg" width={68} height={68} alt="MAB AI Strategies professional headshot" className="h-16 w-16 rounded-full border border-mab-gold/60 bg-white object-cover" />
          <Image src="/branding/mab-logo.svg" width={120} height={44} alt="MAB AI Strategies official logo" className="h-11 w-auto" />
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-mab-gold/35 bg-white/95 p-4 text-mab-ink">
          <h3 className="text-sm font-semibold text-mab-navy">Semantic vector matches</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {response?.semanticMatches.map((match) => (
              <li key={match.id} className="rounded-xl border border-mab-gold/25 p-3 transition hover:border-mab-gold">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-mab-navy">{match.sourceType}</span>
                  <span className="text-xs text-mab-slate">{Math.round(match.similarity * 100)}% relevance</span>
                </div>
                <p className="mt-1 text-xs text-mab-slate">{match.searchText ?? `Source ID: ${match.sourceId}`}</p>
              </li>
            ))}
            {!response?.semanticMatches.length ? <li className="text-xs text-mab-slate">No semantic matches yet.</li> : null}
          </ul>
        </section>

        <section className="rounded-2xl border border-mab-gold/35 bg-white/95 p-4 text-mab-ink">
          <h3 className="text-sm font-semibold text-mab-navy">CRM exact matches</h3>
          <div className="mt-3 space-y-3 text-xs">
            <div>
              <p className="font-semibold text-mab-slate">Companies</p>
              <ul className="mt-1 space-y-1">
                {response?.keywordMatches.companies.map((item) => <li key={item.id}>{item.name}</li>)}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-mab-slate">Contacts</p>
              <ul className="mt-1 space-y-1">
                {response?.keywordMatches.contacts.map((item) => <li key={item.id}>{item.name}{item.title ? ` · ${item.title}` : ""}</li>)}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-mab-slate">Deals</p>
              <ul className="mt-1 space-y-1">
                {response?.keywordMatches.deals.map((item) => <li key={item.id}>{item.title ?? item.id}</li>)}
              </ul>
            </div>
            {!hasResults ? <p className="text-xs text-mab-slate">Run a query to populate semantic + keyword retrieval.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
