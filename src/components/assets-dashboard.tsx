"use client";

import { useEffect, useState } from "react";
import { PrimaryButton } from "./ui/primary-button";
import { Card } from "./ui/card";

export type Asset = {
  id: string;
  title: string;
  description?: string | null;
  tags: string[];
  version: string;
  status: string;
};

export function AssetsDashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAssets = async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/assets", {
        headers: { "x-csrf-token": "local-dev" }
      });
      if (!response.ok) {
        throw new Error("Unable to load assets.");
      }
      const data = await response.json();
      setAssets(data.assets ?? []);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setErrorMessage((error as Error).message);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleCreate = async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": "local-dev" },
        body: JSON.stringify({
          title: "New Asset",
          type: "ONE_PAGER",
          tags: ["Auto"],
          version: "1.0",
          status: "DRAFT"
        })
      });
      if (!response.ok) {
        throw new Error("Unable to create asset.");
      }
      await loadAssets();
    } catch (error) {
      setStatus("error");
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <PrimaryButton label="Refresh" onClick={loadAssets} ariaLabel="Refresh assets" />
        <PrimaryButton label="Add asset" variant="outline" onClick={handleCreate} ariaLabel="Create asset" />
      </div>
      {status === "loading" ? <p className="text-sm text-mab-slate">Loading assets...</p> : null}
      {errorMessage ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {assets.map((asset) => (
          <Card key={asset.id} title={asset.title} subtitle={`v${asset.version} · ${asset.status}`}>
            <p className="text-sm text-mab-slate">{asset.description ?? "No description yet."}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-mab-slate">
              {asset.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-mab-gold/40 px-2 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
