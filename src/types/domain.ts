/**
 * Domain types mirroring the PostgreSQL schema in supabase/migrations/.
 * Keep these in sync with the actual SQL columns.
 */

export type PipelineStatusKey =
  | "novo_lead"
  | "contato"
  | "proposta"
  | "negociacao"
  | "fechado";

export const PIPELINE_STATUS_LABEL: Record<PipelineStatusKey, string> = {
  novo_lead: "Novo Lead",
  contato: "Contato",
  proposta: "Proposta",
  negociacao: "Negociação",
  fechado: "Fechado",
};

export const PIPELINE_FLOW: PipelineStatusKey[] = [
  "novo_lead",
  "contato",
  "proposta",
  "negociacao",
  "fechado",
];

export type PriorityKey = "low" | "medium" | "high";
export const PRIORITY_LABEL: Record<PriorityKey, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export type ActivityTypeKey = "call" | "email" | "meeting" | "whatsapp" | "note";
export const ACTIVITY_TYPE_LABEL: Record<ActivityTypeKey, string> = {
  call: "Chamada",
  email: "E-mail",
  meeting: "Reunião",
  whatsapp: "WhatsApp",
  note: "Nota",
};

export interface Client {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  value: number | null;
  status: PipelineStatusKey;
  priority: PriorityKey;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  client_id: string;
  type: ActivityTypeKey;
  title: string;
  description: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  user_id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  name?: string | null;
}
