import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { meetingSummarySchema } from "@/lib/validations/schemas";
import { summarizeMeeting } from "@/lib/openai/client";
import { getSessionUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = meetingSummarySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  try {
    const result = await summarizeMeeting(parsed.data.transcript, parsed.data.clientName);
    return NextResponse.json({ summary: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha interna.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
