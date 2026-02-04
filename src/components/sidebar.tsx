import Link from "next/link";

const navItems = [
  { href: "/today", label: "Today" },
  { href: "/workspace", label: "Workspace" },
  { href: "/assets", label: "Assets" },
  { href: "/search", label: "Search" },
  { href: "/finish-line", label: "Finish Line" }
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-white/60 bg-white/70 px-4 pb-6 pt-6 shadow-sm lg:flex">
      <div className="flex items-center gap-3">
        <img
          src="/branding/mab-logo.svg"
          alt="MAB AI Strategies logo"
          className="h-10 w-10"
        />
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">MAB AI</p>
          <p className="text-lg font-semibold text-mab-navy">Strategies CRM</p>
        </div>
      </div>
      <nav className="mt-10 space-y-2 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between rounded-xl px-4 py-3 text-mab-slate transition hover:bg-mab-navy/90 hover:text-white"
          >
            {item.label}
            <span className="h-2 w-2 rounded-full bg-mab-gold opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-mab-gold/30 bg-mab-navy px-4 py-5 text-sm text-white shadow-glow">
        <p className="font-medium">Compliance mode</p>
        <p className="mt-1 text-xs text-white/70">Outbound automation disabled. Confirmation required.</p>
      </div>
    </aside>
  );
}
