"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

type ContactDetail = {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  relationshipStrength: number;
  source: string | null;
  company: { id: string; name: string; domain: string | null };
  deals: { id: string; title: string | null; stage: string; offerType: string }[];
  activities: { id: string; type: string; occurredAt: string; outcome: string | null }[];
  outreachLogs: { id: string; subject: string; status: string; sentAt: string | null; createdAt: string }[];
};

export default function ContactDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContact = useCallback(async () => {
    const res = await fetch(`/api/contacts/${id}`);
    if (res.ok) {
      const data = await res.json();
      setContact(data.contact);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  const sendOutreach = async () => {
    if (!contact) return;
    await fetch("/api/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: contact.id, sequenceStep: 1 })
    });
    fetchContact();
  };

  if (loading) return <div className="py-20 text-center text-mab-slate">Loading...</div>;
  if (!contact) return <div className="py-20 text-center text-mab-slate">Contact not found.</div>;

  return (
    <div className="space-y-6">
      <header>
        <a href="/contacts" className="text-xs text-mab-gold hover:underline">← Contacts</a>
        <h1 className="text-3xl font-semibold text-mab-navy">{contact.name}</h1>
        <p className="text-sm text-mab-slate">
          {[contact.title, contact.email, contact.phone].filter(Boolean).join(" · ")}
        </p>
        <p className="text-sm text-mab-slate">
          Company: <a href={`/companies/${contact.company.id}`} className="text-mab-gold hover:underline">{contact.company.name}</a>
        </p>
      </header>

      <div className="flex gap-3">
        <button
          onClick={sendOutreach}
          className="rounded-xl bg-mab-navy px-5 py-2 text-sm font-medium text-white transition hover:bg-mab-gold hover:text-mab-navy"
        >
          Compose Outreach
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Deals */}
        <div className="rounded-2xl border border-mab-navy/10 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-mab-navy">Deals</h3>
          {contact.deals.length === 0 ? (
            <p className="text-xs text-mab-slate">No deals linked</p>
          ) : (
            <div className="space-y-2">
              {contact.deals.map((d) => (
                <a key={d.id} href={`/deals/${d.id}`} className="block rounded-xl bg-mab-ivory/50 p-2 text-xs hover:bg-mab-ivory">
                  <p className="font-medium text-mab-navy">{d.title ?? d.offerType}</p>
                  <p className="text-mab-slate">{d.stage.replace(/_/g, " ")}</p>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Activities */}
        <div className="rounded-2xl border border-mab-navy/10 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-mab-navy">Activities</h3>
          <div className="space-y-2">
            {contact.activities.map((a) => (
              <div key={a.id} className="rounded-xl bg-mab-ivory/50 p-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-medium text-mab-navy">{a.type}</span>
                  <span className="text-mab-slate">{new Date(a.occurredAt).toLocaleDateString()}</span>
                </div>
                {a.outcome && <p className="text-mab-slate">{a.outcome}</p>}
              </div>
            ))}
            {contact.activities.length === 0 && <p className="text-xs text-mab-slate">No activity</p>}
          </div>
        </div>

        {/* Outreach */}
        <div className="rounded-2xl border border-mab-navy/10 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-mab-navy">Outreach</h3>
          <div className="space-y-2">
            {contact.outreachLogs.map((o) => (
              <div key={o.id} className="rounded-xl bg-mab-ivory/50 p-2 text-xs">
                <p className="font-medium text-mab-navy">{o.subject}</p>
                <div className="flex justify-between">
                  <span className={`rounded px-1 ${o.status === "SENT" ? "bg-green-100 text-green-700" : o.status === "DRAFT" ? "bg-gray-100" : "bg-yellow-100"}`}>
                    {o.status}
                  </span>
                  <span className="text-mab-slate">{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {contact.outreachLogs.length === 0 && <p className="text-xs text-mab-slate">No outreach yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
