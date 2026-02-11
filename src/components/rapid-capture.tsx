"use client";

import { useEffect, useState } from "react";
import { PrimaryButton } from "./ui/primary-button";
import { Textarea } from "./ui/textarea";

type CaptureStatus = "idle" | "saving" | "saved" | "error";

export function RapidCapture({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [rawText, setRawText] = useState("");
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  useEffect(() => {
    if (!rawText || !open) {
      return;
    }
    const timeout = setTimeout(async () => {
      await handleAutosave();
    }, 1200);

    return () => clearTimeout(timeout);
  }, [rawText, open]);

  const handleAutosave = () => {
    if (isCooldown) {
      return;
    }
    if (!rawText.trim()) {
      setErrorMessage("Notes are required before saving.");
      setStatus("error");
      return;
    }
    if (rawText.length > 800) {
      setErrorMessage("Notes exceed 800 characters.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    setErrorMessage(null);
    setIsCooldown(true);

    fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": "local-dev" },
      body: JSON.stringify({
        companyId: "demo-company",
        rawText,
        tags: ["rapid-capture"]
      })
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to save note.");
        }
        setStatus("saved");
        setIsSubmitted(true);
      })
      .catch((error) => {
        setStatus("error");
        setErrorMessage(error.message ?? "Failed to save.");
      })
      .finally(() => {
        setTimeout(() => setIsCooldown(false), 1000);
      });
  };

  const handleAttach = () => {
    console.log("Opening asset attach flow...");
  };

  const remainingCharacters = 800 - rawText.length;
  const isOverLimit = remainingCharacters < 0;
  const isSaveDisabled = isOverLimit || !rawText.trim();

  return (
    <section className="rounded-2xl border border-mab-gold/30 bg-white/70 p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-mab-gold">Rapid Capture</p>
          <h2 className="text-xl font-semibold text-mab-navy">
            Log a discovery call in under 15 seconds
          </h2>
          <p className="mt-2 text-sm text-mab-slate">
            Type once. We extract objections, ROI hooks, and next steps asynchronously.
          </p>
        </div>
        <PrimaryButton
          label={open ? "Hide drawer" : "Open drawer"}
          onClick={() => setOpen((prev) => !prev)}
          ariaLabel="Toggle rapid capture drawer"
        />
      </div>
      {open ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-mab-navy/10 bg-white p-4">
            <Textarea
              placeholder="Paste raw notes, outcomes, and next steps..."
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-mab-slate">
              <span>{isOverLimit ? "Too long" : "Character budget"} · {remainingCharacters}</span>
              <span>{status === "saving" ? "Saving..." : status === "saved" ? "Saved" : "Draft"}</span>
            </div>
            {errorMessage ? (
              <p className="mt-2 text-xs text-red-600" role="alert">
                {errorMessage}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-3">
              <PrimaryButton
                label={status === "saving" ? "Saving..." : "Autosave"}
                onClick={handleAutosave}
                ariaLabel="Autosave note"
                disabled={isSaveDisabled}
              />
              <PrimaryButton
                label="Attach assets"
                variant="outline"
                onClick={handleAttach}
                ariaLabel="Attach assets"
              />
            </div>
          </div>
          <div className="space-y-3 text-sm text-mab-slate">
            <div className="rounded-xl border border-mab-gold/30 bg-mab-navy px-4 py-3 text-white shadow-glow">
              <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">AI processing</p>
              <p className="mt-1">Summary, extraction, tasks, and draft email are running in the background.</p>
            </div>
            <div className="rounded-xl border border-mab-navy/10 bg-white px-4 py-3">
              <p className="font-medium text-mab-navy">Suggested tasks</p>
              <p className="mt-1 text-xs text-mab-slate">
                {isSubmitted
                  ? "Follow-up draft ready · Schedule technical workshop · Attach ROI calculator"
                  : "Update momentum score · Send follow-up · Attach ROI calculator"}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
