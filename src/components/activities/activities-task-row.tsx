"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Circle, CalendarDays } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { updateTaskAction, deleteTaskAction } from "@/app/(app)/actions/task-actions";
import type { Task } from "@/types/domain";

export type ClientTask = Task & { client?: { name: string } | null };

export function ActivitiesTaskRow({
  task,
  onChange,
}: {
  task: ClientTask;
  onChange: (
    updater: ClientTask[] | ((prev: ClientTask[]) => ClientTask[])
  ) => void;
}) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      try {
        const res = await updateTaskAction(task.id, { completed: !task.completed });
        onChange((prev) =>
          prev.map((t) =>
            t.id === task.id ? ({ ...t, ...(res.task as ClientTask) } as ClientTask) : t
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao atualizar.";
        toast.error(message);
      }
    });
  }

  function remove() {
    startTransition(async () => {
      try {
        await deleteTaskAction(task.id, task.client_id);
        onChange((prev) => prev.filter((t) => t.id !== task.id));
        toast.success("Tarefa removida.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao excluir.";
        toast.error(message);
      }
    });
  }

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border bg-card/60 p-3",
        task.completed && "opacity-60"
      )}
    >
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className="mt-0.5 text-muted-foreground hover:text-primary disabled:opacity-50"
        aria-label={task.completed ? "Reabrir" : "Concluir"}
      >
        {task.completed ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium", task.completed && "line-through")}>
          {task.title}
        </p>
        {task.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {task.description}
          </p>
        ) : null}
        <p className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          {task.due_date ? (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" /> {formatDate(task.due_date)}
            </span>
          ) : null}
          {task.client?.name ? (
            <Link href={`/clients/${task.client_id}`} className="text-primary hover:underline">
              {task.client.name}
            </Link>
          ) : null}
        </p>
      </div>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="rounded-md p-1 text-xs text-muted-foreground hover:text-danger"
      >
        Excluir
      </button>
    </li>
  );
}
