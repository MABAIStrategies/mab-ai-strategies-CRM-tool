import { Archive, ArrowUpRight, Layers3, ShieldCheck } from "lucide-react";
import Link from "next/link";

import InsightCard from "@/components/layout/InsightCard";
import { Button } from "@/components/ui/button";

export default function AssetsPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-brand-gold/70">
            Assets
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-brand-ivory">
            Curate every strategic asset in a secure intelligence vault.
          </h2>
        </div>
        <Button asChild>
          <Link href="/workspace">
            Back to Workspace <ArrowUpRight size={16} />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <InsightCard
          title="Playbook Library"
          description="Access proven engagement playbooks and update best practices in real time."
          icon={<Layers3 size={20} />}
        />
        <InsightCard
          title="Secure Vault"
          description="Protect sensitive assets with layered permissions and audit trails."
          icon={<ShieldCheck size={20} />}
        />
        <InsightCard
          title="Archive Studio"
          description="Review historical strategies, archived campaigns, and win retrospectives."
          icon={<Archive size={20} />}
        />
      </div>
    </section>
  );
}
