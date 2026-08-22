import { listAllActivities } from "@/data/activities";
import { listAllTasks } from "@/data/tasks";
import { ActivitiesBoard } from "@/components/activities/activities-board";

export default async function ActivitiesPage() {
  const [activities, tasks] = await Promise.all([
    listAllActivities(),
    listAllTasks(),
  ]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Atividades</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Todas as atividades e tarefas dos seus clientes.
        </p>
      </header>
      <ActivitiesBoard initialActivities={activities} initialTasks={tasks} />
    </div>
  );
}
