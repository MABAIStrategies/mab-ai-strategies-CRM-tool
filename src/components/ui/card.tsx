import { ReactNode } from "react";

type CardData<T> = {
  data?: T;
};

export function Card<T>({
  title,
  subtitle,
  children,
  data
}: {
  title: string;
  subtitle?: string;
  children: ReactNode | ((data: NonNullable<T>) => ReactNode);
} & CardData<T>) {
  return (
    <section className="glass-card rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-mab-navy">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-mab-slate">{subtitle}</p> : null}
        </div>
        <span className="h-2 w-2 rounded-full bg-mab-gold animate-pulse-glow" aria-hidden="true" />
      </div>
      <div className="mt-5">
        {typeof children === "function" && data ? children(data as NonNullable<T>) : children}
      </div>
    </section>
  );
}
