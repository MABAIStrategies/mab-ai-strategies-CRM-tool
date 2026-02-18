"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

type Contact = {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  relationshipStrength: number;
  source: string | null;
};

type Deal = {
  id: string;
  title: string | null;
  stage: string;
  value: number | null;
  offerType: string;
  momentumScore: number;
  primaryContact: { name: string } | null;
};

type Activity = {
  id: string;
  type: string;
  occurredAt: string;
  outcome: string | null;
  contact: { name: string } | null;
};

type Company = {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  region: string | null;
  icpTags: string[];
  riskFlags: string[];
  notesSummary: string | null;
  enrichedData: Record<string, unknown> | null;
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
};

export default function CompanyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    title: "",
    phone: ""
  });
  const [showContactForm, setShowContactForm] = useState(false);

  const fetchCompany = useCallback(async () => {
    const res = await fetch(`/api/companies/${id}`);
    if (res.ok) {
      const data = await res.json();
      setCompany(data.company);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const addContact = async () => {
    if (!contactForm.name.trim()) return;
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...contactForm, companyId: id })
    });
    setContactForm({ name: "", email: "", title: "", phone: "" });
    setShowContactForm(false);
    fetchCompany();
  };

  const scrapeEmails = async () => {
    if (!company?.domain) return;
    await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: company.domain, companyId: id })
    });
    fetchCompany();
  };

  const enrichCompany = async () => {
    await fetch("/api/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: id })
    });
    fetchCompany();
  };

  if (loading) {
    return <div className="py-20 text-center text-mab-slate">Loading...</div>;
  }
  if (!company) {
    return <div className="py-20 text-center text-mab-slate">Company not found.</div>;
  }

  const enriched = company.enrichedData ?? {};

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <a href="/companies" className="text-xs text-mab-gold hover:underline">
            ← Companies
          </a>
          <h1 className="text-3xl font-semibold text-mab-navy">{company.name}</h1>
          <p className="text-sm text-mab-slate">
            {[company.domain, company.industry, company.region].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={enrichCompany}
            className="rounded-xl bg-mab-gold/20 px-5 py-2 text-sm font-medium text-mab-navy transition hover:bg-mab-gold"
          >
            Enrich
          </button>
          {company.domain && (
            <button
              onClick={scrapeEmails}
              className="rounded-xl bg-mab-navy/5 px-5 py-2 text-sm font-medium text-mab-navy transition hover:bg-mab-navy hover:text-white"
            >
              Scrape Emails
            </button>
          )}
        </div>
      </header>

      {/* Tags & Enrichment */}
      <div className="flex flex-wrap gap-2">
        {company.icpTags.map((t) => (
          <span key={t} className="rounded-full bg-mab-gold/10 px-3 py-1 text-xs text-mab-navy">{t}</span>
        ))}
        {company.riskFlags.map((f) => (
          <span key={f} className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-700">{f}</span>
        ))}
      </div>
      {Object.keys(enriched).length > 0 && (
        <div className="rounded-2xl border border-mab-navy/10 bg-white p-4 text-sm text-mab-slate">
          <p className="mb-1 text-xs font-semibold uppercase text-mab-gold">Enrichment Data</p>
          {Object.entries(enriched).map(([k, v]) => (
            <p key={k}><span className="font-medium text-mab-navy">{k}:</span> {String(v)}</p>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contacts */}
        <div className="rounded-2xl border border-mab-navy/10 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-mab-navy">
              Contacts ({company.contacts.length})
            </h3>
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              className="text-xs text-mab-gold hover:underline"
            >
              + Add
            </button>
          </div>
          {showContactForm && (
            <div className="mb-3 space-y-2 rounded-xl bg-mab-ivory p-3">
              <input placeholder="Name *" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="w-full rounded-lg border border-mab-navy/10 px-3 py-1.5 text-xs focus:border-mab-gold focus:outline-none" />
              <input placeholder="Email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="w-full rounded-lg border border-mab-navy/10 px-3 py-1.5 text-xs focus:border-mab-gold focus:outline-none" />
              <input placeholder="Title" value={contactForm.title} onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })} className="w-full rounded-lg border border-mab-navy/10 px-3 py-1.5 text-xs focus:border-mab-gold focus:outline-none" />
              <button onClick={addContact} className="rounded-lg bg-mab-navy px-4 py-1.5 text-xs text-white">Create</button>
            </div>
          )}
          <div className="space-y-2">
            {company.contacts.map((c) => (
              <a key={c.id} href={`/contacts/${c.id}`} className="block rounded-xl bg-mab-ivory/50 p-2 text-xs hover:bg-mab-ivory">
                <p className="font-medium text-mab-navy">{c.name}</p>
                <p className="text-mab-slate">{[c.title, c.email].filter(Boolean).join(" · ")}</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1 flex-1 rounded bg-mab-navy/10">
                    <div className="h-1 rounded bg-mab-gold" style={{ width: `${c.relationshipStrength}%` }} />
                  </div>
                  <span className="text-mab-slate">{c.relationshipStrength}%</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Deals */}
        <div className="rounded-2xl border border-mab-navy/10 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-mab-navy">Deals ({company.deals.length})</h3>
            <a href="/deals/new" className="text-xs text-mab-gold hover:underline">+ New</a>
          </div>
          <div className="space-y-2">
            {company.deals.map((d) => (
              <a key={d.id} href={`/deals/${d.id}`} className="block rounded-xl bg-mab-ivory/50 p-2 text-xs hover:bg-mab-ivory">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-mab-navy">{d.title ?? d.offerType}</p>
                  <span className="text-mab-gold">M{d.momentumScore}</span>
                </div>
                <p className="text-mab-slate">{d.stage.replace(/_/g, " ")} · {d.value ? `$${d.value.toLocaleString()}` : "TBD"}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl border border-mab-navy/10 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-mab-navy">Recent Activity</h3>
          <div className="space-y-2">
            {company.activities.slice(0, 10).map((a) => (
              <div key={a.id} className="rounded-xl bg-mab-ivory/50 p-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-mab-navy">{a.type}</span>
                  <span className="text-mab-slate">{new Date(a.occurredAt).toLocaleDateString()}</span>
                </div>
                {a.outcome && <p className="text-mab-slate">{a.outcome}</p>}
              </div>
            ))}
            {company.activities.length === 0 && (
              <p className="py-4 text-center text-xs text-mab-slate/50">No activity yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
