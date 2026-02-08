"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const taskStatuses = ["TODO", "DOING", "DONE"];

type TaskFormData = {
  id?: string;
  title: string;
  description: string;
  status: string;
  dueAt: string;
  companyId: string;
  dealId: string;
  contactId: string;
};

const buttonClasses =
  "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition bg-mab-navy text-white shadow-glow hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50";

export function TaskForm({ initialData }: { initialData?: TaskFormData }) {
  const router = useRouter();
  const [formData, setFormData] = useState<TaskFormData>({
    id: initialData?.id,
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    status: initialData?.status ?? "TODO",
    dueAt: initialData?.dueAt ?? "",
    companyId: initialData?.companyId ?? "",
    dealId: initialData?.dealId ?? "",
    contactId: initialData?.contactId ?? ""
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof TaskFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      dueAt: formData.dueAt || null,
      companyId: formData.companyId || null,
      dealId: formData.dealId || null,
      contactId: formData.contactId || null
    };

    try {
      const response = await fetch(formData.id ? `/api/tasks/${formData.id}` : "/api/tasks", {
        method: formData.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error ?? "Unable to save task.");
      }

      const data = await response.json();
      const taskId = data.task?.id ?? formData.id;
      if (taskId) {
        router.push(`/tasks/${taskId}`);
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
          Task title
          <input
            value={formData.title}
            onChange={(event) => handleChange("title", event.target.value)}
            required
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Status
          <select
            value={formData.status}
            onChange={(event) => handleChange("status", event.target.value)}
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          >
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm text-mab-slate">
        Description
        <textarea
          value={formData.description}
          onChange={(event) => handleChange("description", event.target.value)}
          rows={3}
          className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
        />
      </label>
      <div className="grid gap-6 lg:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Due date
          <input
            type="date"
            value={formData.dueAt}
            onChange={(event) => handleChange("dueAt", event.target.value)}
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Company ID
          <input
            value={formData.companyId}
            onChange={(event) => handleChange("companyId", event.target.value)}
            placeholder="Optional"
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Deal ID
          <input
            value={formData.dealId}
            onChange={(event) => handleChange("dealId", event.target.value)}
            placeholder="Optional"
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-mab-slate">
          Contact ID
          <input
            value={formData.contactId}
            onChange={(event) => handleChange("contactId", event.target.value)}
            placeholder="Optional"
            className="rounded-2xl border border-mab-gold/30 bg-white px-4 py-3 text-mab-ink shadow-sm transition focus:border-mab-gold focus:outline-none focus:ring-2 focus:ring-mab-gold/30"
          />
        </label>
      </div>
      {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={buttonClasses} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : formData.id ? "Save updates" : "Create task"}
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
