import Link from "next/link";

import BrandLogo from "@/components/branding/BrandLogo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="brand-panel relative overflow-hidden p-10">
      <div className="absolute inset-0 bg-brand-sheen opacity-70" />
      <div className="relative space-y-6">
        <BrandLogo />
        <p className="text-xs uppercase tracking-[0.35em] text-brand-gold/80">Error 404</p>
        <h2 className="text-3xl font-semibold text-brand-ivory">
          This strategic route is off the map.
        </h2>
        <p className="max-w-2xl text-sm text-brand-ivory/70">
          The destination you requested doesn&apos;t exist yet. Jump to an active command surface
          and keep momentum moving.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/workspace">Go to Workspace</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/search">Run Search</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
