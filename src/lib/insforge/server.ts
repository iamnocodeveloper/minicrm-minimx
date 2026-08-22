/**
 * Server-side InsForge client (for Server Components, Server Actions,
 * Route Handlers). Reads only the access-token cookie and forwards it as
 * the per-request bearer token so that database queries are scoped to
 * the authenticated user via RLS.
 */
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

export async function createInsForgeServerClient() {
  return createServerClient({
    cookies: await cookies(),
  });
}
