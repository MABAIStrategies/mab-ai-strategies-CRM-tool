import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export default function InsightCard({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "brand-panel group relative overflow-hidden px-6 py-5 transition-all hover:-translate-y-1 hover:shadow-[0_25px_50px_-24px_rgba(216,180,92,0.45)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-brand-sheen opacity-60 transition-opacity duration-500 group-hover:opacity-90" />
      <div className="relative flex items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-brand-gold/20 bg-brand-midnight text-brand-gold shadow-glow">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-brand-ivory">{title}</h3>
          <p className="mt-2 text-sm text-brand-ivory/70">{description}</p>
        </div>
      </div>
    </div>
  );
}
