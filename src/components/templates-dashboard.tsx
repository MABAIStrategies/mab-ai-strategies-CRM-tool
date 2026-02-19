"use client";

import { useEffect, useState } from "react";
import { PrimaryButton } from "./ui/primary-button";
import { Card } from "./ui/card";

export type Template = {
  id: string;
  name: string;
  description?: string | null;
  outputType: string;
  variablesSchema: Record<string, unknown>;
  prompt: string;
  createdAt: string;
};

export function TemplatesDashboard() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [status, setStatus] = useState("idle");
  const [generateStatus, setGenerateStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const loadTemplates = async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/templates", {
        headers: { "x-csrf-token": "local-dev" }
      });
      if (!response.ok) {
        throw new Error("Unable to load templates.");
      }
      const data = await response.json();
      setTemplates(data.templates ?? []);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setErrorMessage((error as Error).message);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleGenerateAsset = async (templateId: string) => {
    setActionStatus("Starting template generation...");
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": "local-dev" },
        body: JSON.stringify({
          type: "TEMPLATE_GENERATE",
          payload: { templateId },
          idempotencyKey: `template-generate-${templateId}-${crypto.randomUUID()}`
        })
      });
      if (!response.ok) {
        throw new Error("Unable to start generation.");
      }
      setActionStatus("Generation queued.");
    } catch (error) {
      setActionStatus((error as Error).message);
    }
  };

  const handleGenerate = async () => {
    setGenerateStatus("loading");
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": "local-dev" },
        body: JSON.stringify({
          name: "Follow-up Template",
          outputType: "PROPOSAL",
          prompt: "Generate a proposal outline",
          variablesSchema: { sections: ["Context", "ROI"] }
        })
      });
      if (!response.ok) {
        throw new Error("Unable to create template.");
      }
      await loadTemplates();
      setGenerateStatus("success");
    } catch (error) {
      setGenerateStatus("error");
      setErrorMessage((error as Error).message);
    } finally {
      setTimeout(() => {
        setGenerateStatus("idle");
      }, 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <PrimaryButton label="Refresh" onClick={loadTemplates} ariaLabel="Refresh templates" />
        <PrimaryButton
          label={generateStatus === "loading" ? "Generating..." : "Generate from template"}
          variant="outline"
          onClick={handleGenerate}
          ariaLabel="Generate from template"
        />
        {generateStatus !== "idle" ? (
          <span className="flex items-center gap-2 rounded-full border border-mab-gold/40 px-3 py-1 text-xs text-mab-navy">
            <span
              className={`h-2 w-2 rounded-full ${
                generateStatus === "loading"
                  ? "animate-pulse-glow bg-mab-gold"
                  : generateStatus === "success"
                    ? "bg-mab-navy"
                    : "bg-red-500"
              }`}
            />
            {generateStatus === "loading" ? "Rendering asset output" : "Template synced"}
          </span>
        ) : null}
      </div>
      {status === "loading" ? <p className="text-sm text-mab-slate">Loading templates...</p> : null}
      {errorMessage ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {actionStatus ? <p className="text-xs text-mab-slate">{actionStatus}</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id} title={template.name} subtitle={template.outputType}>
            <p className="text-sm text-mab-slate">{template.description ?? "No description yet."}</p>
            <div className="mt-4 grid gap-3 text-xs text-mab-slate">
              <div className="rounded-xl border border-mab-navy/10 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow">
                <p className="text-[0.7rem] uppercase tracking-[0.3em] text-mab-gold">Variables</p>
                <p className="mt-1 text-sm font-medium text-mab-navy">
                  {Object.keys(template.variablesSchema ?? {}).length} fields
                </p>
              </div>
              <div className="rounded-xl border border-mab-navy/10 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow">
                <p className="text-[0.7rem] uppercase tracking-[0.3em] text-mab-gold">Created</p>
                <p className="mt-1 text-sm font-medium text-mab-navy">
                  {new Date(template.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <PrimaryButton
                label="Review template"
                onClick={() => setSelectedTemplate(template)}
                ariaLabel={`Review template ${template.name}`}
              />
              <PrimaryButton
                label="Queue generation"
                variant="outline"
                onClick={() => handleGenerateAsset(template.id)}
                ariaLabel={`Queue generation for ${template.name}`}
              />
            </div>
          </Card>
        ))}
      </div>
      {selectedTemplate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mab-navy/60 p-6">
          <div className="w-full max-w-2xl rounded-3xl bg-mab-ivory p-6 shadow-xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-mab-gold">Template Review</p>
                <h2 className="mt-2 text-2xl font-semibold text-mab-navy">{selectedTemplate.name}</h2>
                <p className="mt-1 text-sm text-mab-slate">
                  {selectedTemplate.description ?? "No description yet."}
                </p>
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
            <div className="mt-6 space-y-4 text-sm text-mab-slate">
              <div className="rounded-2xl border border-mab-navy/10 bg-white/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">Output Type</p>
                <p className="mt-1 text-sm font-semibold text-mab-navy">{selectedTemplate.outputType}</p>
              </div>
              <div className="rounded-2xl border border-mab-navy/10 bg-white/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">Prompt</p>
                <p className="mt-1 text-sm text-mab-slate">{selectedTemplate.prompt}</p>
              </div>
              <div className="rounded-2xl border border-mab-navy/10 bg-white/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">Variables Schema</p>
                <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-mab-navy/5 p-3 text-xs text-mab-ink">
                  {JSON.stringify(selectedTemplate.variablesSchema ?? {}, null, 2)}
                </pre>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <PrimaryButton label="Close" variant="outline" onClick={() => setSelectedTemplate(null)} />
              <PrimaryButton
                label="Generate draft asset"
                onClick={() => {
                  handleGenerateAsset(selectedTemplate.id);
                  setSelectedTemplate(null);
                }}
                ariaLabel="Generate draft asset"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
