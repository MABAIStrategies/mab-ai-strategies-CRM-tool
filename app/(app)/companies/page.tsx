"use client";

import { useEffect, useState, useCallback } from "react";

type Company = {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  region: string | null;
  icpTags: string[];
  _count: { contacts: number; deals: number; activities: number };
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", domain: "", industry: "", region: "" });
  const [scrapeTarget, setScrapeTarget] = useState("");
  const [scrapeResult, setScrapeResult] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    const res = await fetch(`/api/companies?${params}`);
    if (res.ok) {
      const data = await res.json();
      setCompanies(data.companies);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const createCompany = async () => {
    if (!form.name.trim()) return;
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setForm({ name: "", domain: "", industry: "", region: "" });
      setShowForm(false);
      fetchCompanies();
    }
  };

  const enrichCompany = async (id: string) => {
    await fetch("/api/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: id })
    });
    fetchCompanies();
  };

  const scrapeEmails = async () => {
    if (!scrapeTarget.trim()) return;
    setScrapeResult("Scraping...");
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: scrapeTarget })
    });
    if (res.ok) {
      const data = await res.json();
      setScrapeResult(
        `Found ${data.emailsFound.length} emails. Created ${data.contactsCreated} contacts.`
      );
      fetchCompanies();
    } else {
      setScrapeResult("Scrape failed.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Companies</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Accounts</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-mab-navy px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-mab-gold hover:text-mab-navy"
          >
            + Add Company
          </button>
        </div>
      </header>

      {/* Search + Scrape */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm shadow-sm focus:border-mab-gold focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="domain.com"
            value={scrapeTarget}
            onChange={(e) => setScrapeTarget(e.target.value)}
            className="w-48 rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm shadow-sm focus:border-mab-gold focus:outline-none"
          />
          <button
            onClick={scrapeEmails}
            className="whitespace-nowrap rounded-xl bg-mab-gold/20 px-4 py-3 text-sm font-medium text-mab-navy transition hover:bg-mab-gold"
          >
            Scrape Emails
          </button>
        </div>
      </div>
      {scrapeResult && (
        <p className="text-sm text-mab-slate">{scrapeResult}</p>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="rounded-2xl border border-mab-gold/30 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-mab-navy">New Company</h3>
          <div className="grid gap-3 lg:grid-cols-4">
            <input
              placeholder="Company Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-mab-navy/10 px-4 py-2 text-sm focus:border-mab-gold focus:outline-none"
            />
            <input
              placeholder="Domain (e.g. acme.com)"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              className="rounded-xl border border-mab-navy/10 px-4 py-2 text-sm focus:border-mab-gold focus:outline-none"
            />
            <input
              placeholder="Industry"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="rounded-xl border border-mab-navy/10 px-4 py-2 text-sm focus:border-mab-gold focus:outline-none"
            />
            <input
              placeholder="Region"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              className="rounded-xl border border-mab-navy/10 px-4 py-2 text-sm focus:border-mab-gold focus:outline-none"
            />
          </div>
          <button
            onClick={createCompany}
            className="mt-4 rounded-xl bg-mab-navy px-6 py-2 text-sm font-medium text-white transition hover:bg-mab-gold hover:text-mab-navy"
          >
            Create
          </button>
        </div>
      )}

      {/* Companies List */}
      {loading ? (
        <div className="py-20 text-center text-mab-slate">Loading...</div>
      ) : companies.length === 0 ? (
        <div className="py-20 text-center text-mab-slate">
          No companies yet. Add your first company to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {companies.map((c) => (
            <a
              key={c.id}
              href={`/companies/${c.id}`}
              className="flex items-center justify-between rounded-2xl border border-mab-navy/10 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex-1">
                <p className="font-medium text-mab-navy">{c.name}</p>
                <p className="text-xs text-mab-slate">
                  {[c.domain, c.industry, c.region].filter(Boolean).join(" · ")}
                </p>
                {c.icpTags.length > 0 && (
                  <div className="mt-1 flex gap-1">
                    {c.icpTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-mab-gold/10 px-2 py-0.5 text-xs text-mab-navy"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-4 text-xs text-mab-slate">
                <span>{c._count.contacts} contacts</span>
                <span>{c._count.deals} deals</span>
                <span>{c._count.activities} activities</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    enrichCompany(c.id);
                  }}
                  className="rounded-lg bg-mab-navy/5 px-3 py-1 text-mab-navy transition hover:bg-mab-gold"
                >
                  Enrich
                </button>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
