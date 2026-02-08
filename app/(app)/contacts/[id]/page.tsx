import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../src/lib/db";
import { Card } from "../../../../src/components/ui/card";
import { PrimaryButton } from "../../../../src/components/ui/primary-button";

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const contact = await prisma.contact.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { company: true, deals: { where: { deletedAt: null } }, tasks: { where: { deletedAt: null } } }
  });

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Contact dossier</p>
          <h1 className="text-3xl font-semibold text-mab-navy">{contact.name}</h1>
          <p className="mt-2 text-sm text-mab-slate">
            {contact.title ?? "Title pending"} · {contact.company?.name ?? "No company"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton
            label="Edit contact"
            href={`/contacts/${contact.id}/edit`}
            ariaLabel="Edit contact"
          />
          <PrimaryButton
            label="Log task"
            variant="outline"
            href="/tasks/new"
            ariaLabel="Log task"
          />
          <PrimaryButton
            label="Create deal"
            variant="outline"
            href="/deals/new"
            ariaLabel="Create deal"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Connection data" subtitle="Relationship intelligence">
          <div className="space-y-3 text-sm text-mab-slate">
            <p>
              <span className="font-medium text-mab-navy">Email:</span> {contact.email ?? "Not set"}
            </p>
            <p>
              <span className="font-medium text-mab-navy">Phone:</span> {contact.phone ?? "Not set"}
            </p>
            <p>
              <span className="font-medium text-mab-navy">LinkedIn:</span>{" "}
              {contact.linkedinUrl ?? "Not set"}
            </p>
            <p>
              <span className="font-medium text-mab-navy">Relationship strength:</span> {contact.relationshipStrength}
            </p>
          </div>
        </Card>
        <Card title="Associated deals" subtitle="Pipeline touchpoints">
          {contact.deals.length ? (
            <ul className="space-y-3 text-sm">
              {contact.deals.map((deal) => (
                <li key={deal.id}>
                  <Link
                    href={`/deals/${deal.id}`}
                    className="block rounded-2xl border border-mab-gold/20 bg-white px-4 py-3 text-mab-navy shadow-sm transition hover:-translate-y-0.5 hover:bg-mab-navy hover:text-white"
                  >
                    <p className="font-medium">{deal.stage.replace(/_/g, " ")}</p>
                    <p className="text-xs text-mab-slate">Momentum {deal.momentumScore}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mab-slate">No deals yet. Add a pipeline opportunity.</p>
          )}
        </Card>
        <Card title="Open tasks" subtitle="Momentum builders">
          {contact.tasks.length ? (
            <ul className="space-y-3 text-sm">
              {contact.tasks.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/tasks/${task.id}`}
                    className="block rounded-2xl border border-mab-gold/20 bg-white px-4 py-3 text-mab-navy shadow-sm transition hover:-translate-y-0.5 hover:bg-mab-navy hover:text-white"
                  >
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-mab-slate">Status: {task.status}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mab-slate">No tasks assigned yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
