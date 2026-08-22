import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Informe seu e-mail.")
  .email("E-mail inválido.");

export const passwordSchema = z
  .string()
  .min(8, "Sua senha deve ter pelo menos 8 caracteres.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe sua senha."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome completo."),
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem.",
    path: ["confirm"],
  });

export const clientSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do cliente."),
  company: z.string().trim().max(120).optional().or(z.literal("")).transform((v) => (v ? v : null)),
  email: z
    .string()
    .trim()
    .email("E-mail inválido.")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  phone: z
    .string()
    .trim()
    .max(40, "Telefone muito longo.")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  value: z
    .number({ message: "Informe um número válido." })
    .min(0, "O valor não pode ser negativo.")
    .nullable()
    .optional()
    .transform((v) => (v == null ? null : v)),
  status: z.enum(["novo_lead", "contato", "proposta", "negociacao", "fechado"]),
  priority: z.enum(["low", "medium", "high"]),
  source: z
    .string()
    .trim()
    .max(80)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});

export type ClientFormInput = z.infer<typeof clientSchema>;

export const activitySchema = z.object({
  type: z.enum(["call", "email", "meeting", "whatsapp", "note"]),
  title: z.string().trim().min(2, "Informe um título."),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});

export type ActivityFormInput = z.infer<typeof activitySchema>;

export const taskSchema = z.object({
  title: z.string().trim().min(2, "Informe um título."),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  due_date: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  client_id: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});

export type TaskFormInput = z.infer<typeof taskSchema>;

/** AI — Follow-up generator input */
export const followUpSchema = z.object({
  context: z.string().trim().max(4000).min(20, "Descreva pelo menos o contexto da conversa."),
  tone: z.enum(["friendly", "professional", "direct"]).default("professional"),
  clientName: z.string().trim().max(120).optional().or(z.literal("")),
});

/** AI — Meeting summarizer input */
export const meetingSummarySchema = z.object({
  transcript: z.string().trim().min(80, "Cole a transcrição da reunião."),
  clientName: z.string().trim().max(120).optional().or(z.literal("")),
});
