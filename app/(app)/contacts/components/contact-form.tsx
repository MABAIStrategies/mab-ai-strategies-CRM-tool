"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ContactFormData = {
  id?: string;
  companyId: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  relationshipStrength: string;
};

const buttonClasses =
  "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition bg-mab-navy text-white shadow-glow hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50";

export function ContactForm({
  initialData,
  defaultCompanyId = ""
}: {
  initialData?: ContactFormData;
  defaultCompanyId?: string;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<ContactFormData>({
    id: initialData?.id,
    companyId: initialData?.companyId ?? defaultCompanyId,
    name: initialData?.name ?? "",
    title: initialData?.title ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    linkedinUrl: initialData?.linkedinUrl ?? "",
    relationshipStrength: initialData?.relationshipStrength ?? "50"
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      companyId: formData.companyId,
      name: formData.name,
      title: formData.title || null,
      email: formData.email || null,
      phone: formData.phone || null,
      linkedinUrl: formData.linkedinUrl || null,
      relationshipStrength: formData.relationshipStrength
        ? Number(formData.relationshipStrength)
        : 50
    };

    try {
      const response = await fetch(
        formData.id ? `/api/contacts/${formData.id}` : "/api/contacts",
        {
          method: formData.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error ?? "Unable to save contact.");
      }

      const data = await response.json();
      const contactId = data.contact?.id ?? formData.id;
      if (contactId) {
        router.push(`/contacts/${contactId}`);
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
          Contact name
          <input
            value={formData.name}
            onChange={(event) => handleChange("name", event.target.value)}
            required
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Title
          <input
            value={formData.title}
            onChange={(event) => handleChange("title", event.target.value)}
            placeholder="VP of Operations"
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Relationship strength (0-100)
          <input
            type="number"
            min={0}
            max={100}
            value={formData.relationshipStrength}
            onChange={(event) => handleChange("relationshipStrength", event.target.value)}
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Email
          <input
            type="email"
            value={formData.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="name@company.com"
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Phone
          <input
            value={formData.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            placeholder="+1 (555) 010-2044"
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate lg:col-span-2">
          LinkedIn URL
          <input
            value={formData.linkedinUrl}
            onChange={(event) => handleChange("linkedinUrl", event.target.value)}
            placeholder="https://linkedin.com/in/"
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
      </div>
      {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={buttonClasses} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : formData.id ? "Save updates" : "Create contact"}
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
