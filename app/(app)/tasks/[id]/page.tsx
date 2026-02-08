import { notFound } from "next/navigation";
import { prisma } from "../../../../src/lib/db";
import { Card } from "../../../../src/components/ui/card";
import { PrimaryButton } from "../../../../src/components/ui/primary-button";

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = await prisma.task.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { company: true, deal: true, contact: true }
  });

  if (!task) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Task dossier</p>
          <h1 className="text-3xl font-semibold text-mab-navy">{task.title}</h1>
          <p className="mt-2 text-sm text-mab-slate">
            Status {task.status} · {task.company?.name ?? "No company"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton label="Edit task" href={`/tasks/${task.id}/edit`} ariaLabel="Edit task" />
          <PrimaryButton
            label="View deal"
            variant="outline"
            href={task.deal ? `/deals/${task.deal.id}` : "/deals"}
            ariaLabel="View deal"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Task details" subtitle="Execution clarity">
          <div className="space-y-3 text-sm text-mab-slate">
            <p>
              <span className="font-medium text-mab-navy">Description:</span> {task.description ?? "Not set"}
            </p>
            <p>
              <span className="font-medium text-mab-navy">Due date:</span>{" "}
              {task.dueAt ? new Date(task.dueAt).toLocaleDateString() : "Not set"}
            </p>
          </div>
        </Card>
        <Card title="Connected records" subtitle="Aligned context">
          <div className="space-y-3 text-sm text-mab-slate">
            <p>
              <span className="font-medium text-mab-navy">Company:</span> {task.company?.name ?? "Not linked"}
            </p>
            <p>
              <span className="font-medium text-mab-navy">Deal:</span>{" "}
              {task.deal ? task.deal.stage.replace(/_/g, " ") : "Not linked"}
            </p>
            <p>
              <span className="font-medium text-mab-navy">Contact:</span> {task.contact?.name ?? "Not linked"}
            </p>
          </div>
        </Card>
        <Card title="Next action" subtitle="Momentum-ready">
          <div className="space-y-4 text-sm text-mab-slate">
            <p>Keep the follow-through polished with MAB precision and cadence.</p>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton
                label="Open workspace"
                variant="outline"
                href="/workspace"
                ariaLabel="Open workspace"
              />
              <PrimaryButton
                label="Review assets"
                variant="outline"
                href="/assets"
                ariaLabel="Review assets"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
