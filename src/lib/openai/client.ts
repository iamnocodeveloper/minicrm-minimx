import "server-only";
import OpenAI from "openai";

/**
 * OpenAI client. Singleton, server-only.
 *
 * The OPENAI_API_KEY env var is required. It MUST NEVER be exposed to
 * the browser — never use NEXT_PUBLIC_* — and it MUST NEVER be sent
 * to client components. Place it in `.env.local` without any prefix:
 *
 *   OPENAI_API_KEY=sk-...
 *
 * Anything that imports from this module will be tree-shaken out of any
 * client bundle (because of the `import "server-only"` directive).
 */
let cached: OpenAI | null = null;

function getClient(): OpenAI {
  if (cached) return cached;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY não está configurada. Defina a variável de ambiente no servidor (.env.local)."
    );
  }
  cached = new OpenAI({ apiKey });
  return cached;
}

export interface FollowUpInput {
  clientName?: string;
  context: string;
  tone: "friendly" | "professional" | "direct";
  stage?: string;
}

export async function generateFollowUp(input: FollowUpInput): Promise<string> {
  const client = getClient();

  const systemPrompt = `Você é um SDR/closer brasileiro sênior escrevendo uma mensagem de follow-up para um lead real.
Regras:
- Use português do Brasil natural e educado.
- Seja conciso: 3 a 6 parágrafos curtos, com 1 CTA claro no final.
- Não mencione que você é uma IA ou que isto foi gerado por um sistema.
- Não use formatação exagerada, nem emojis em demasia. Use no máximo 1 emoji se apropriado.
- Considere o estágio do funil informado pelo usuário.
- Personalize a mensagem com o nome do cliente quando fornecido.
- Tom: ${input.tone}.
- Termine com uma chamada para ação específica (ex: agendar 15 min, enviar proposta, responder dúvida).`;

  const userPrompt = `Contexto da conversa/relação até agora:
"""
${input.context}
"""

${input.clientName ? `Nome do cliente: ${input.clientName}` : ""}
${input.stage ? `Estágio no funil: ${input.stage}` : ""}

Gere o follow-up agora.`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

export interface MeetingSummaryOutput {
  summary: string;
  key_points: string[];
  decisions: string[];
  objections: string[];
  next_actions: string[];
  suggested_tasks: { title: string; due_in_days: number }[];
}

export async function summarizeMeeting(transcript: string, clientName?: string): Promise<MeetingSummaryOutput> {
  const client = getClient();

  const systemPrompt = `Você resume reuniões comerciais em português do Brasil.
Responda SOMENTE em JSON válido com esta estrutura:
{
  "summary": "resumo curto em 2-4 frases",
  "key_points": ["ponto 1", "ponto 2", "..."],
  "decisions": ["decisão 1", "..."],
  "objections": ["objeção 1", "..."],
  "next_actions": ["ação 1", "..."],
  "suggested_tasks": [
    { "title": "título curto", "due_in_days": 3 }
  ]
}
Sem comentários extra, sem markdown, somente o JSON.`;

  const userPrompt = `Cliente: ${clientName ?? "(não informado)"}

Transcrição da reunião:
"""
${transcript}
"""

Responda com o JSON.`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: MeetingSummaryOutput;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Não foi possível interpretar a resposta da IA.");
  }
  // Defensive defaults
  return {
    summary: parsed.summary ?? "",
    key_points: Array.isArray(parsed.key_points) ? parsed.key_points : [],
    decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
    objections: Array.isArray(parsed.objections) ? parsed.objections : [],
    next_actions: Array.isArray(parsed.next_actions) ? parsed.next_actions : [],
    suggested_tasks: Array.isArray(parsed.suggested_tasks) ? parsed.suggested_tasks : [],
  };
}
