import Link from "next/link";
import Image from "next/image";

export default function BrandHeader() {
  return (
    <header className="top-nav">
      <div className="brand">
        <div className="brand-logo">
          <Image src="/mab-logo.svg" alt="MAB AI Strategies logo" width={36} height={36} />
        </div>
        <div>
          <div className="brand-title">MAB AI Strategies CRM</div>
          <div className="subtle">Hyper-interactive intelligence workspace</div>
        </div>
      </div>
      <nav className="nav-links">
        <Link className="nav-link" href="/">Overview</Link>
        <Link className="nav-link" href="/assets">Assets</Link>
        <Link className="nav-link" href="/templates">Templates</Link>
        <Link className="nav-link" href="/deals/alpha" prefetch={false}>
          Deal Context
        </Link>
      </nav>
    </header>
  );
}
