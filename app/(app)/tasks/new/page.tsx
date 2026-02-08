import { TaskForm } from "../components/task-form";

export default function NewTaskPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">New task</p>
        <h1 className="text-3xl font-semibold text-mab-navy">Create a momentum action</h1>
        <p className="mt-2 text-sm text-mab-slate">
          Schedule the next best action and keep the engagement cadence tight.
        </p>
      </header>
      <TaskForm />
    </div>
  );
}
