import "server-only";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import type { Task } from "@/types/domain";

export interface TaskInput {
  title: string;
  description?: string | null;
  due_date?: string | null;
  client_id?: string | null;
}

export async function listTasksForClient(clientId: string): Promise<Task[]> {
  const ins = await createInsForgeServerClient();
  const { data, error } = await ins.database
    .from("tasks")
    .select("id, user_id, client_id, title, description, due_date, completed, created_at")
    .eq("client_id", clientId)
    .order("due_date", { ascending: true });
  if (error) throw new Error(`Falha ao listar tarefas: ${error.message}`);
  return (data ?? []) as Task[];
}

export async function listUpcomingTasks(limit = 8): Promise<(Task & { client?: { name: string } | null })[]> {
  const ins = await createInsForgeServerClient();
  const { data, error } = await ins.database
    .from("tasks")
    .select("id, user_id, client_id, title, description, due_date, completed, created_at, clients(name)")
    .eq("completed", false)
    .order("due_date", { ascending: true })
    .limit(limit);
  if (error) throw new Error(`Falha ao listar tarefas: ${error.message}`);
  return (data ?? []) as (Task & { client?: { name: string } | null })[];
}

export async function listAllTasks(): Promise<(Task & { client?: { name: string } | null })[]> {
  const ins = await createInsForgeServerClient();
  const { data, error } = await ins.database
    .from("tasks")
    .select("id, user_id, client_id, title, description, due_date, completed, created_at, clients(name)")
    .order("due_date", { ascending: true });
  if (error) throw new Error(`Falha ao listar tarefas: ${error.message}`);
  return (data ?? []) as (Task & { client?: { name: string } | null })[];
}

export async function createTask(input: TaskInput): Promise<Task> {
  const ins = await createInsForgeServerClient();
  const { data, error } = await ins.database
    .from("tasks")
    .insert([
      {
        title: input.title,
        description: input.description ?? null,
        due_date: input.due_date ?? null,
        client_id: input.client_id ?? null,
      },
    ])
    .select("id, user_id, client_id, title, description, due_date, completed, created_at")
    .single();
  if (error) throw new Error(`Falha ao criar tarefa: ${error.message}`);
  return data as Task;
}

export async function updateTask(id: string, patch: Partial<TaskInput & { completed: boolean }>): Promise<Task> {
  const ins = await createInsForgeServerClient();
  const { data, error } = await ins.database
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .select("id, user_id, client_id, title, description, due_date, completed, created_at")
    .single();
  if (error) throw new Error(`Falha ao atualizar tarefa: ${error.message}`);
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const ins = await createInsForgeServerClient();
  const { error } = await ins.database.from("tasks").delete().eq("id", id);
  if (error) throw new Error(`Falha ao excluir tarefa: ${error.message}`);
}
