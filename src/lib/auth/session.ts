import "server-only";
import { createInsForgeServerClient } from "@/lib/insforge/server";

/**
 * Lightweight helper for Server Components: returns the current user
 * (or null when no session cookie is present). Goes through the SSR
 * server client which reads the access-token cookie.
 */
export async function getSessionUser(): Promise<{ id: string; email: string; name?: string } | null> {
  const ins = await createInsForgeServerClient();
  const { data, error } = await ins.auth.getCurrentUser();
  if (error || !data?.user) return null;
  const u = data.user;
  return { id: u.id, email: u.email, name: (u as { name?: string }).name ?? undefined };
}
