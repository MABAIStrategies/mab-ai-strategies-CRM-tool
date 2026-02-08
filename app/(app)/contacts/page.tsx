import Link from "next/link";
import { prisma } from "../../../src/lib/db";
import { Card } from "../../../src/components/ui/card";
import { PrimaryButton } from "../../../src/components/ui/primary-button";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { company: true }
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Contacts</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Relationship Intelligence Hub</h1>
          <p className="mt-2 text-sm text-mab-slate">
            Map champions, gatekeepers, and stakeholders with detail-rich profiles that elevate every interaction.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton label="Create contact" href="/contacts/new" ariaLabel="Create contact" />
          <PrimaryButton
            label="Start outreach"
            variant="outline"
            href="/tasks/new"
            ariaLabel="Start outreach"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Priority connections" subtitle="Engagement-ready stakeholders">
          <ul className="space-y-3 text-sm text-mab-slate">
            <li>Relationship depth scoring enabled</li>
            <li>Next best action auto-suggested</li>
            <li>LinkedIn context pulled into CRM</li>
          </ul>
          <div className="mt-4">
            <PrimaryButton label="View tasks" href="/tasks" ariaLabel="View tasks" />
          </div>
        </Card>
        <Card title="Active contacts" subtitle="Tap to open dossiers">
          {contacts.length ? (
            <ul className="space-y-3 text-sm">
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <Link
                    href={`/contacts/${contact.id}`}
                    className="block rounded-2xl border border-mab-gold/20 bg-white px-4 py-3 text-mab-navy shadow-sm transition hover:-translate-y-0.5 hover:bg-mab-navy hover:text-white"
                  >
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-xs text-mab-slate">
                      {contact.title ?? "Title pending"} · {contact.company?.name ?? "No company"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-mab-gold/40 bg-white px-4 py-6 text-sm text-mab-slate">
              No contacts yet. Add your first stakeholder to begin relationship mapping.
            </div>
          )}
        </Card>
        <Card title="Personalization control" subtitle="MAB AI cadence">
          <div className="space-y-4 text-sm text-mab-slate">
            <p>Activate tailored narrative arcs and keep every outreach sequence on-brand.</p>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton
                label="Open assets"
                variant="outline"
                href="/assets"
                ariaLabel="Open assets"
              />
              <PrimaryButton
                label="Open search"
                variant="outline"
                href="/search"
                ariaLabel="Open search"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
