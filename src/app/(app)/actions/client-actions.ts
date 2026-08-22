"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, updateClient, deleteClient, updateClientStatus } from "@/data/clients";
import { clientSchema } from "@/lib/validations/schemas";

const idSchema = z.object({ id: z.string().uuid() });

export async function createClientAction(input: unknown) {
  const parsed = clientSchema.parse(input);
  const created = await createClient(parsed);
  revalidatePath("/dashboard");
  revalidatePath("/clients");
  revalidatePath("/pipeline");
  return { ok: true as const, client: created };
}

export async function updateClientAction(id: string, input: unknown) {
  idSchema.parse({ id });
  const parsed = clientSchema.parse(input);
  const updated = await updateClient(id, parsed);
  revalidatePath(`/clients/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/clients");
  revalidatePath("/pipeline");
  return { ok: true as const, client: updated };
}

export async function updateClientStatusAction(id: string, status: unknown) {
  idSchema.parse({ id });
  const next = z.enum(["novo_lead", "contato", "proposta", "negociacao", "fechado"]).parse(status);
  const updated = await updateClientStatus(id, next);
  revalidatePath("/dashboard");
  revalidatePath("/clients");
  revalidatePath("/pipeline");
  revalidatePath(`/clients/${id}`);
  return { ok: true as const, client: updated };
}

export async function deleteClientAction(id: string) {
  idSchema.parse({ id });
  await deleteClient(id);
  revalidatePath("/dashboard");
  revalidatePath("/clients");
  revalidatePath("/pipeline");
  revalidatePath("/activities");
  return { ok: true as const };
}
