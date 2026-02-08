"use client";

import { useState } from "react";
import { PrimaryButton } from "./ui/primary-button";

export function AssetUploadForm() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/assets/upload", {
        method: "POST",
        headers: { "x-csrf-token": "local-dev" },
        body: formData
      });
      if (!response.ok) {
        throw new Error("Unable to upload asset.");
      }
      const payload = await response.json();
      setStatusMessage(`Asset uploaded to ${payload.asset.storageUri}`);
      event.currentTarget.reset();
    } catch (error) {
      setStatusMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4 text-sm text-mab-slate" onSubmit={handleSubmit}>
      <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Asset Title</label>
      <input
        type="text"
        name="title"
        placeholder="Compliance Automation One-Pager"
        className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
      />
      <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Description</label>
      <textarea
        name="description"
        placeholder="Executive-ready summary for compliance automation."
        className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
        rows={3}
      />
      <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Version</label>
      <input
        type="text"
        name="version"
        placeholder="v2.1"
        className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
      />
      <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Asset Tags</label>
      <input
        type="text"
        name="tags"
        placeholder="Compliance, ROI, Executive"
        className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
      />
      <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Asset Type</label>
      <select
        name="type"
        className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
        defaultValue="ONE_PAGER"
      >
        <option value="SCRIPT">Script</option>
        <option value="ONE_PAGER">One-Pager</option>
        <option value="PROPOSAL">Proposal</option>
        <option value="TEMPLATE">Template</option>
        <option value="CALCULATOR">Calculator</option>
        <option value="DECK">Deck</option>
        <option value="OTHER">Other</option>
      </select>
      <label className="block text-xs uppercase tracking-[0.3em] text-mab-gold">Upload File</label>
      <input
        type="file"
        name="file"
        required
        className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm file:mr-4 file:rounded-full file:border-0 file:bg-mab-navy file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-mab-navy/90"
      />
      <div className="flex flex-wrap items-center gap-3">
        <PrimaryButton
          label="Upload asset"
          ariaLabel="Upload asset"
          disabled={isSubmitting}
          type="submit"
        />
        <span className="text-xs text-mab-slate">
          Files are stored in the MAB AI Strategies vault with secure URIs.
        </span>
      </div>
      {statusMessage ? <p className="text-xs text-mab-slate">{statusMessage}</p> : null}
    </form>
  );
}
