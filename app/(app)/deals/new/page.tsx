"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Company = { id: string; name: string };
type Contact = { id: string; name: string };

const OFFER_TYPES = ["AUDIT", "BLUEPRINT", "LEAD_LIST", "IMPLEMENTATION", "OTHER"];

export default function NewDealPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState({
    companyId: "",
    primaryContactId: "",
    title: "",
    offerType: "AUDIT",
    value: "",
    probability: "50",
    closeDate: ""
  });

  useEffect(() => {
    fetch("/api/companies?limit=50")
      .then((r) => r.json())
      .then((d) => setCompanies(d.companies ?? []));
  }, []);

  useEffect(() => {
    if (form.companyId) {
      fetch(`/api/contacts?companyId=${form.companyId}`)
        .then((r) => r.json())
        .then((d) => setContacts(d.contacts ?? []));
    }
  }, [form.companyId]);

  const create = async () => {
    if (!form.companyId) return;
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: form.companyId,
        primaryContactId: form.primaryContactId || null,
        title: form.title || null,
        offerType: form.offerType,
        value: form.value ? Number(form.value) : null,
        probability: Number(form.probability),
        closeDate: form.closeDate || null
      })
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/deals/${data.deal.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <a href="/pipeline" className="text-xs text-mab-gold hover:underline">← Pipeline</a>
        <h1 className="text-3xl font-semibold text-mab-navy">New Deal</h1>
      </header>

      <div className="space-y-4 rounded-2xl border border-mab-navy/10 bg-white p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-mab-navy">Company *</label>
          <select
            value={form.companyId}
            onChange={(e) => setForm({ ...form, companyId: e.target.value, primaryContactId: "" })}
            className="w-full rounded-xl border border-mab-navy/10 px-4 py-2 text-sm focus:border-mab-gold focus:outline-none"
          >
            <option value="">Select company...</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {contacts.length > 0 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-mab-navy">Primary Contact</label>
            <select
              value={form.primaryContactId}
              onChange={(e) => setForm({ ...form, primaryContactId: e.target.value })}
              className="w-full rounded-xl border border-mab-navy/10 px-4 py-2 text-sm focus:border-mab-gold focus:outline-none"
            >
              <option value="">Select contact...</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-mab-navy">Deal Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Compliance Automation Implementation"
            className="w-full rounded-xl border border-mab-navy/10 px-4 py-2 text-sm focus:border-mab-gold focus:outline-none"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-mab-navy">Offer Type</label>
            <select
              value={form.offerType}
              onChange={(e) => setForm({ ...form, offerType: e.target.value })}
              className="w-full rounded-xl border border-mab-navy/10 px-4 py-2 text-sm focus:border-mab-gold focus:outline-none"
            >
              {OFFER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-mab-navy">Value ($)</label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="25000"
              className="w-full rounded-xl border border-mab-navy/10 px-4 py-2 text-sm focus:border-mab-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-mab-navy">Probability (%)</label>
            <input
              type="number"
              value={form.probability}
              onChange={(e) => setForm({ ...form, probability: e.target.value })}
              className="w-full rounded-xl border border-mab-navy/10 px-4 py-2 text-sm focus:border-mab-gold focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-mab-navy">Expected Close Date</label>
          <input
            type="date"
            value={form.closeDate}
            onChange={(e) => setForm({ ...form, closeDate: e.target.value })}
            className="w-full rounded-xl border border-mab-navy/10 px-4 py-2 text-sm focus:border-mab-gold focus:outline-none"
          />
        </div>

        <button
          onClick={create}
          className="w-full rounded-xl bg-mab-navy px-6 py-3 text-sm font-medium text-white transition hover:bg-mab-gold hover:text-mab-navy"
        >
          Create Deal
        </button>
      </div>
    </div>
  );
}
