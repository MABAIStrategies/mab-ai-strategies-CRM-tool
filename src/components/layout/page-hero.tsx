import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PageHeroProps {
  title: string;
  description: string;
  badge: string;
  ctaLabel: string;
  ctaHref: string;
}

export default function PageHero({
  title,
  description,
  badge,
  ctaLabel,
  ctaHref
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-mab-navy-700/70 bg-mab-navy/70 px-8 py-10 shadow-navy-soft">
      <div className="absolute inset-0 mab-glow opacity-80" aria-hidden />
      <div className="relative z-10 flex flex-col gap-6">
        <Badge className="w-fit animate-glimmer">{badge}</Badge>
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold text-mab-ivory md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-base text-mab-ivory/70">{description}</p>
        </div>
        <Button className="w-fit" asChild>
          <Link href={ctaHref}>
            {ctaLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
