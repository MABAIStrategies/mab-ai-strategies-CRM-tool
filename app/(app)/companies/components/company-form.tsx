"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CompanyFormData = {
  id?: string;
  name: string;
  domain: string;
  industry: string;
  region: string;
  icpTags: string;
  riskFlags: string;
  notesSummary: string;
};

const buttonClasses =
  "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition bg-mab-navy text-white shadow-glow hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50";

export function CompanyForm({ initialData }: { initialData?: CompanyFormData }) {
  const router = useRouter();
  const [formData, setFormData] = useState<CompanyFormData>({
    id: initialData?.id,
    name: initialData?.name ?? "",
    domain: initialData?.domain ?? "",
    industry: initialData?.industry ?? "",
    region: initialData?.region ?? "",
    icpTags: initialData?.icpTags ?? "",
    riskFlags: initialData?.riskFlags ?? "",
    notesSummary: initialData?.notesSummary ?? ""
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      domain: formData.domain || null,
      industry: formData.industry || null,
      region: formData.region || null,
      icpTags: formData.icpTags
        ? formData.icpTags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [],
      riskFlags: formData.riskFlags
        ? formData.riskFlags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [],
      notesSummary: formData.notesSummary || null
    };

    try {
      const response = await fetch(
        formData.id ? `/api/companies/${formData.id}` : "/api/companies",
        {
          method: formData.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error ?? "Unable to save company.");
      }

      const data = await response.json();
      const companyId = data.company?.id ?? formData.id;
      if (companyId) {
        router.push(`/companies/${companyId}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Company name
          <input
            value={formData.name}
            onChange={(event) => handleChange("name", event.target.value)}
            required
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Primary domain
          <input
            value={formData.domain}
            onChange={(event) => handleChange("domain", event.target.value)}
            placeholder="example.com"
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Industry
          <input
            value={formData.industry}
            onChange={(event) => handleChange("industry", event.target.value)}
            placeholder="FinTech, Logistics, Health"
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Region
          <input
            value={formData.region}
            onChange={(event) => handleChange("region", event.target.value)}
            placeholder="North America"
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          ICP tags (comma-separated)
          <input
            value={formData.icpTags}
            onChange={(event) => handleChange("icpTags", event.target.value)}
            placeholder="Series B, Operations, AI-ready"
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Risk flags (comma-separated)
          <input
            value={formData.riskFlags}
            onChange={(event) => handleChange("riskFlags", event.target.value)}
            placeholder="Budget risk, Legal review"
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm text-mab-slate">
        Notes summary
        <textarea
          value={formData.notesSummary}
          onChange={(event) => handleChange("notesSummary", event.target.value)}
          rows={4}
          className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
        />
      </label>
      {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={buttonClasses} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : formData.id ? "Save updates" : "Create company"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-full border border-mab-navy/20 px-5 py-2 text-sm font-medium text-mab-navy transition hover:-translate-y-0.5 hover:bg-mab-navy hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
