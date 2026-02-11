"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const initialAssets = [
  {
    id: "asset-001",
    name: "AI Discovery Brief",
    description: "One-pager framing AI roadmap and discovery outcomes.",
    status: "Live",
    version: "v3.2",
    tags: ["Discovery", "Enterprise", "Healthcare"],
    linkedDeals: ["Atlas Manufacturing"],
    linkedCompanies: ["Atlas Manufacturing"],
  },
  {
    id: "asset-002",
    name: "Q2 Insight Deck",
    description: "Narrative slide deck for executive buyers.",
    status: "Draft",
    version: "v1.8",
    tags: ["Proposal", "Executive", "Manufacturing"],
    linkedDeals: ["Orchid Labs"],
    linkedCompanies: ["Orchid Labs"],
  },
  {
    id: "asset-003",
    name: "MAB AI Overview Video",
    description: "90-second vision teaser for stakeholders.",
    status: "Archived",
    version: "v2.4",
    tags: ["Awareness", "Video"],
    linkedDeals: [],
    linkedCompanies: [],
  },
];

const deals = ["Atlas Manufacturing", "Orchid Labs", "Summit Finance"];
const companies = ["Atlas Manufacturing", "Orchid Labs", "Summit Finance", "Beacon Retail"];

export default function AssetsPage() {
  const [assets, setAssets] = useState(initialAssets);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    status: "Live",
    version: "v1.0",
    tags: "",
    linkedDeals: [] as string[],
    linkedCompanies: [] as string[],
  });

  const filteredRecommendations = useMemo(() => {
    return assets.filter((asset) => asset.tags.includes("Proposal"));
  }, [assets]);

  const openCreate = () => {
    setEditingId(null);
    setFormState({
      name: "",
      description: "",
      status: "Live",
      version: "v1.0",
      tags: "",
      linkedDeals: [],
      linkedCompanies: [],
    });
    setIsOpen(true);
  };

  const openEdit = (id: string) => {
    const asset = assets.find((item) => item.id === id);
    if (!asset) return;
    setEditingId(id);
    setFormState({
      name: asset.name,
      description: asset.description,
      status: asset.status,
      version: asset.version,
      tags: asset.tags.join(", "),
      linkedDeals: asset.linkedDeals,
      linkedCompanies: asset.linkedCompanies,
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
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === editingId
            ? {
                ...asset,
                name: formState.name,
                description: formState.description,
                status: formState.status,
                version: formState.version,
                tags: tagList,
                linkedDeals: formState.linkedDeals,
                linkedCompanies: formState.linkedCompanies,
              }
            : asset
        )
      );
    } else {
      setAssets((prev) => [
        {
          id: `asset-${prev.length + 1}`,
          name: formState.name,
          description: formState.description,
          status: formState.status,
          version: formState.version,
          tags: tagList,
          linkedDeals: formState.linkedDeals,
          linkedCompanies: formState.linkedCompanies,
        },
        ...prev,
      ]);
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((asset) => asset.id !== id));
  };

  const toggleLinkedItem = (value: string, list: string[], update: (next: string[]) => void) => {
    if (list.includes(value)) {
      update(list.filter((item) => item !== value));
    } else {
      update([...list, value]);
    }
  };

  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="section-title">Assets Library</h1>
          <p className="subtle">Track assets, versions, and where each asset is deployed.</p>
        </div>
        <button className="primary-button" onClick={openCreate}>
          New Asset
        </button>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="section-title">Recommended assets for deals</h2>
          <p className="subtle">Assets tagged for proposal readiness.</p>
          {filteredRecommendations.map((asset) => (
            <div key={asset.id} className="highlight">
              <strong>{asset.name}</strong>
              <div className="badge-list" style={{ marginTop: 8 }}>
                {asset.tags.map((tag) => (
                  <span key={tag} className="pill tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="inline-actions" style={{ marginTop: 12 }}>
                <button className="ghost-button" onClick={() => openEdit(asset.id)}>
                  Refine Asset
                </button>
                <Link className="secondary-button" href="/deals/alpha" prefetch={false}>
                  Attach to Deal
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="section-title">Quick attach to context</h2>
          <p className="subtle">
            Drag assets into live deal rooms or link them to company intelligence profiles.
          </p>
          <div className="inline-actions">
            <Link className="primary-button" href="/deals/alpha" prefetch={false}>
              Open Atlas Deal
            </Link>
            <button className="ghost-button" onClick={openCreate}>
              Create and Attach
            </button>
          </div>
        </div>
      </div>

      <table className="table" style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Status</th>
            <th>Version</th>
            <th>Tags</th>
            <th>Linked Deals</th>
            <th>Linked Companies</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td>
                <strong>{asset.name}</strong>
                <div className="subtle">{asset.description}</div>
              </td>
              <td>
                <span
                  className={`status ${
                    asset.status === "Live"
                      ? "status-live"
                      : asset.status === "Draft"
                      ? "status-draft"
                      : "status-archived"
                  }`}
                >
                  {asset.status}
                </span>
              </td>
              <td>{asset.version}</td>
              <td>
                <div className="badge-list">
                  {asset.tags.map((tag) => (
                    <span key={tag} className="pill tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td>{asset.linkedDeals.join(", ") || "—"}</td>
              <td>{asset.linkedCompanies.join(", ") || "—"}</td>
              <td>
                <div className="inline-actions">
                  <button className="ghost-button" onClick={() => openEdit(asset.id)}>
                    Edit
                  </button>
                  <button className="ghost-button" onClick={() => handleDelete(asset.id)}>
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
            <h2 className="section-title">{editingId ? "Edit asset" : "Create asset"}</h2>
            <div className="form-grid">
              <div>
                <label htmlFor="asset-name">Asset name</label>
                <input
                  id="asset-name"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Asset name"
                />
              </div>
              <div>
                <label htmlFor="asset-description">Description</label>
                <textarea
                  id="asset-description"
                  rows={3}
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                <div>
                  <label htmlFor="asset-status">Status</label>
                  <select
                    id="asset-status"
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
                  <label htmlFor="asset-version">Version</label>
                  <input
                    id="asset-version"
                    value={formState.version}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, version: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label htmlFor="asset-tags">Tags (comma separated)</label>
                <input
                  id="asset-tags"
                  value={formState.tags}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, tags: event.target.value }))
                  }
                />
              </div>
              <div>
                <label>Attach to Deals</label>
                <div className="badge-list">
                  {deals.map((deal) => (
                    <button
                      key={deal}
                      className={
                        formState.linkedDeals.includes(deal)
                          ? "primary-button"
                          : "ghost-button"
                      }
                      onClick={() =>
                        toggleLinkedItem(deal, formState.linkedDeals, (next) =>
                          setFormState((prev) => ({ ...prev, linkedDeals: next }))
                        )
                      }
                    >
                      {deal}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>Attach to Companies</label>
                <div className="badge-list">
                  {companies.map((company) => (
                    <button
                      key={company}
                      className={
                        formState.linkedCompanies.includes(company)
                          ? "primary-button"
                          : "ghost-button"
                      }
                      onClick={() =>
                        toggleLinkedItem(company, formState.linkedCompanies, (next) =>
                          setFormState((prev) => ({ ...prev, linkedCompanies: next }))
                        )
                      }
                    >
                      {company}
                    </button>
                  ))}
                </div>
              </div>
              <div className="inline-actions" style={{ justifyContent: "flex-end" }}>
                <button className="ghost-button" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button className="primary-button" onClick={handleSubmit}>
                  {editingId ? "Save changes" : "Create asset"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
