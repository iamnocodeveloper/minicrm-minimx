import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { followUpSchema } from "@/lib/validations/schemas";
import { generateFollowUp } from "@/lib/openai/client";
import { getSessionUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Auth gate — never run AI without a signed-in user.
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

  const parsed = followUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  try {
    const stage = (request.headers.get("x-stage") ?? undefined) || undefined;
    const result = await generateFollowUp({
      context: parsed.data.context,
      tone: parsed.data.tone,
      clientName: parsed.data.clientName,
      stage,
    });
    return NextResponse.json({ message: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha interna.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
