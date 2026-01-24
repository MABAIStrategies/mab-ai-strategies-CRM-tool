import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-lg bg-mab-navy/10",
        className
      )}
      aria-hidden="true"
    />
  );
}
