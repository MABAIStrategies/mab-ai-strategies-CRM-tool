"use client";

import { useState } from "react";
import { SearchInput } from "./ui/search-input";

type SearchState = "idle" | "loading" | "error";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
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
      setResults(
        (data.companies ?? []).map((company: { name: string }) => company.name)
      );
      setState("idle");
    } catch (error) {
      setState("error");
      setErrorMessage((error as Error).message);
    }
  };

  return (
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
      <div className="text-xs text-mab-slate">
        {state === "loading" ? "Searching..." : "Press Enter to search"}
      </div>
      {errorMessage ? (
        <p className="text-xs text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {results.length > 0 ? (
        <ul className="space-y-2 text-sm text-mab-slate">
          {results.map((result) => (
            <li key={result}>{result}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
