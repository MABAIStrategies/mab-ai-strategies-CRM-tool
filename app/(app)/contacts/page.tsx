"use client";

import { useEffect, useState, useCallback } from "react";

type Contact = {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  relationshipStrength: number;
  source: string | null;
  company: { id: string; name: string };
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchContacts = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    const res = await fetch(`/api/contacts?${params}`);
    if (res.ok) {
      const data = await res.json();
      setContacts(data.contacts);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Contacts</p>
        <h1 className="text-3xl font-semibold text-mab-navy">People</h1>
        <p className="mt-1 text-sm text-mab-slate">{contacts.length} contacts across all accounts</p>
      </header>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm shadow-sm focus:border-mab-gold focus:outline-none"
      />

      {loading ? (
        <div className="py-20 text-center text-mab-slate">Loading...</div>
      ) : contacts.length === 0 ? (
        <div className="py-20 text-center text-mab-slate">
          No contacts yet. Add contacts from company pages or scrape emails.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mab-navy/10 text-left text-xs uppercase text-mab-slate">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Relationship</th>
                <th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-mab-navy/5 transition hover:bg-mab-ivory/50">
                  <td className="px-4 py-3">
                    <a href={`/contacts/${c.id}`} className="font-medium text-mab-navy hover:text-mab-gold">
                      {c.name}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/companies/${c.company.id}`} className="text-mab-slate hover:text-mab-gold">
                      {c.company.name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-mab-slate">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-mab-slate">{c.title ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded bg-mab-navy/10">
                        <div className="h-1.5 rounded bg-mab-gold" style={{ width: `${c.relationshipStrength}%` }} />
                      </div>
                      <span className="text-xs text-mab-slate">{c.relationshipStrength}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-mab-slate">{c.source ?? "manual"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
