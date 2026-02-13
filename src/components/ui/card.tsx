import { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  children,
  className
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`glass-card rounded-2xl p-6 ${className ?? ""}`.trim()}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-mab-navy">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-mab-slate">{subtitle}</p> : null}
        </div>
        <span className="h-2 w-2 rounded-full bg-mab-gold animate-pulse-glow" aria-hidden="true" />
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
