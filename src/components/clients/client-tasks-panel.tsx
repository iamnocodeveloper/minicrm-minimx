"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  Circle,
  Pencil,
  Plus,
  Trash2,
  CalendarDays,
  ListTodo,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, EmptyState } from "@/components/ui/form-field";
import { formatDate, cn } from "@/lib/utils";
import { createTaskAction, deleteTaskAction, updateTaskAction } from "@/app/(app)/actions/task-actions";
import type { Task } from "@/types/domain";

export function ClientTasksPanel({
  clientId,
  initial,
}: {
  clientId: string;
  initial: Task[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [pending, startTransition] = useTransition();

  function reset() {
    setTitle("");
    setDescription("");
    setDueDate("");
    setEditing(null);
  }

  function openCreate() {
    reset();
    setOpen(true);
  }

  function openEdit(t: Task) {
    setEditing(t);
    setTitle(t.title);
    setDescription(t.description ?? "");
    setDueDate(t.due_date ? t.due_date.slice(0, 10) : "");
    setOpen(true);
  }

  function handleSubmit() {
    if (title.trim().length < 2) {
      toast.error("Informe um título com pelo menos 2 caracteres.");
      return;
    }
    startTransition(async () => {
      try {
        if (editing) {
          const res = await updateTaskAction(editing.id, {
            title: title.trim(),
            description: description.trim() || null,
            due_date: dueDate || null,
          });
          setTasks((prev) => prev.map((t) => (t.id === editing.id ? res.task : t)));
          toast.success("Tarefa atualizada.");
        } else {
          const res = await createTaskAction({
            client_id: clientId,
            title: title.trim(),
            description: description.trim() || "",
            due_date: dueDate || "",
          });
          setTasks((prev) => [...prev, res.task]);
          toast.success("Tarefa criada.");
        }
        setOpen(false);
        reset();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Não foi possível salvar.";
        toast.error(message);
      }
    });
  }

  function toggleCompleted(t: Task) {
    startTransition(async () => {
      try {
        const res = await updateTaskAction(t.id, { completed: !t.completed });
        setTasks((prev) => prev.map((x) => (x.id === t.id ? res.task : x)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao atualizar.";
        toast.error(message);
      }
    });
  }

  function handleDelete(t: Task) {
    startTransition(async () => {
      try {
        await deleteTaskAction(t.id, t.client_id);
        setTasks((prev) => prev.filter((x) => x.id !== t.id));
        toast.success("Tarefa removida.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao excluir.";
        toast.error(message);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Tarefas</CardTitle>
        <Button size="sm" variant="outline" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nova tarefa
        </Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <EmptyState
            icon={<ListTodo className="h-6 w-6" />}
            title="Nenhuma tarefa para este cliente."
            description="Crie lembretes e follow-ups para manter a cadência."
          />
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl border border-border bg-card/50 p-3 transition",
                  t.completed && "opacity-60"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleCompleted(t)}
                  className="mt-0.5 text-muted-foreground hover:text-primary disabled:opacity-50"
                  disabled={pending}
                  aria-label={t.completed ? "Reabrir" : "Concluir"}
                >
                  {t.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      t.completed && "line-through"
                    )}
                  >
                    {t.title}
                  </p>
                  {t.description ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  ) : null}
                  {t.due_date ? (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <CalendarDays className="h-3 w-3" /> Até {formatDate(t.due_date)}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/15 hover:text-danger"
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          reset();
        }}
        title={editing ? "Editar tarefa" : "Nova tarefa"}
      >
        <div className="space-y-4">
          <FormField label="Título">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Enviar proposta revisada"
            />
          </FormField>
          <FormField label="Descrição">
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contexto, links, observações..."
            />
          </FormField>
          <FormField label="Prazo">
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={pending}>
              {pending ? "Salvando..." : editing ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
