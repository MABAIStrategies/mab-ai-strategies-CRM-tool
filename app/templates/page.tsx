"use client";

import { useState } from "react";
import Link from "next/link";

const initialTemplates = [
  {
    id: "template-001",
    name: "Executive Proposal Narrative",
    description: "Executive-ready narrative flow with outcomes and ROI blocks.",
    status: "Live",
    version: "v5.0",
    tags: ["Proposal", "Executive"],
  },
  {
    id: "template-002",
    name: "AI Discovery Sprint",
    description: "Workshop agenda and capture framework for discovery calls.",
    status: "Live",
    version: "v2.3",
    tags: ["Discovery", "Workshop"],
  },
  {
    id: "template-003",
    name: "Pilot Proposal",
    description: "Outline for pilot scope, timeline, and governance.",
    status: "Draft",
    version: "v1.4",
    tags: ["Pilot", "Scope"],
  },
];

const dealOptions = ["Atlas Manufacturing", "Orchid Labs", "Summit Finance"];
const companyOptions = ["Atlas Manufacturing", "Orchid Labs", "Summit Finance", "Beacon Retail"];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(initialTemplates);
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplates[0]);
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    status: "Live",
    version: "v1.0",
    tags: "",
  });
  const [generateState, setGenerateState] = useState({
    assetName: "",
    deal: dealOptions[0],
    company: companyOptions[0],
    intent: "",
    urgency: "Priority",
  });

  const openCreate = () => {
    setEditingId(null);
    setFormState({
      name: "",
      description: "",
      status: "Live",
      version: "v1.0",
      tags: "",
    });
    setIsOpen(true);
  };

  const openEdit = (id: string) => {
    const template = templates.find((item) => item.id === id);
    if (!template) return;
    setEditingId(id);
    setFormState({
      name: template.name,
      description: template.description,
      status: template.status,
      version: template.version,
      tags: template.tags.join(", "),
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    const tagList = formState.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (!formState.name.trim()) {
      return;
    }
    if (editingId) {
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === editingId
            ? {
                ...template,
                name: formState.name,
                description: formState.description,
                status: formState.status,
                version: formState.version,
                tags: tagList,
              }
            : template
        )
      );
    } else {
      setTemplates((prev) => [
        {
          id: `template-${prev.length + 1}`,
          name: formState.name,
          description: formState.description,
          status: formState.status,
          version: formState.version,
          tags: tagList,
        },
        ...prev,
      ]);
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((template) => template.id !== id));
  };

  const openGenerate = (id: string) => {
    const template = templates.find((item) => item.id === id);
    if (!template) return;
    setSelectedTemplate(template);
    setGenerateState((prev) => ({
      ...prev,
      assetName: `${template.name} - ${dealOptions[0]}`,
      deal: dealOptions[0],
      company: companyOptions[0],
    }));
    setIsGenerateOpen(true);
  };

  const handleGenerate = () => {
    setIsGenerateOpen(false);
  };

  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="section-title">Templates Studio</h1>
          <p className="subtle">Standardize your playbooks and generate new assets instantly.</p>
        </div>
        <button className="primary-button" onClick={openCreate}>
          New Template
        </button>
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h2 className="section-title">Generate from template</h2>
          <p className="subtle">
            Select a template to auto-create a new asset with context from deals and companies.
          </p>
          <div className="inline-actions">
            {templates.slice(0, 2).map((template) => (
              <button
                key={template.id}
                className="primary-button"
                onClick={() => openGenerate(template.id)}
              >
                Generate {template.name}
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="section-title">Active playbooks</h2>
          <p className="subtle">Templates currently powering your deal rooms.</p>
          <div className="badge-list">
            {templates
              .filter((template) => template.status === "Live")
              .map((template) => (
                <span key={template.id} className="pill tag">
                  {template.name}
                </span>
              ))}
          </div>
          <div className="inline-actions">
            <Link className="ghost-button" href="/assets">
              View Generated Assets
            </Link>
          </div>
        </div>
      </div>

      <table className="table" style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <th>Template</th>
            <th>Status</th>
            <th>Version</th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template.id}>
              <td>
                <strong>{template.name}</strong>
                <div className="subtle">{template.description}</div>
              </td>
              <td>
                <span
                  className={`status ${
                    template.status === "Live"
                      ? "status-live"
                      : template.status === "Draft"
                      ? "status-draft"
                      : "status-archived"
                  }`}
                >
                  {template.status}
                </span>
              </td>
              <td>{template.version}</td>
              <td>
                <div className="badge-list">
                  {template.tags.map((tag) => (
                    <span key={tag} className="pill tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                <div className="inline-actions">
                  <button className="primary-button" onClick={() => openGenerate(template.id)}>
                    Generate Asset
                  </button>
                  <button className="ghost-button" onClick={() => openEdit(template.id)}>
                    Edit
                  </button>
                  <button className="ghost-button" onClick={() => handleDelete(template.id)}>
                    Archive
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2 className="section-title">
              {editingId ? "Edit template" : "Create template"}
            </h2>
            <div className="form-grid">
              <div>
                <label htmlFor="template-name">Template name</label>
                <input
                  id="template-name"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div>
                <label htmlFor="template-description">Description</label>
                <textarea
                  id="template-description"
                  rows={3}
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                <div>
                  <label htmlFor="template-status">Status</label>
                  <select
                    id="template-status"
                    value={formState.status}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, status: event.target.value }))
                    }
                  >
                    <option value="Live">Live</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="template-version">Version</label>
                  <input
                    id="template-version"
                    value={formState.version}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, version: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label htmlFor="template-tags">Tags (comma separated)</label>
                <input
                  id="template-tags"
                  value={formState.tags}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, tags: event.target.value }))
                  }
                />
              </div>
              <div className="inline-actions" style={{ justifyContent: "flex-end" }}>
                <button className="ghost-button" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button className="primary-button" onClick={handleSubmit}>
                  {editingId ? "Save changes" : "Create template"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isGenerateOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2 className="section-title">Generate asset from template</h2>
            <div className="highlight" style={{ marginBottom: 16 }}>
              <strong>{selectedTemplate.name}</strong>
              <div className="subtle">{selectedTemplate.description}</div>
            </div>
            <div className="form-grid">
              <div>
                <label htmlFor="generate-asset">Asset name</label>
                <input
                  id="generate-asset"
                  value={generateState.assetName}
                  onChange={(event) =>
                    setGenerateState((prev) => ({ ...prev, assetName: event.target.value }))
                  }
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                <div>
                  <label htmlFor="generate-deal">Attach to deal</label>
                  <select
                    id="generate-deal"
                    value={generateState.deal}
                    onChange={(event) =>
                      setGenerateState((prev) => ({ ...prev, deal: event.target.value }))
                    }
                  >
                    {dealOptions.map((deal) => (
                      <option key={deal} value={deal}>
                        {deal}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="generate-company">Attach to company</label>
                  <select
                    id="generate-company"
                    value={generateState.company}
                    onChange={(event) =>
                      setGenerateState((prev) => ({ ...prev, company: event.target.value }))
                    }
                  >
                    {companyOptions.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="generate-intent">Intent highlight</label>
                <textarea
                  id="generate-intent"
                  rows={2}
                  value={generateState.intent}
                  onChange={(event) =>
                    setGenerateState((prev) => ({ ...prev, intent: event.target.value }))
                  }
                />
              </div>
              <div>
                <label htmlFor="generate-urgency">Priority signal</label>
                <select
                  id="generate-urgency"
                  value={generateState.urgency}
                  onChange={(event) =>
                    setGenerateState((prev) => ({ ...prev, urgency: event.target.value }))
                  }
                >
                  <option>Priority</option>
                  <option>Standard</option>
                  <option>Backlog</option>
                </select>
              </div>
              <div className="inline-actions" style={{ justifyContent: "flex-end" }}>
                <button className="ghost-button" onClick={() => setIsGenerateOpen(false)}>
                  Cancel
                </button>
                <button className="primary-button" onClick={handleGenerate}>
                  Generate and Attach
                </button>
              </div>
            </div>
            <div className="subtle" style={{ marginTop: 16 }}>
              The generated asset will appear in the Assets library with attached deal and company context.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
