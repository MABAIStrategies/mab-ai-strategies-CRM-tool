"use client";

import { useEffect, useState, useCallback } from "react";

type OutreachLog = {
  id: string;
  toEmail: string;
  subject: string;
  body: string;
  status: string;
  sentAt: string | null;
  sequenceStep: number;
  createdAt: string;
  contact: { id: string; name: string; email: string | null } | null;
  company: { id: string; name: string } | null;
};

type Contact = { id: string; name: string; email: string | null; company: { id: string; name: string } };

export default function OutreachPage() {
  const [logs, setLogs] = useState<OutreachLog[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState("");
  const [composing, setComposing] = useState(false);
  const [preview, setPreview] = useState<{ subject: string; body: string } | null>(null);
  const [filter, setFilter] = useState("all");

  const fetchLogs = useCallback(async () => {
    const params = filter !== "all" ? `?status=${filter}` : "";
    const res = await fetch(`/api/outreach${params}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.outreach);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchLogs();
    fetch("/api/contacts?limit=50")
      .then((r) => r.json())
      .then((d) => setContacts(d.contacts ?? []));
  }, [fetchLogs]);

  const compose = async () => {
    if (!selectedContact) return;
    setComposing(true);
    const res = await fetch("/api/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: selectedContact, sequenceStep: 1 })
    });
    if (res.ok) {
      const data = await res.json();
      setPreview({ subject: data.outreach.subject, body: data.outreach.body });
      fetchLogs();
    }
    setComposing(false);
  };

  const sendDraft = async (logId: string) => {
    // Mark as sent by resending with send flag
    const log = logs.find((l) => l.id === logId);
    if (!log) return;
    await fetch("/api/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toEmail: log.toEmail,
        subject: log.subject,
        body: log.body,
        companyId: log.company?.id,
        contactId: log.contact?.id,
        send: true
      })
    });
    fetchLogs();
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SENT: "bg-green-100 text-green-700",
    DELIVERED: "bg-blue-100 text-blue-700",
    OPENED: "bg-purple-100 text-purple-700",
    FAILED: "bg-red-100 text-red-700",
    BOUNCED: "bg-red-100 text-red-700"
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Outreach</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Email Outreach</h1>
          <p className="mt-1 text-sm text-mab-slate">
            {logs.length} emails · {logs.filter((l) => l.status === "SENT").length} sent · {logs.filter((l) => l.status === "DRAFT").length} drafts
          </p>
        </div>
      </header>

      {/* Compose */}
      <div className="rounded-2xl border border-mab-gold/30 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-mab-navy">Compose Outreach</h3>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-mab-slate">Select Contact</label>
            <select
              value={selectedContact}
              onChange={(e) => setSelectedContact(e.target.value)}
              className="w-full rounded-xl border border-mab-navy/10 px-4 py-2 text-sm focus:border-mab-gold focus:outline-none"
            >
              <option value="">Choose a contact...</option>
              {contacts.filter((c) => c.email).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email}) — {c.company.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={compose}
            disabled={composing || !selectedContact}
            className="rounded-xl bg-mab-navy px-6 py-2 text-sm font-medium text-white transition hover:bg-mab-gold hover:text-mab-navy disabled:opacity-50"
          >
            {composing ? "Composing..." : "AI Compose"}
          </button>
        </div>
        {preview && (
          <div className="mt-4 rounded-xl bg-mab-ivory p-4">
            <p className="text-sm font-medium text-mab-navy">Subject: {preview.subject}</p>
            <pre className="mt-2 whitespace-pre-wrap text-sm text-mab-slate">{preview.body}</pre>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "DRAFT", "SENT", "FAILED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${filter === f ? "bg-mab-navy text-white" : "bg-mab-navy/5 text-mab-navy hover:bg-mab-navy/10"}`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Outreach Log */}
      {loading ? (
        <div className="py-20 text-center text-mab-slate">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="py-20 text-center text-mab-slate">No outreach yet. Compose your first email above.</div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-mab-navy/10 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-mab-navy">{log.subject}</p>
                  <p className="text-xs text-mab-slate">
                    To: {log.toEmail}
                    {log.contact && ` (${log.contact.name})`}
                    {log.company && ` · ${log.company.name}`}
                    · Step {log.sequenceStep}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[log.status] ?? "bg-gray-100"}`}>
                    {log.status}
                  </span>
                  {log.status === "DRAFT" && (
                    <button
                      onClick={() => sendDraft(log.id)}
                      className="rounded-lg bg-mab-gold/20 px-3 py-1 text-xs font-medium text-mab-navy hover:bg-mab-gold"
                    >
                      Send
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-mab-slate line-clamp-2">{log.body}</p>
              <p className="mt-1 text-xs text-mab-slate/50">
                {log.sentAt ? `Sent ${new Date(log.sentAt).toLocaleString()}` : new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
