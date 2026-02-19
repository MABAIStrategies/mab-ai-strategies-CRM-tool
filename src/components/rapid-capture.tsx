"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [deals, setDeals] = useState<DealOption[]>([]);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedDealId, setSelectedDealId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteSummary, setNoteSummary] = useState<string | null>(null);
  const [structuredExtract, setStructuredExtract] = useState<StructuredExtract | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const filteredDeals = useMemo(
    () => deals.filter((deal) => deal.companyId === selectedCompanyId),
    [deals, selectedCompanyId]
  );

  const filteredContacts = useMemo(
    () => contacts.filter((contact) => contact.companyId === selectedCompanyId),
    [contacts, selectedCompanyId]
  );

  const isSelectionReady = Boolean(selectedCompanyId && selectedDealId && selectedContactId);

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
  }, [rawText, open, isSelectionReady]);

  useEffect(() => {
    if (!open || companies.length || isLoadingOptions) {
      return;
    }
    setIsLoadingOptions(true);
    fetch("/api/rapid-capture/options")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load selection data.");
        }
        return response.json();
      })
      .then((data) => {
        setCompanies(data.companies ?? []);
        setDeals(data.deals ?? []);
        setContacts(data.contacts ?? []);
      })
      .catch((error) => {
        setErrorMessage(error.message ?? "Failed to load options.");
      })
      .finally(() => setIsLoadingOptions(false));
  }, [open, companies.length, isLoadingOptions]);

  useEffect(() => {
    if (!companies.length) {
      return;
    }
    if (!selectedCompanyId) {
      setSelectedCompanyId(companies[0]?.id ?? "");
    }
  }, [companies, selectedCompanyId]);

  useEffect(() => {
    if (!selectedCompanyId) {
      return;
    }
    const nextDealId =
      filteredDeals.find((deal) => deal.id === selectedDealId)?.id ?? filteredDeals[0]?.id ?? "";
    const nextContactId =
      filteredContacts.find((contact) => contact.id === selectedContactId)?.id ??
      filteredContacts[0]?.id ??
      "";
    setSelectedDealId(nextDealId);
    setSelectedContactId(nextContactId);
  }, [selectedCompanyId, filteredDeals, filteredContacts, selectedDealId, selectedContactId]);

  const fetchTasks = useCallback(() => {
    if (!open || !isSelectionReady) {
      return;
    }
    const params = new URLSearchParams({
      companyId: selectedCompanyId,
      dealId: selectedDealId,
      contactId: selectedContactId,
      limit: "5"
    });
    fetch(`/api/tasks?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load tasks.");
        }
        return response.json();
      })
      .then((data) => {
        setTasks(data.tasks ?? []);
      })
      .catch(() => {
        setTasks([]);
      });
  }, [open, isSelectionReady, selectedCompanyId, selectedDealId, selectedContactId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (noteSummary || structuredExtract) {
      fetchTasks();
    }
  }, [noteSummary, structuredExtract, fetchTasks]);

  useEffect(() => {
    if (!noteId) {
      setIsProcessing(false);
      return;
    }
    let isActive = true;
    setIsProcessing(true);
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/notes/${noteId}`);
        if (!response.ok) {
          throw new Error("Unable to check note status.");
        }
        const data = await response.json();
        const note = data.note;
        if (!isActive) {
          return;
        }
        if (note?.summary && note?.structuredExtract) {
          setNoteSummary(note.summary);
          setStructuredExtract(note.structuredExtract);
          setIsProcessing(false);
          clearInterval(interval);
        }
      } catch (error) {
        setIsProcessing(false);
        clearInterval(interval);
      }
    }, 2000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [noteId]);

  const handleAutosave = () => {
    if (isCooldown) {
      return;
    }
    if (!isSelectionReady) {
      setErrorMessage("Select a company, deal, and contact before saving.");
      setStatus("error");
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
        companyId: companyId ?? "demo-company",
        dealId,
        rawText,
        tags: ["rapid-capture"]
      })
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to save note.");
        }
        const data = await response.json();
        setStatus("saved");
        setIsSubmitted(true);
        setNoteId(data.note?.id ?? null);
        setNoteSummary(null);
        setStructuredExtract(null);
      })
      .catch((error) => {
        setStatus("error");
        setErrorMessage(error.message ?? "Failed to save.");
      })
      .finally(() => {
        setTimeout(() => setIsCooldown(false), 1000);
      });
  };

  const remainingCharacters = 800 - rawText.length;
  const isOverLimit = remainingCharacters < 0;
  const isSaveDisabled = isOverLimit || !rawText.trim() || !isSelectionReady;

  return (
    <section className="rounded-2xl border border-mab-gold/30 bg-white/70 p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <img
              src="/branding/mab-logo.svg"
              alt="MAB AI Strategies logo"
              className="h-12 w-12 rounded-full border border-mab-gold/40 bg-white p-1 shadow-glow"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-mab-gold">Rapid Capture</p>
              <h2 className="text-xl font-semibold text-mab-navy">
                Log a discovery call in under 15 seconds
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-mab-navy/10 bg-white/80 px-3 py-2 shadow-sm">
            <img
              src="/branding/mab-headshot.svg"
              alt="MAB AI Strategies strategist headshot"
              className="h-10 w-10 rounded-full border border-mab-gold/40"
            />
            <div>
              <p className="text-xs font-semibold text-mab-navy">MAB AI Strategies</p>
              <p className="text-[11px] text-mab-slate">Hyper-interactive capture console</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton
            label={open ? "Hide drawer" : "Open drawer"}
            onClick={() => setOpen((prev) => !prev)}
            ariaLabel="Toggle rapid capture drawer"
          />
          <PrimaryButton
            label="View pipeline"
            variant="outline"
            href="/workspace"
            ariaLabel="View pipeline workspace"
          />
        </div>
      </div>
      <p className="mt-3 text-sm text-mab-slate">
        Type once. We extract objections, ROI hooks, and next steps asynchronously.
      </p>
      {open ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-mab-navy/10 bg-white p-4">
            <div className="grid gap-3 rounded-2xl border border-mab-gold/20 bg-mab-ivory/70 p-4">
              <div className="flex items-center justify-between text-xs text-mab-slate">
                <p className="font-semibold uppercase tracking-[0.3em] text-mab-navy">
                  Context selectors
                </p>
                <span className="rounded-full bg-mab-navy/10 px-2 py-1 text-[10px] text-mab-navy">
                  {isLoadingOptions ? "Syncing..." : isSelectionReady ? "Locked in" : "Required"}
                </span>
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                <label className="space-y-1 text-xs font-medium text-mab-navy">
                  Company
                  <select
                    className="w-full rounded-xl border border-mab-navy/10 bg-white px-3 py-2 text-sm text-mab-navy shadow-sm transition focus:border-mab-gold/70 focus:outline-none"
                    value={selectedCompanyId}
                    onChange={(event) => setSelectedCompanyId(event.target.value)}
                  >
                    {companies.length ? null : (
                      <option value="">No companies available</option>
                    )}
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}{company.domain ? ` · ${company.domain}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-xs font-medium text-mab-navy">
                  Deal
                  <select
                    className="w-full rounded-xl border border-mab-navy/10 bg-white px-3 py-2 text-sm text-mab-navy shadow-sm transition focus:border-mab-gold/70 focus:outline-none"
                    value={selectedDealId}
                    onChange={(event) => setSelectedDealId(event.target.value)}
                    disabled={!filteredDeals.length}
                  >
                    {filteredDeals.length ? null : (
                      <option value="">No deals for this company</option>
                    )}
                    {filteredDeals.map((deal) => (
                      <option key={deal.id} value={deal.id}>
                        {deal.stage.replaceAll("_", " ")}{deal.value ? ` · $${deal.value}k` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-xs font-medium text-mab-navy">
                  Contact
                  <select
                    className="w-full rounded-xl border border-mab-navy/10 bg-white px-3 py-2 text-sm text-mab-navy shadow-sm transition focus:border-mab-gold/70 focus:outline-none"
                    value={selectedContactId}
                    onChange={(event) => setSelectedContactId(event.target.value)}
                    disabled={!filteredContacts.length}
                  >
                    {filteredContacts.length ? null : (
                      <option value="">No contacts for this company</option>
                    )}
                    {filteredContacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name}{contact.title ? ` · ${contact.title}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-mab-slate">
                <span className="rounded-full border border-mab-gold/40 px-3 py-1">
                  Hyper-interactive AI capture
                </span>
                <span className="rounded-full border border-mab-navy/20 px-3 py-1">
                  Auto-syncs with memory graph
                </span>
                <span className="rounded-full border border-mab-navy/20 px-3 py-1">
                  Off-white + gold branding
                </span>
              </div>
            </div>
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
                href="/assets"
                ariaLabel="Attach assets"
              />
              <PrimaryButton
                label="Open timeline"
                variant="outline"
                href="/workspace"
                ariaLabel="Open timeline workspace"
              />
            </div>
          </div>
          <div className="space-y-3 text-sm text-mab-slate">
            <div className="rounded-xl border border-mab-gold/30 bg-mab-navy px-4 py-3 text-white shadow-glow transition hover:-translate-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">AI processing</p>
              <p className="mt-1">
                {isProcessing
                  ? "Worker is synthesizing summary, extraction, and task suggestions."
                  : "Summary, extraction, tasks, and draft email are running in the background."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/80">
                <span className="rounded-full border border-white/20 px-2 py-1">Autosave enabled</span>
                <span className="rounded-full border border-white/20 px-2 py-1">Live feedback</span>
                <span className="rounded-full border border-white/20 px-2 py-1">Async extraction</span>
              </div>
            </div>
            <div className="rounded-xl border border-mab-navy/10 bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-mab-navy">Suggested tasks</p>
                <PrimaryButton
                  label="See all"
                  variant="outline"
                  href="/today"
                  ariaLabel="See all tasks"
                />
              </div>
              <div className="mt-2 space-y-2 text-xs text-mab-slate">
                {tasks.length ? (
                  tasks.map((task) => (
                    <div key={task.id} className="rounded-lg border border-mab-gold/20 bg-mab-ivory/70 px-3 py-2">
                      <p className="text-sm font-semibold text-mab-navy">{task.title}</p>
                      {task.description ? (
                        <p className="mt-1 text-xs text-mab-slate">{task.description}</p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-mab-slate">
                    {isSubmitted ? "Waiting for worker-generated tasks." : "Add notes to unlock AI-generated tasks."}
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-mab-navy/10 bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-mab-navy">AI summary + extract</p>
                <PrimaryButton
                  label="Open memory"
                  variant="outline"
                  href="/search"
                  ariaLabel="Open memory search"
                />
              </div>
              {noteSummary ? (
                <div className="mt-2 space-y-2 text-xs text-mab-slate">
                  <p className="text-sm font-semibold text-mab-navy">Summary</p>
                  <p>{noteSummary}</p>
                  {structuredExtract ? (
                    <div className="mt-2 grid gap-2">
                      {structuredExtract.painPoints?.length ? (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mab-gold">
                            Pain points
                          </p>
                          <p className="text-xs text-mab-slate">
                            {structuredExtract.painPoints.join(" · ")}
                          </p>
                        </div>
                      ) : null}
                      {structuredExtract.roiHooks?.length ? (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mab-gold">
                            ROI hooks
                          </p>
                          <p className="text-xs text-mab-slate">
                            {structuredExtract.roiHooks.join(" · ")}
                          </p>
                        </div>
                      ) : null}
                      {structuredExtract.nextSteps?.length ? (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mab-gold">
                            Next steps
                          </p>
                          <p className="text-xs text-mab-slate">
                            {structuredExtract.nextSteps.join(" · ")}
                          </p>
                        </div>
                      ) : null}
                      {structuredExtract.recommendation?.recommendedNextStep ? (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mab-gold">
                            Recommended
                          </p>
                          <p className="text-xs text-mab-slate">
                            {structuredExtract.recommendation.recommendedNextStep}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-xs text-mab-slate">
                  {isProcessing ? "Processing note insights..." : "Submit notes to generate a summary."}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
