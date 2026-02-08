import Link from "next/link";
import { prisma } from "../../../src/lib/db";
import { Card } from "../../../src/components/ui/card";
import { PrimaryButton } from "../../../src/components/ui/primary-button";

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/branding/mab-logo.svg"
              alt="MAB AI Strategies logo"
              className="h-11 w-11"
            />
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Companies</p>
              <h1 className="text-3xl font-semibold text-mab-navy">Account Intelligence Registry</h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-mab-slate">
            Track high-intent accounts, enrich ICP signals, and orchestrate multi-threaded engagement with a
            premium MAB touch.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton label="Create company" href="/companies/new" ariaLabel="Create company" />
          <PrimaryButton
            label="Assign outreach play"
            variant="outline"
            href="/tasks/new"
            ariaLabel="Assign outreach play"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Account heatmap" subtitle="Signals updated in real time">
          <ul className="space-y-3 text-sm text-mab-slate">
            <li>Momentum-ready: {Math.min(companies.length, 5)} strategic accounts</li>
            <li>ICP alignment: {companies.length ? "Strong" : "Awaiting data"}</li>
            <li>Risk flags monitored by compliance AI</li>
          </ul>
          <div className="mt-4">
            <PrimaryButton label="Review priorities" href="/today" ariaLabel="Review priorities" />
          </div>
        </Card>
        <Card title="Live accounts" subtitle="Tap into each account dossier">
          {companies.length ? (
            <ul className="space-y-3 text-sm">
              {companies.map((company) => (
                <li key={company.id}>
                  <Link
                    href={`/companies/${company.id}`}
                    className="group flex items-center justify-between rounded-2xl border border-mab-gold/20 bg-white px-4 py-3 text-mab-navy shadow-sm transition hover:-translate-y-0.5 hover:bg-mab-navy hover:text-white"
                  >
                    <span>
                      <span className="block font-medium">{company.name}</span>
                      <span className="text-xs text-mab-slate group-hover:text-white/80">
                        {company.industry ?? "Industry aligned"}
                      </span>
                    </span>
                    <span className="h-2 w-2 rounded-full bg-mab-gold opacity-70 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-mab-gold/40 bg-white px-4 py-6 text-sm text-mab-slate">
              No companies yet. Start by creating your first strategic account.
            </div>
          )}
        </Card>
        <Card title="Executive snapshot" subtitle="Signature MAB experience">
          <div className="space-y-4 text-sm text-mab-slate">
            <div className="flex items-center gap-3">
              <img
                src="/branding/mab-headshot.svg"
                alt="Professional headshot"
                className="h-12 w-12 rounded-full border-2 border-mab-gold"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-mab-gold">Strategist</p>
                <p className="font-medium text-mab-navy">MAB Revenue Partner</p>
              </div>
            </div>
            <p>
              Activate personalized briefings and accelerate relationship velocity with hyper-interactive account
              playbooks.
            </p>
            <PrimaryButton
              label="Launch briefing"
              variant="outline"
              href="/workspace"
              ariaLabel="Launch briefing"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
