"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { AssetsDashboard } from "../../../src/components/assets-dashboard";
import { TemplatesDashboard } from "../../../src/components/templates-dashboard";
import { PrimaryButton } from "../../../src/components/ui/primary-button";

const assetTypes = ["ONE_PAGER", "PROPOSAL", "DECK", "CALCULATOR", "SCRIPT", "TEMPLATE", "OTHER"];

export default function AssetsPage() {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const statusCopy = useMemo(() => {
    if (uploadStatus === "uploading") {
      return "Securely transmitting to the MAB asset vault.";
    }
    if (uploadStatus === "success") {
      return "Upload complete. Asset is now visible in the repository.";
    }
    if (uploadStatus === "error") {
      return uploadMessage ?? "Upload failed. Please retry.";
    }
    return "Ready to capture your latest sales narrative.";
  }, [uploadStatus, uploadMessage]);

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadStatus("uploading");
    setUploadMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "x-csrf-token": "local-dev" },
        body: formData
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error ?? "Unable to upload asset.");
      }
      form.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setUploadStatus("success");
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage((error as Error).message);
    } finally {
      setTimeout(() => {
        setUploadStatus("idle");
        setUploadMessage(null);
      }, 4500);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Assets</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Sales Material Repository</h1>
          <p className="mt-2 text-sm text-mab-slate">
            Curate templates, calculators, and approved narratives with versioned control.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-mab-gold/30 bg-white/70 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <img src="/branding/mab-logo.svg" alt="MAB AI Strategies logo" className="h-10 w-10" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">MAB AI</p>
              <p className="text-sm font-semibold text-mab-navy">Asset Command</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <img
              src="/branding/mab-headshot.svg"
              alt="Professional headshot"
              className="h-10 w-10 rounded-full border-2 border-mab-gold object-cover"
            />
            <div className="text-xs text-mab-slate">
              <p className="font-semibold text-mab-navy">MAB Strategist</p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-mab-gold">Live Ops</p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <form
          onSubmit={handleUpload}
          className="space-y-6 rounded-2xl border border-mab-gold/30 bg-white/80 p-6 shadow-glow"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-mab-gold">Upload Pipeline</p>
              <h2 className="mt-2 text-xl font-semibold text-mab-navy">Launch a new asset with precision.</h2>
              <p className="mt-2 text-sm text-mab-slate">
                Attach a file or reference a GCS-compatible URI to keep the team aligned.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-mab-gold/40 px-4 py-2 text-xs text-mab-navy">
              <span
                className={`h-2 w-2 rounded-full ${
                  uploadStatus === "uploading"
                    ? "animate-pulse-glow bg-mab-gold"
                    : uploadStatus === "success"
                      ? "bg-mab-navy"
                      : uploadStatus === "error"
                        ? "bg-red-500"
                        : "bg-mab-gold/60"
                }`}
              />
              <span className="font-medium">{statusCopy}</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-mab-gold">Asset Title</label>
              <input
                name="title"
                placeholder="Q4 Executive Brief"
                className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-mab-gold">Asset Type</label>
              <select
                name="type"
                className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
                defaultValue="ONE_PAGER"
              >
                {assetTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-mab-gold">Version</label>
              <input
                name="version"
                placeholder="1.0"
                className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
                defaultValue="1.0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-mab-gold">Tags</label>
              <input
                name="tags"
                placeholder="Executive, ROI, GTM"
                className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-mab-gold">Description</label>
            <textarea
              name="description"
              placeholder="Summarize the asset’s business impact."
              className="min-h-[120px] w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-mab-gold">File Upload</label>
              <input
                ref={fileInputRef}
                name="file"
                type="file"
                className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
              />
              <p className="text-xs text-mab-slate">PDF, slides, or document exports supported.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-mab-gold">Storage URI</label>
              <input
                name="storageUri"
                placeholder="gs://mab-assets/exec-brief.pdf"
                className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
              />
              <p className="text-xs text-mab-slate">Optional for GCS-compatible storage.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton
              label={uploadStatus === "uploading" ? "Uploading..." : "Upload to vault"}
              ariaLabel="Upload asset to vault"
              disabled={uploadStatus === "uploading"}
              type="submit"
            />
            <PrimaryButton
              label="Generate from template"
              variant="outline"
              href="/assets/generate"
              ariaLabel="Generate asset from template"
            />
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-mab-gold/30 bg-mab-navy px-5 py-6 text-sm text-white shadow-glow">
            <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">Engagement Pulse</p>
            <h3 className="mt-3 text-lg font-semibold">Hyper-interactive follow-through.</h3>
            <p className="mt-2 text-sm text-white/80">
              Encourage stakeholders to respond by sharing tailored assets at the exact moment they need them.
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs">
              <span className="rounded-full border border-mab-gold/40 px-3 py-1">Live sync enabled</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Auto-tag ready</span>
            </div>
          </div>
          <div className="rounded-2xl border border-mab-navy/10 bg-white/70 p-5 text-sm text-mab-slate transition hover:-translate-y-1 hover:shadow-glow">
            <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">Pro Tip</p>
            <p className="mt-2 font-medium text-mab-navy">Pair every upload with a generation plan.</p>
            <p className="mt-2 text-xs text-mab-slate">
              Use the template generator to deliver an executive-ready variant in minutes.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <AssetsDashboard refreshKey={refreshKey} />
        <TemplatesDashboard />
      </div>
    </div>
  );
}
