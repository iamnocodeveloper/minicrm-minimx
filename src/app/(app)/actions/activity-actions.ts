"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createActivity,
  deleteActivity,
} from "@/data/activities";
import { activitySchema } from "@/lib/validations/schemas";

const activitySaveSchema = activitySchema.extend({
  client_id: z.string().uuid(),
});

export async function createActivityAction(input: unknown) {
  const parsed = activitySaveSchema.parse(input);
  const created = await createActivity(parsed);
  revalidatePath(`/clients/${created.client_id}`);
  revalidatePath("/dashboard");
  revalidatePath("/activities");
  return { ok: true as const, activity: created };
}

export async function deleteActivityAction(id: string, clientId: string) {
  z.string().uuid().parse(id);
  z.string().uuid().parse(clientId);
  await deleteActivity(id);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
  revalidatePath("/activities");
  return { ok: true as const };
}
