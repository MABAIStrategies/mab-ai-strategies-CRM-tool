import { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_25px_50px_-24px_rgba(216,180,92,0.45)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-brand-sheen opacity-60 transition-opacity duration-500 group-hover:opacity-90" />
      <CardHeader className="relative flex-row items-start gap-4 space-y-0 pb-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-brand-gold/20 bg-brand-midnight text-brand-gold shadow-glow">
          {icon}
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative pt-0">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
      </CardContent>
    </Card>
  );
}
