import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../src/lib/db";
import { Card } from "../../../../src/components/ui/card";
import { PrimaryButton } from "../../../../src/components/ui/primary-button";

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      contacts: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
      deals: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
      tasks: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } }
    }
  });

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Company dossier</p>
          <h1 className="text-3xl font-semibold text-mab-navy">{company.name}</h1>
          <p className="mt-2 text-sm text-mab-slate">
            {company.industry ?? "Industry pending"} · {company.region ?? "Global"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton
            label="Edit company"
            href={`/companies/${company.id}/edit`}
            ariaLabel="Edit company"
          />
          <PrimaryButton
            label="Add contact"
            variant="outline"
            href={`/contacts/new?companyId=${company.id}`}
            ariaLabel="Add contact"
          />
          <PrimaryButton
            label="Create deal"
            variant="outline"
            href={`/deals/new?companyId=${company.id}`}
            ariaLabel="Create deal"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Account profile" subtitle="ICP and risk intelligence">
          <div className="space-y-3 text-sm text-mab-slate">
            <p>
              <span className="font-medium text-mab-navy">Domain:</span> {company.domain ?? "Not set"}
            </p>
            <p>
              <span className="font-medium text-mab-navy">ICP tags:</span>{" "}
              {company.icpTags.length ? company.icpTags.join(", ") : "Awaiting signals"}
            </p>
            <p>
              <span className="font-medium text-mab-navy">Risk flags:</span>{" "}
              {company.riskFlags.length ? company.riskFlags.join(", ") : "None"}
            </p>
            <p>
              <span className="font-medium text-mab-navy">Notes:</span> {company.notesSummary ?? "No summary"}
            </p>
          </div>
        </Card>
        <Card title="Active contacts" subtitle="Relationship map">
          {company.contacts.length ? (
            <ul className="space-y-3 text-sm">
              {company.contacts.map((contact) => (
                <li key={contact.id}>
                  <Link
                    href={`/contacts/${contact.id}`}
                    className="block rounded-2xl border border-mab-gold/20 bg-white px-4 py-3 text-mab-navy shadow-sm transition hover:-translate-y-0.5 hover:bg-mab-navy hover:text-white"
                  >
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-xs text-mab-slate">
                      {contact.title ?? "Title pending"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mab-slate">No contacts yet. Add one to build influence.</p>
          )}
        </Card>
        <Card title="Open initiatives" subtitle="Deals and tasks">
          <div className="space-y-4 text-sm text-mab-slate">
            <p>
              Deals in motion: <span className="font-semibold text-mab-navy">{company.deals.length}</span>
            </p>
            <p>
              Tasks queued: <span className="font-semibold text-mab-navy">{company.tasks.length}</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton
                label="View deals"
                variant="outline"
                href="/deals"
                ariaLabel="View deals"
              />
              <PrimaryButton
                label="View tasks"
                variant="outline"
                href="/tasks"
                ariaLabel="View tasks"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
