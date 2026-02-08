"use client";

import { useEffect, useState } from "react";
import { PrimaryButton } from "./ui/primary-button";
import { Card } from "./ui/card";

export type Asset = {
  id: string;
  title: string;
  description?: string | null;
  tags: string[];
  type: string;
  version: string;
  status: string;
  storageUri: string;
  createdAt: string;
};

export function AssetsDashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

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

  const handleApprove = async (assetId: string) => {
    setActionStatus("Approving asset...");
    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf-token": "local-dev" },
        body: JSON.stringify({ status: "APPROVED" })
      });
      if (!response.ok) {
        throw new Error("Unable to approve asset.");
      }
      await loadAssets();
      setActionStatus("Asset approved.");
    } catch (error) {
      setActionStatus((error as Error).message);
    }
  };

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
      {actionStatus ? <p className="text-xs text-mab-slate">{actionStatus}</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {assets.map((asset) => (
          <Card key={asset.id} title={asset.title} subtitle={`v${asset.version} · ${asset.status}`}>
            <p className="text-sm text-mab-slate">{asset.description ?? "No description yet."}</p>
            <div className="mt-4 grid gap-3 text-xs text-mab-slate sm:grid-cols-2">
              <div className="rounded-xl border border-mab-navy/10 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow">
                <p className="text-[0.7rem] uppercase tracking-[0.3em] text-mab-gold">Asset Type</p>
                <p className="mt-1 text-sm font-medium text-mab-navy">{asset.type}</p>
              </div>
              <div className="rounded-xl border border-mab-navy/10 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow">
                <p className="text-[0.7rem] uppercase tracking-[0.3em] text-mab-gold">Storage</p>
                <a
                  href={asset.storageUri}
                  className="mt-1 block truncate text-sm font-medium text-mab-navy underline decoration-mab-gold/60 underline-offset-4"
                >
                  {asset.storageUri}
                </a>
              </div>
              <div className="rounded-xl border border-mab-navy/10 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow">
                <p className="text-[0.7rem] uppercase tracking-[0.3em] text-mab-gold">Created</p>
                <p className="mt-1 text-sm font-medium text-mab-navy">
                  {new Date(asset.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="rounded-xl border border-mab-navy/10 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow">
                <p className="text-[0.7rem] uppercase tracking-[0.3em] text-mab-gold">Status</p>
                <p className="mt-1 text-sm font-medium text-mab-navy">{asset.status}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-mab-slate">
              {asset.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-mab-gold/40 px-2 py-1">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <PrimaryButton
                label="Review details"
                onClick={() => setSelectedAsset(asset)}
                ariaLabel={`Review ${asset.title}`}
              />
              <PrimaryButton
                label="Approve"
                variant="outline"
                onClick={() => handleApprove(asset.id)}
                ariaLabel={`Approve ${asset.title}`}
                disabled={asset.status === "APPROVED"}
              />
            </div>
          </Card>
        ))}
      </div>
      {selectedAsset ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mab-navy/60 p-6">
          <div className="w-full max-w-2xl rounded-3xl bg-mab-ivory p-6 shadow-xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-mab-gold">Asset Review</p>
                <h2 className="mt-2 text-2xl font-semibold text-mab-navy">{selectedAsset.title}</h2>
                <p className="mt-1 text-sm text-mab-slate">{selectedAsset.description ?? "No description yet."}</p>
              </div>
              <div className="flex items-center gap-3">
                <img src="/branding/mab-logo.svg" alt="MAB AI Strategies logo" className="h-10 w-10" />
                <img
                  src="/branding/mab-headshot.svg"
                  alt="MAB AI Strategies leadership headshot"
                  className="h-10 w-10 rounded-full border border-mab-gold/50 bg-white"
                />
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-mab-navy/10 bg-white/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">Type</p>
                <p className="mt-1 text-sm font-semibold text-mab-navy">{selectedAsset.type}</p>
              </div>
              <div className="rounded-2xl border border-mab-navy/10 bg-white/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">Status</p>
                <p className="mt-1 text-sm font-semibold text-mab-navy">{selectedAsset.status}</p>
              </div>
              <div className="rounded-2xl border border-mab-navy/10 bg-white/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">Version</p>
                <p className="mt-1 text-sm font-semibold text-mab-navy">{selectedAsset.version}</p>
              </div>
              <div className="rounded-2xl border border-mab-navy/10 bg-white/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">Storage</p>
                <a
                  href={selectedAsset.storageUri}
                  className="mt-1 block text-sm font-semibold text-mab-navy underline decoration-mab-gold/60 underline-offset-4"
                >
                  {selectedAsset.storageUri}
                </a>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedAsset.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-mab-gold/40 px-3 py-1 text-xs text-mab-slate">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <PrimaryButton label="Close" variant="outline" onClick={() => setSelectedAsset(null)} />
              <PrimaryButton
                label="Approve asset"
                onClick={() => {
                  handleApprove(selectedAsset.id);
                  setSelectedAsset(null);
                }}
                ariaLabel="Approve asset"
                disabled={selectedAsset.status === "APPROVED"}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
