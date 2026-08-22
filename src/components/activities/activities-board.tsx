"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, CheckCircle2, Circle, CalendarClock, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import {
  ACTIVITY_TYPE_LABEL,
  type Activity,
  type ActivityTypeKey,
  type Task,
} from "@/types/domain";
import { formatDate, relativeTime, cn } from "@/lib/utils";
import { ActivitiesTaskRow } from "./activities-task-row";

const TYPES: ActivityTypeKey[] = ["call", "email", "meeting", "whatsapp", "note"];

export function ActivitiesBoard({
  initialActivities,
  initialTasks,
}: {
  initialActivities: (Activity & { client?: { name: string } })[];
  initialTasks: (Task & { client?: { name: string } | null })[];
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ActivityTypeKey | "all">("all");
  const [tab, setTab] = useState<"activities" | "tasks">("activities");
  const [tasks, setTasks] = useState(initialTasks);

  const activities = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialActivities.filter((a) => {
      const matchType = type === "all" || a.type === type;
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q) ||
        (a.client?.name ?? "").toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [initialActivities, search, type]);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.client?.name ?? "").toLowerCase().includes(q);
      return matchSearch;
    });
  }, [tasks, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, título, descrição..."
            className="pl-9"
          />
        </div>
        {tab === "activities" ? (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setType("all")}
              className={cn(
                "rounded-full border border-border px-3 py-1 text-xs transition",
                type === "all"
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Todos
            </button>
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "rounded-full border border-border px-3 py-1 text-xs transition",
                  type === t
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {ACTIVITY_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex gap-1 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("activities")}
          className={cn(
            "px-3 py-2 text-sm font-medium transition",
            tab === "activities"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Atividades ({initialActivities.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("tasks")}
          className={cn(
            "px-3 py-2 text-sm font-medium transition",
            tab === "tasks"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Tarefas ({tasks.length})
        </button>
      </div>

      {tab === "activities" ? (
        activities.length === 0 ? (
          <EmptyState
            icon={<CalendarClock className="h-6 w-6" />}
            title="Nenhuma atividade encontrada"
            description="Tente ajustar os filtros ou criar uma nova atividade."
          />
        ) : (
          <ul className="space-y-2">
            {activities.map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-3"
              >
                <Badge variant="muted">{ACTIVITY_TYPE_LABEL[a.type]}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  {a.description ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {a.description}
                    </p>
                  ) : null}
                  {a.client?.name ? (
                    <Link
                      href={`/clients/${a.client_id}`}
                      className="mt-1 inline-block text-xs text-primary hover:underline"
                    >
                      {a.client.name}
                    </Link>
                  ) : null}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {relativeTime(a.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<ListTodo className="h-6 w-6" />}
          title="Nenhuma tarefa"
          description="Crie tarefas a partir do perfil do cliente."
        />
      ) : (
        <ul className="space-y-2">
          {filteredTasks.map((t) => (
            <ActivitiesTaskRow key={t.id} task={t} onChange={setTasks} />
          ))}
        </ul>
      )}
    </div>
  );
}
