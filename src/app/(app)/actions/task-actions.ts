"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { taskSchema } from "@/lib/validations/schemas";
import {
  createTask,
  deleteTask,
  updateTask,
} from "@/data/tasks";

const taskSaveSchema = taskSchema.extend({
  client_id: z.string().uuid().optional(),
});

export async function createTaskAction(input: unknown) {
  const parsed = taskSaveSchema.parse(input);
  const created = await createTask({
    title: parsed.title,
    description: parsed.description ?? null,
    due_date: parsed.due_date ?? null,
    client_id: parsed.client_id ?? null,
  });
  revalidatePath("/dashboard");
  revalidatePath("/activities");
  if (created.client_id) revalidatePath(`/clients/${created.client_id}`);
  return { ok: true as const, task: created };
}

const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  completed: z.boolean().optional(),
  client_id: z.string().uuid().nullable().optional(),
});

export async function updateTaskAction(id: string, patch: unknown) {
  const parsed = updateTaskSchema.parse({ ...(patch as object), id });
  const updated = await updateTask(id, {
    title: parsed.title,
    description: parsed.description,
    due_date: parsed.due_date,
    completed: parsed.completed,
    client_id: parsed.client_id,
  });
  if (updated.client_id) revalidatePath(`/clients/${updated.client_id}`);
  revalidatePath("/dashboard");
  revalidatePath("/activities");
  return { ok: true as const, task: updated };
}

export async function deleteTaskAction(id: string, clientId?: string | null) {
  z.string().uuid().parse(id);
  await deleteTask(id);
  if (clientId) revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
  revalidatePath("/activities");
  return { ok: true as const };
}
