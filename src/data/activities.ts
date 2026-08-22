import "server-only";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import type { Activity, ActivityTypeKey } from "@/types/domain";

export interface ActivityInput {
  client_id: string;
  type: ActivityTypeKey;
  title: string;
  description?: string | null;
}

export async function listActivitiesForClient(clientId: string): Promise<Activity[]> {
  const ins = await createInsForgeServerClient();
  const { data, error } = await ins.database
    .from("activities")
    .select("id, user_id, client_id, type, title, description, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Falha ao listar atividades: ${error.message}`);
  return (data ?? []) as Activity[];
}

export async function listRecentActivities(limit = 6): Promise<(Activity & { client?: { name: string } })[]> {
  const ins = await createInsForgeServerClient();
  const { data, error } = await ins.database
    .from("activities")
    .select("id, user_id, client_id, type, title, description, created_at, clients(name)")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Falha ao listar atividades: ${error.message}`);
  return (data ?? []) as (Activity & { client?: { name: string } })[];
}

export async function listAllActivities(): Promise<(Activity & { client?: { name: string } })[]> {
  const ins = await createInsForgeServerClient();
  const { data, error } = await ins.database
    .from("activities")
    .select("id, user_id, client_id, type, title, description, created_at, clients(name)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(`Falha ao listar atividades: ${error.message}`);
  return (data ?? []) as (Activity & { client?: { name: string } })[];
}

export async function createActivity(input: ActivityInput): Promise<Activity> {
  const ins = await createInsForgeServerClient();
  const { data, error } = await ins.database
    .from("activities")
    .insert([
      {
        client_id: input.client_id,
        type: input.type,
        title: input.title,
        description: input.description ?? null,
      },
    ])
    .select("id, user_id, client_id, type, title, description, created_at")
    .single();
  if (error) throw new Error(`Falha ao criar atividade: ${error.message}`);
  return data as Activity;
}

export async function deleteActivity(id: string): Promise<void> {
  const ins = await createInsForgeServerClient();
  const { error } = await ins.database.from("activities").delete().eq("id", id);
  if (error) throw new Error(`Falha ao excluir atividade: ${error.message}`);
}
