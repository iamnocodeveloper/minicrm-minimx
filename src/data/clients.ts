import "server-only";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import type { Client, PipelineStatusKey, PriorityKey } from "@/types/domain";

export interface ClientInput {
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  value?: number | null;
  status: PipelineStatusKey;
  priority: PriorityKey;
  source?: string | null;
  notes?: string | null;
}

export async function listClients(): Promise<Client[]> {
  const ins = await createInsForgeServerClient();
  const { data, error } = await ins.database
    .from("clients")
    .select("id, user_id, name, company, email, phone, value, status, priority, source, notes, created_at, updated_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(500);
  if (error) throw new Error(`Falha ao listar clientes: ${error.message}`);
  return (data ?? []) as Client[];
}

export async function getClient(id: string): Promise<Client | null> {
  const ins = await createInsForgeServerClient();
  const { data, error } = await ins.database
    .from("clients")
    .select("id, user_id, name, company, email, phone, value, status, priority, source, notes, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Falha ao buscar cliente: ${error.message}`);
  return (data as Client | null) ?? null;
}

export async function createClient(input: ClientInput): Promise<Client> {
  const ins = await createInsForgeServerClient();
  const { data, error } = await ins.database
    .from("clients")
    .insert([
      {
        name: input.name,
        company: input.company ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        value: input.value ?? null,
        status: input.status,
        priority: input.priority,
        source: input.source ?? null,
        notes: input.notes ?? null,
      },
    ])
    .select(
      "id, user_id, name, company, email, phone, value, status, priority, source, notes, created_at, updated_at"
    )
    .single();
  if (error) throw new Error(`Falha ao criar cliente: ${error.message}`);
  return data as Client;
}

export async function updateClient(id: string, patch: Partial<ClientInput>): Promise<Client> {
  const ins = await createInsForgeServerClient();
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) update[k] = v;
  update.updated_at = new Date().toISOString();
  const { data, error } = await ins.database
    .from("clients")
    .update(update)
    .eq("id", id)
    .select(
      "id, user_id, name, company, email, phone, value, status, priority, source, notes, created_at, updated_at"
    )
    .single();
  if (error) throw new Error(`Falha ao atualizar cliente: ${error.message}`);
  return data as Client;
}

export async function updateClientStatus(
  id: string,
  status: PipelineStatusKey
): Promise<Client> {
  return updateClient(id, { status });
}

export async function deleteClient(id: string): Promise<void> {
  const ins = await createInsForgeServerClient();
  const { error } = await ins.database.from("clients").delete().eq("id", id);
  if (error) throw new Error(`Falha ao excluir cliente: ${error.message}`);
}

export async function getClientMetrics(): Promise<{
  totalRevenue: number;
  activeLeads: number;
  avgTicket: number;
  conversionRate: number;
  statusCounts: Record<PipelineStatusKey, number>;
  revenueByMonth: { month: string; value: number }[];
}> {
  const clients = await listClients();

  const revenueCandidates = clients.filter((c) => c.status === "fechado");
  const totalRevenue = revenueCandidates.reduce(
    (acc, c) => acc + (Number(c.value) || 0),
    0
  );
  const activeLeads = clients.filter((c) => c.status !== "fechado").length;
  const avgTicket = clients.length
    ? clients.reduce((acc, c) => acc + (Number(c.value) || 0), 0) / clients.length
    : 0;

  const statusCounts: Record<PipelineStatusKey, number> = {
    novo_lead: 0,
    contato: 0,
    proposta: 0,
    negociacao: 0,
    fechado: 0,
  };
  for (const c of clients) statusCounts[c.status] = (statusCounts[c.status] ?? 0) + 1;

  const total = clients.length;
  const conversionRate = total ? (statusCounts.fechado / total) * 100 : 0;

  // Last 6 months revenue from created_at of "fechado" clients
  const buckets = new Map<string, number>();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, 0);
  }
  for (const c of revenueCandidates) {
    const d = new Date(c.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + (Number(c.value) || 0));
    }
  }
  const revenueByMonth = Array.from(buckets.entries()).map(([k, v]) => {
    const [yearStr, monthStr] = k.split("-");
    const monthIdx = parseInt(monthStr, 10) - 1;
    const label = new Date(parseInt(yearStr, 10), monthIdx, 1).toLocaleDateString(
      "pt-BR",
      { month: "short" }
    );
    return { month: label.replace(".", ""), value: v };
  });

  return {
    totalRevenue,
    activeLeads,
    avgTicket,
    conversionRate,
    statusCounts,
    revenueByMonth,
  };
}
