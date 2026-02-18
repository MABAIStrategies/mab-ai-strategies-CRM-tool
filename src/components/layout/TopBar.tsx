import { Sparkles, Zap } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TopBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-full border border-brand-gold/20 bg-brand-deep/80 px-4 py-2 shadow-[inset_0_0_20px_rgba(10,28,59,0.55)]">
        <Sparkles className="text-brand-gold" size={18} />
        <Input
          placeholder="Command the workspace..."
          className="border-none bg-transparent px-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <span className="rounded-full border border-brand-gold/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-brand-gold/80">
          ⌘ K
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" asChild>
          <Link href="/search">
            <Zap size={16} />
            Intelligent Search
          </Link>
        </Button>
        <Button asChild>
          <Link href="/workspace">Launch Workspace</Link>
        </Button>
      </div>
    </div>
  );
}
