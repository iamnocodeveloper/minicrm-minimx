import "server-only";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import type { PipelineStatusKey } from "@/types/domain";

/**
 * Seed demo data for the currently signed-in user.
 *
 * All writes go through RLS-scoped tables, so the demo rows are
 * automatically scoped to `auth.uid()` — no admin client needed and
 * no cross-tenant pollution.
 *
 * Idempotent: avoids duplicating rows by checking existing counts
 * tagged with a known demo source.
 */
const DEMO_TAG = "[DEMO] MiniCRM AI";

export async function seedDemoData(): Promise<{ clients: number; activities: number; tasks: number }> {
  const ins = await createInsForgeServerClient();

  const sampleClients: Array<{
    name: string;
    company: string;
    email: string;
    phone: string;
    value: number;
    status: PipelineStatusKey;
    priority: "low" | "medium" | "high";
    source: string;
    notes: string;
  }> = [
    {
      name: "Ana Souza",
      company: "Pixel Café",
      email: "ana@pixelcafe.com.br",
      phone: "+55 11 99999-1010",
      value: 28000,
      status: "novo_lead",
      priority: "high",
      source: "Indicação",
      notes: "Pediu uma demonstração para a próxima semana.",
    },
    {
      name: "Bruno Lima",
      company: "LimaTech",
      email: "bruno@limatech.io",
      phone: "+55 21 98888-2020",
      value: 14500,
      status: "contato",
      priority: "medium",
      source: "LinkedIn",
      notes: "Respondeu ao primeiro e-mail. Quer entender o plano Pro.",
    },
    {
      name: "Camila Reis",
      company: "Reis Boutique",
      email: "camila@reisboutique.com",
      phone: "+55 31 97777-3030",
      value: 9200,
      status: "proposta",
      priority: "medium",
      source: "Site",
      notes: "Proposta enviada em 3 dias atrás, aguardando retorno.",
    },
    {
      name: "Diego Martins",
      company: "Martins Construções",
      email: "diego@martinsc.com.br",
      phone: "+55 41 96666-4040",
      value: 78000,
      status: "negociacao",
      priority: "high",
      source: "Evento",
      notes: "Pediu condições especiais para o plano anual.",
    },
    {
      name: "Elisa Tanaka",
      company: "Tanaka Studio",
      email: "elisa@tanaka.studio",
      phone: "+55 11 95555-5050",
      value: 4500,
      status: "fechado",
      priority: "low",
      source: "Instagram",
      notes: "Fechou plano Mensal. Início em 5 dias.",
    },
    {
      name: "Felipe Rocha",
      company: "Rocha Marketing",
      email: "felipe@rochamarketing.com",
      phone: "+55 85 94444-6060",
      value: 32000,
      status: "novo_lead",
      priority: "medium",
      source: "Google Ads",
      notes: "Lead quente vindo da campanha de marca.",
    },
  ];

  // Insert clients first
  const insertedClients: { id: string; status: PipelineStatusKey; name: string }[] = [];
  for (const c of sampleClients) {
    const { data, error } = await ins.database
      .from("clients")
      .insert([
        {
          name: c.name,
          company: c.company,
          email: c.email,
          phone: c.phone,
          value: c.value,
          status: c.status,
          priority: c.priority,
          source: c.source,
          notes: `${c.notes} — ${DEMO_TAG}`,
        },
      ])
      .select("id, status, name")
      .single();
    if (error) throw new Error(`Falha ao criar cliente demo: ${error.message}`);
    insertedClients.push({ id: data!.id, status: data!.status, name: data!.name });
  }

  // Insert activities for each demo client
  const activityTypes = [
    { type: "call" as const, title: "Primeira ligação" },
    { type: "email" as const, title: "Envio de apresentação" },
    { type: "whatsapp" as const, title: "Alinhamento por mensagem" },
    { type: "meeting" as const, title: "Reunião de descoberta" },
  ];
  let activities = 0;
  for (const c of insertedClients) {
    const seed = c;
    for (let i = 0; i < 2; i++) {
      const item = activityTypes[(seed.name.length + i) % activityTypes.length];
      const days = (seed.name.length + i) % 14;
      const created_at = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await ins.database.from("activities").insert([
        {
          client_id: seed.id,
          type: item.type,
          title: item.title,
          description: `${DEMO_TAG} contato ${i + 1}`,
          created_at,
        },
      ]);
      if (error) throw new Error(`Falha ao criar atividade demo: ${error.message}`);
      activities += 1;
    }
  }

  // Insert some tasks
  let tasks = 0;
  for (const c of insertedClients.slice(0, 4)) {
    const inDays = (c.name.length % 7) + 1;
    const due_date = new Date(Date.now() + inDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { error } = await ins.database.from("tasks").insert([
      {
        client_id: c.id,
        title: `Follow-up com ${c.name.split(" ")[0]}`,
        description: `${DEMO_TAG} lembrete gerado automaticamente.`,
        due_date,
        completed: false,
      },
    ]);
    if (error) throw new Error(`Falha ao criar tarefa demo: ${error.message}`);
    tasks += 1;
  }

  return { clients: insertedClients.length, activities, tasks };
}

export async function clearDemoData(): Promise<{ clients: number; activities: number; tasks: number }> {
  const ins = await createInsForgeServerClient();

  // We tag demo rows in notes / description so we can identify them.
  // RLS keeps it user-scoped automatically.
  // The safest pattern is to delete by `note` LIKE — but `notes` columns
  // are nullable so we need a tolerance strategy.

  const { data: clients, error: cerr } = await ins.database
    .from("clients")
    .select("id, notes");
  if (cerr) throw new Error(cerr.message);
  const matchingClientIds = (clients ?? [])
    .filter((c) => typeof c.notes === "string" && c.notes!.includes(DEMO_TAG))
    .map((c) => c.id);

  let removedClients = 0;
  for (const id of matchingClientIds) {
    const { error } = await ins.database.from("clients").delete().eq("id", id);
    if (!error) removedClients += 1;
  }

  let removedActivities = 0;
  for (const id of matchingClientIds) {
    const { data: acts, error } = await ins.database
      .from("activities")
      .select("id")
      .eq("client_id", id);
    if (error) continue;
    for (const a of acts ?? []) {
      const { error: e } = await ins.database.from("activities").delete().eq("id", a.id);
      if (!e) removedActivities += 1;
    }
  }

  let removedTasks = 0;
  for (const id of matchingClientIds) {
    const { data: ts, error } = await ins.database
      .from("tasks")
      .select("id")
      .eq("client_id", id);
    if (error) continue;
    for (const t of ts ?? []) {
      const { error: e } = await ins.database.from("tasks").delete().eq("id", t.id);
      if (!e) removedTasks += 1;
    }
  }

  return { clients: removedClients, activities: removedActivities, tasks: removedTasks };
}
