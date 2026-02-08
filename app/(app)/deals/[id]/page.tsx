import { notFound } from "next/navigation";
import { prisma } from "../../../../src/lib/db";
import { Card } from "../../../../src/components/ui/card";
import { PrimaryButton } from "../../../../src/components/ui/primary-button";

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const deal = await prisma.deal.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      company: true,
      primaryContact: true,
      tasks: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } }
    }
  });

  if (!deal) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Deal dossier</p>
          <h1 className="text-3xl font-semibold text-mab-navy">{deal.stage.replace(/_/g, " ")}</h1>
          <p className="mt-2 text-sm text-mab-slate">
            {deal.company?.name ?? "No company"} · Momentum {deal.momentumScore}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton
            label="Edit deal"
            href={`/deals/${deal.id}/edit`}
            ariaLabel="Edit deal"
          />
          <PrimaryButton
            label="Add task"
            variant="outline"
            href="/tasks/new"
            ariaLabel="Add task"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Deal profile" subtitle="Offer readiness">
          <div className="space-y-3 text-sm text-mab-slate">
            <p>
              <span className="font-medium text-mab-navy">Offer type:</span> {deal.offerType}
            </p>
            <p>
              <span className="font-medium text-mab-navy">Value:</span> {deal.value ?? "TBD"}
            </p>
            <p>
              <span className="font-medium text-mab-navy">Probability:</span> {deal.probability}%
            </p>
            <p>
              <span className="font-medium text-mab-navy">Next step:</span>{" "}
              {deal.nextStepDate ? new Date(deal.nextStepDate).toLocaleDateString() : "Not set"}
            </p>
          </div>
        </Card>
        <Card title="Primary contact" subtitle="Stakeholder alignment">
          <div className="space-y-3 text-sm text-mab-slate">
            <p className="font-medium text-mab-navy">{deal.primaryContact?.name ?? "Unassigned"}</p>
            <p>{deal.primaryContact?.title ?? "Title pending"}</p>
            <PrimaryButton
              label="View contacts"
              variant="outline"
              href="/contacts"
              ariaLabel="View contacts"
            />
          </div>
        </Card>
        <Card title="Active tasks" subtitle="Momentum builders">
          {deal.tasks.length ? (
            <ul className="space-y-3 text-sm text-mab-slate">
              {deal.tasks.map((task) => (
                <li key={task.id} className="rounded-2xl border border-mab-gold/20 bg-white px-4 py-3">
                  <p className="font-medium text-mab-navy">{task.title}</p>
                  <p className="text-xs text-mab-slate">Status: {task.status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mab-slate">No tasks yet. Add a task to maintain deal momentum.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
