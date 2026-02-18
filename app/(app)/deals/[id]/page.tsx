"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

type DealDetail = {
  id: string;
  title: string | null;
  stage: string;
  value: number | null;
  probability: number;
  momentumScore: number;
  offerType: string;
  objections: string | null;
  roiDrivers: string | null;
  nextStepDate: string | null;
  closeDate: string | null;
  company: { id: string; name: string; domain: string | null };
  primaryContact: { id: string; name: string; email: string | null } | null;
  activities: { id: string; type: string; occurredAt: string; outcome: string | null; contact: { name: string } | null }[];
  notes: { id: string; rawText: string; summary: string | null; tags: string[]; createdAt: string; structuredExtract: Record<string, unknown> | null }[];
  tasks: { id: string; title: string; status: string; dueAt: string | null }[];
};

export default function DealDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<string | null>(null);
  const [genProp, setGenProp] = useState(false);
  const [aiChat, setAiChat] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [activityForm, setActivityForm] = useState({ type: "CALL", outcome: "" });

  const fetchDeal = useCallback(async () => {
    const res = await fetch(`/api/deals/${id}`);
    if (res.ok) {
      const data = await res.json();
      setDeal(data.deal);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchDeal(); }, [fetchDeal]);

  const advanceDeal = async () => {
    await fetch(`/api/deals/${id}/advance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    fetchDeal();
  };

  const generateProposal = async () => {
    setGenProp(true);
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealId: id })
    });
    if (res.ok) {
      const data = await res.json();
      setProposal(data.proposal);
    }
    setGenProp(false);
  };

  const askAI = async () => {
    if (!aiChat.trim() || !deal) return;
    setChatLoading(true);
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "user", content: `Context: Deal with ${deal.company.name}, stage: ${deal.stage}, offer: ${deal.offerType}, momentum: ${deal.momentumScore}. Question: ${aiChat}` }
        ]
      })
    });
    if (res.ok) {
      const data = await res.json();
      setAiResponse(data.response);
    }
    setChatLoading(false);
    setAiChat("");
  };

  const addNote = async () => {
    if (!noteText.trim() || !deal) return;
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": "1" },
      body: JSON.stringify({ companyId: deal.company.id, dealId: id, rawText: noteText })
    });
    setNoteText("");
    fetchDeal();
  };

  const logActivity = async () => {
    if (!deal) return;
    await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: deal.company.id,
        dealId: id,
        contactId: deal.primaryContact?.id ?? null,
        type: activityForm.type,
        outcome: activityForm.outcome || null
      })
    });
    setActivityForm({ type: "CALL", outcome: "" });
    fetchDeal();
  };

  const updateTask = async (taskId: string, status: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    fetchDeal();
  };

  if (loading) return <div className="py-20 text-center text-mab-slate">Loading...</div>;
  if (!deal) return <div className="py-20 text-center text-mab-slate">Deal not found.</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <a href="/pipeline" className="text-xs text-mab-gold hover:underline">← Pipeline</a>
          <h1 className="text-3xl font-semibold text-mab-navy">
            {deal.title ?? deal.offerType} — {deal.company.name}
          </h1>
          <p className="text-sm text-mab-slate">
            Stage: {deal.stage.replace(/_/g, " ")} · {deal.offerType} · Momentum {deal.momentumScore} · {deal.probability}% · {deal.value ? `$${deal.value.toLocaleString()}` : "Value TBD"}
          </p>
          {deal.primaryContact && (
            <p className="text-sm text-mab-slate">
              Contact: <a href={`/contacts/${deal.primaryContact.id}`} className="text-mab-gold hover:underline">{deal.primaryContact.name}</a>
              {deal.primaryContact.email && ` (${deal.primaryContact.email})`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={advanceDeal} className="rounded-xl bg-mab-navy px-5 py-2 text-sm font-medium text-white transition hover:bg-mab-gold hover:text-mab-navy">
            Advance Stage →
          </button>
          <button onClick={generateProposal} disabled={genProp} className="rounded-xl bg-mab-gold/20 px-5 py-2 text-sm font-medium text-mab-navy transition hover:bg-mab-gold">
            {genProp ? "Generating..." : "Generate Proposal"}
          </button>
        </div>
      </header>

      {/* Proposal */}
      {proposal && (
        <div className="rounded-2xl border border-mab-gold/30 bg-white p-6 shadow-glow">
          <h3 className="mb-2 text-sm font-semibold text-mab-gold">Generated Proposal</h3>
          <pre className="whitespace-pre-wrap text-sm text-mab-ink">{proposal}</pre>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Timeline + Log */}
        <div className="rounded-2xl border border-mab-navy/10 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-mab-navy">Activity Log</h3>
          <div className="mb-3 space-y-2 rounded-xl bg-mab-ivory/50 p-3">
            <select value={activityForm.type} onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })} className="w-full rounded-lg border border-mab-navy/10 px-3 py-1.5 text-xs focus:border-mab-gold focus:outline-none">
              <option value="CALL">Call</option>
              <option value="MEETING">Meeting</option>
              <option value="EMAIL">Email</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="OTHER">Other</option>
            </select>
            <input placeholder="Outcome / notes" value={activityForm.outcome} onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value })} className="w-full rounded-lg border border-mab-navy/10 px-3 py-1.5 text-xs focus:border-mab-gold focus:outline-none" />
            <button onClick={logActivity} className="rounded-lg bg-mab-navy px-4 py-1.5 text-xs text-white">Log</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {deal.activities.map((a) => (
              <div key={a.id} className="rounded-xl bg-mab-ivory/50 p-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-medium text-mab-navy">{a.type}</span>
                  <span className="text-mab-slate">{new Date(a.occurredAt).toLocaleDateString()}</span>
                </div>
                {a.outcome && <p className="text-mab-slate">{a.outcome}</p>}
                {a.contact && <p className="text-mab-gold">{a.contact.name}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Notes + Tasks */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-mab-navy/10 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-mab-navy">Notes</h3>
            <div className="mb-3">
              <textarea placeholder="Add a note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} className="w-full rounded-lg border border-mab-navy/10 px-3 py-2 text-xs focus:border-mab-gold focus:outline-none" rows={3} />
              <button onClick={addNote} className="mt-1 rounded-lg bg-mab-navy px-4 py-1.5 text-xs text-white">Save</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {deal.notes.map((n) => (
                <div key={n.id} className="rounded-xl bg-mab-ivory/50 p-2 text-xs">
                  <p className="text-mab-ink">{n.rawText}</p>
                  {n.summary && <p className="mt-1 text-mab-gold italic">{n.summary}</p>}
                  <p className="mt-1 text-mab-slate">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-mab-navy/10 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-mab-navy">Tasks</h3>
            <div className="space-y-1">
              {deal.tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded-lg bg-mab-ivory/50 p-2 text-xs">
                  <button onClick={() => updateTask(t.id, t.status === "DONE" ? "TODO" : "DONE")} className={`h-4 w-4 rounded border ${t.status === "DONE" ? "bg-mab-gold border-mab-gold" : "border-mab-navy/30"}`} />
                  <span className={t.status === "DONE" ? "line-through text-mab-slate" : "text-mab-navy"}>{t.title}</span>
                </div>
              ))}
              {deal.tasks.length === 0 && <p className="text-xs text-mab-slate">No tasks</p>}
            </div>
          </div>
        </div>

        {/* AI Copilot */}
        <div className="rounded-2xl border border-mab-gold/30 bg-mab-navy p-4 text-white shadow-glow">
          <p className="mb-1 text-xs uppercase tracking-[0.3em] text-mab-gold">AI Copilot</p>
          <h3 className="mb-3 text-sm font-semibold">Deal Intelligence</h3>
          <div className="mb-3">
            <input
              placeholder="Ask about this deal..."
              value={aiChat}
              onChange={(e) => setAiChat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askAI()}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-xs text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-mab-gold"
            />
            <button onClick={askAI} disabled={chatLoading} className="mt-2 rounded-lg bg-mab-gold px-4 py-1.5 text-xs text-mab-navy font-medium">
              {chatLoading ? "Thinking..." : "Ask AI"}
            </button>
          </div>
          {aiResponse && (
            <div className="rounded-lg bg-white/10 p-3 text-xs whitespace-pre-wrap">
              {aiResponse}
            </div>
          )}
          <div className="mt-4 space-y-2 text-xs text-white/70">
            <div>
              <p className="font-medium text-white">Deal Status</p>
              <p>{deal.stage.replace(/_/g, " ")} · {deal.probability}% likely · Momentum {deal.momentumScore}</p>
            </div>
            {deal.objections && (
              <div>
                <p className="font-medium text-white">Objections</p>
                <p>{deal.objections}</p>
              </div>
            )}
            {deal.roiDrivers && (
              <div>
                <p className="font-medium text-white">ROI Drivers</p>
                <p>{deal.roiDrivers}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
