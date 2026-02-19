import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="grid-2">
      <section className="hero-card">
        <div>
          <div className="pill">Local-first AI CRM</div>
          <h1>Command center for assets, templates, and deal intelligence.</h1>
          <p>
            Accelerate every touchpoint with AI-assisted templates, curated assets, and
            instant deal-ready recommendations tailored to MAB AI Strategies.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/assets">
              Explore Assets
            </Link>
            <Link className="secondary-button" href="/templates">
              Build from Templates
            </Link>
            <Link className="secondary-button" href="/deals/alpha" prefetch={false}>
              View Deal Context
            </Link>
          </div>
        </div>
        <div className="profile">
          <Image src="/headshot.svg" alt="Professional headshot" width={64} height={64} />
          <div>
            <div className="pill">Strategy Lead</div>
            <div>Rina Patel · Client Advisory</div>
            <div className="subtle">"Always be ready with the right asset at the right moment."</div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Today’s engagement focus</h2>
        <div className="highlight">
          <strong>Atlas Manufacturing</strong> is ready for a proposal refresh. Use the
          Q2 Insight Deck template and attach the new AI Discovery Brief.
        </div>
        <div className="inline-actions">
          <Link className="primary-button" href="/templates">
            Generate Proposal
          </Link>
          <Link className="ghost-button" href="/assets">
            Review Asset Library
          </Link>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Asset discipline checklist</h2>
        <ul>
          <li>Tag every new asset with persona, industry, and funnel stage.</li>
          <li>Track version history and keep only one live asset per category.</li>
          <li>Attach assets directly to active deals and companies.</li>
        </ul>
        <div className="inline-actions">
          <Link className="ghost-button" href="/assets">
            Start a New Asset
          </Link>
        </div>
      </section>
    </div>
  );
}
