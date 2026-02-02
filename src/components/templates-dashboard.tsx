"use client";

import { useEffect, useState } from "react";
import { PrimaryButton } from "./ui/primary-button";
import { Card } from "./ui/card";

export type Template = {
  id: string;
  name: string;
  description?: string | null;
  outputType: string;
};

export function TemplatesDashboard() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleGenerate = async () => {
    setStatus("loading");
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
    } catch (error) {
      setStatus("error");
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <PrimaryButton label="Refresh" onClick={loadTemplates} ariaLabel="Refresh templates" />
        <PrimaryButton
          label="Generate from template"
          variant="outline"
          onClick={handleGenerate}
          ariaLabel="Generate from template"
        />
      </div>
      {status === "loading" ? <p className="text-sm text-mab-slate">Loading templates...</p> : null}
      {errorMessage ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id} title={template.name} subtitle={template.outputType}>
            <p className="text-sm text-mab-slate">{template.description ?? "No description yet."}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
