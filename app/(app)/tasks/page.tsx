import Link from "next/link";
import { prisma } from "../../../src/lib/db";
import { Card } from "../../../src/components/ui/card";
import { PrimaryButton } from "../../../src/components/ui/primary-button";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { company: true }
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Tasks</p>
          <h1 className="text-3xl font-semibold text-mab-navy">Momentum Taskboard</h1>
          <p className="mt-2 text-sm text-mab-slate">
            Keep every action synchronized with your MAB playbook and aligned to account urgency.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton label="Create task" href="/tasks/new" ariaLabel="Create task" />
          <PrimaryButton
            label="Open today"
            variant="outline"
            href="/today"
            ariaLabel="Open today"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Task intensity" subtitle="Live productivity pulse">
          <ul className="space-y-3 text-sm text-mab-slate">
            <li>Open tasks: {tasks.length}</li>
            <li>AI reminders enabled</li>
            <li>Compliance gating always on</li>
          </ul>
          <div className="mt-4">
            <PrimaryButton label="Open workspace" href="/workspace" ariaLabel="Open workspace" />
          </div>
        </Card>
        <Card title="Active tasks" subtitle="Tap to open details">
          {tasks.length ? (
            <ul className="space-y-3 text-sm">
              {tasks.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/tasks/${task.id}`}
                    className="block rounded-2xl border border-mab-gold/20 bg-white px-4 py-3 text-mab-navy shadow-sm transition hover:-translate-y-0.5 hover:bg-mab-navy hover:text-white"
                  >
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-mab-slate">
                      {task.company?.name ?? "No company"} · {task.status}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-mab-gold/40 bg-white px-4 py-6 text-sm text-mab-slate">
              No tasks yet. Create your first action to maintain momentum.
            </div>
          )}
        </Card>
        <Card title="Engagement cadence" subtitle="MAB interactions">
          <div className="space-y-4 text-sm text-mab-slate">
            <p>Balance outbound, follow-ups, and internal prep with a focused MAB rhythm.</p>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton
                label="View companies"
                variant="outline"
                href="/companies"
                ariaLabel="View companies"
              />
              <PrimaryButton
                label="View contacts"
                variant="outline"
                href="/contacts"
                ariaLabel="View contacts"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
