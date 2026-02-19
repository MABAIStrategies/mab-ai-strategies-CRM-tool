import { notFound } from "next/navigation";
import { prisma } from "../../../../../src/lib/db";
import { TaskForm } from "../../components/task-form";

export default async function EditTaskPage({ params }: { params: { id: string } }) {
  const task = await prisma.task.findFirst({
    where: { id: params.id, deletedAt: null }
  });

  if (!task) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Edit task</p>
        <h1 className="text-3xl font-semibold text-mab-navy">Refine task execution</h1>
        <p className="mt-2 text-sm text-mab-slate">
          Adjust timing, status, and context to keep every action on track.
        </p>
      </header>
      <TaskForm
        initialData={{
          id: task.id,
          title: task.title,
          description: task.description ?? "",
          status: task.status,
          dueAt: task.dueAt ? task.dueAt.toISOString().slice(0, 10) : "",
          companyId: task.companyId ?? "",
          dealId: task.dealId ?? "",
          contactId: task.contactId ?? ""
        }}
      />
    </div>
  );
}
