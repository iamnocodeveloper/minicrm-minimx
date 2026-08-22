"use server";

import { revalidatePath } from "next/cache";
import { clearDemoData, seedDemoData } from "@/data/demo";

export async function seedDemoDataAction() {
  const result = await seedDemoData();
  revalidatePath("/dashboard");
  revalidatePath("/clients");
  revalidatePath("/pipeline");
  revalidatePath("/activities");
  return { ok: true as const, ...result };
}

export async function clearDemoDataAction() {
  const result = await clearDemoData();
  revalidatePath("/dashboard");
  revalidatePath("/clients");
  revalidatePath("/pipeline");
  revalidatePath("/activities");
  return { ok: true as const, ...result };
}
