import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-gradient-to-r from-brand-deep via-brand-gold/20 to-brand-deep bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  );
}
