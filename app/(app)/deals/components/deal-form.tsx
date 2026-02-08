"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const dealStages = [
  "PROSPECT_IDENTIFIED",
  "ENRICHED",
  "OUTREACH_SENT",
  "DISCOVERY_SCHEDULED",
  "DISCOVERY_COMPLETED",
  "OFFER_PRESENTED",
  "PROPOSAL_SENT",
  "CLOSED_WON",
  "CLOSED_LOST",
  "DELIVERY_IN_PROGRESS",
  "DELIVERY_COMPLETE"
];

const offerTypes = ["AUDIT", "BLUEPRINT", "LEAD_LIST", "IMPLEMENTATION", "OTHER"];

type DealFormData = {
  id?: string;
  companyId: string;
  primaryContactId: string;
  stage: string;
  value: string;
  probability: string;
  closeDate: string;
  offerType: string;
  objections: string;
  roiDrivers: string;
  nextStepDate: string;
  momentumScore: string;
};

const buttonClasses =
  "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition bg-mab-navy text-white shadow-glow hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50";

export function DealForm({ initialData }: { initialData?: DealFormData }) {
  const router = useRouter();
  const [formData, setFormData] = useState<DealFormData>({
    id: initialData?.id,
    companyId: initialData?.companyId ?? "",
    primaryContactId: initialData?.primaryContactId ?? "",
    stage: initialData?.stage ?? dealStages[0],
    value: initialData?.value ?? "",
    probability: initialData?.probability ?? "0",
    closeDate: initialData?.closeDate ?? "",
    offerType: initialData?.offerType ?? "OTHER",
    objections: initialData?.objections ?? "",
    roiDrivers: initialData?.roiDrivers ?? "",
    nextStepDate: initialData?.nextStepDate ?? "",
    momentumScore: initialData?.momentumScore ?? "0"
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof DealFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      companyId: formData.companyId,
      primaryContactId: formData.primaryContactId || null,
      stage: formData.stage,
      value: formData.value ? Number(formData.value) : null,
      probability: formData.probability ? Number(formData.probability) : 0,
      closeDate: formData.closeDate || null,
      offerType: formData.offerType,
      objections: formData.objections || null,
      roiDrivers: formData.roiDrivers || null,
      nextStepDate: formData.nextStepDate || null,
      momentumScore: formData.momentumScore ? Number(formData.momentumScore) : 0
    };

    try {
      const response = await fetch(formData.id ? `/api/deals/${formData.id}` : "/api/deals", {
        method: formData.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error ?? "Unable to save deal.");
      }

      const data = await response.json();
      const dealId = data.deal?.id ?? formData.id;
      if (dealId) {
        router.push(`/deals/${dealId}`);
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
          Company ID
          <input
            value={formData.companyId}
            onChange={(event) => handleChange("companyId", event.target.value)}
            required
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Primary contact ID
          <input
            value={formData.primaryContactId}
            onChange={(event) => handleChange("primaryContactId", event.target.value)}
            placeholder="Optional"
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Stage
          <select
            value={formData.stage}
            onChange={(event) => handleChange("stage", event.target.value)}
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          >
            {dealStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Offer type
          <select
            value={formData.offerType}
            onChange={(event) => handleChange("offerType", event.target.value)}
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          >
            {offerTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Deal value
          <input
            type="number"
            value={formData.value}
            onChange={(event) => handleChange("value", event.target.value)}
            placeholder="250000"
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Probability (%)
          <input
            type="number"
            min={0}
            max={100}
            value={formData.probability}
            onChange={(event) => handleChange("probability", event.target.value)}
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Momentum score
          <input
            type="number"
            min={0}
            max={100}
            value={formData.momentumScore}
            onChange={(event) => handleChange("momentumScore", event.target.value)}
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Close date
          <input
            type="date"
            value={formData.closeDate}
            onChange={(event) => handleChange("closeDate", event.target.value)}
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Next step date
          <input
            type="date"
            value={formData.nextStepDate}
            onChange={(event) => handleChange("nextStepDate", event.target.value)}
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Objections
          <textarea
            value={formData.objections}
            onChange={(event) => handleChange("objections", event.target.value)}
            rows={3}
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          ROI drivers
          <textarea
            value={formData.roiDrivers}
            onChange={(event) => handleChange("roiDrivers", event.target.value)}
            rows={3}
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
      </div>
      {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={buttonClasses} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : formData.id ? "Save updates" : "Create deal"}
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
