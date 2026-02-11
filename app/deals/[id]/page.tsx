"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const deal = {
  name: "Atlas Manufacturing",
  stage: "Proposal Drafting",
  owner: "Rina Patel",
  nextStep: "Executive alignment review",
  tags: ["Manufacturing", "Executive", "Q2"],
};

const assets = [
  {
    id: "asset-001",
    name: "AI Discovery Brief",
    status: "Live",
    version: "v3.2",
    tags: ["Discovery", "Enterprise", "Manufacturing"],
  },
  {
    id: "asset-002",
    name: "Q2 Insight Deck",
    status: "Draft",
    version: "v1.8",
    tags: ["Proposal", "Executive", "Manufacturing"],
  },
  {
    id: "asset-003",
    name: "MAB AI Overview Video",
    status: "Live",
    version: "v2.4",
    tags: ["Awareness", "Video"],
  },
];

export default function DealDetailPage() {
  const [attachedAssets, setAttachedAssets] = useState<string[]>(["asset-001"]);

  const recommendedAssets = useMemo(() => {
    return assets.filter((asset) => asset.tags.some((tag) => deal.tags.includes(tag)));
  }, []);

  const toggleAsset = (id: string) => {
    setAttachedAssets((prev) =>
      prev.includes(id) ? prev.filter((assetId) => assetId !== id) : [...prev, id]
    );
  };

  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="section-title">Deal Room: {deal.name}</h1>
          <p className="subtle">Stage: {deal.stage}</p>
        </div>
        <div className="inline-actions">
          <Link className="primary-button" href="/templates">
            Generate from Template
          </Link>
          <Link className="ghost-button" href="/assets">
            View Asset Library
          </Link>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h2 className="section-title">Deal essentials</h2>
          <div className="badge-list">
            {deal.tags.map((tag) => (
              <span key={tag} className="pill tag">
                {tag}
              </span>
            ))}
          </div>
          <p className="subtle">Owner: {deal.owner}</p>
          <p className="subtle">Next step: {deal.nextStep}</p>
        </div>
        <div className="card">
          <h2 className="section-title">Recommended assets</h2>
          <p className="subtle">Driven by tags and recent engagement signals.</p>
          {recommendedAssets.map((asset) => (
            <div key={asset.id} className="highlight">
              <strong>{asset.name}</strong>
              <div className="subtle">
                {asset.status} · {asset.version}
              </div>
              <div className="inline-actions" style={{ marginTop: 12 }}>
                <button className="primary-button" onClick={() => toggleAsset(asset.id)}>
                  {attachedAssets.includes(asset.id) ? "Detach" : "Attach to Deal"}
                </button>
                <Link className="ghost-button" href="/assets">
                  Open Asset
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="card" style={{ marginTop: 24 }}>
        <h2 className="section-title">Attached assets</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Status</th>
              <th>Version</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {assets
              .filter((asset) => attachedAssets.includes(asset.id))
              .map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.name}</td>
                  <td>{asset.status}</td>
                  <td>{asset.version}</td>
                  <td>
                    <button className="ghost-button" onClick={() => toggleAsset(asset.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
