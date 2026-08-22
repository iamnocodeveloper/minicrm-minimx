/**
 * Browser-side InsForge client.
 *
 * Uses @insforge/sdk/ssr → createBrowserClient which:
 *   - reads the access-token cookie for Database / Storage / Realtime auth
 *   - silently refreshes the session through /api/auth/refresh when needed
 *   - exposes a READ-ONLY auth surface (getCurrentUser, getProfile, getPublicAuthConfig)
 *
 * Sign-in / sign-up / sign-out are intentionally NOT exposed here.
 * Use `createAuthActions()` in a Server Action / Route Handler instead so the
 * httpOnly refresh cookie can be written by the server.
 */
import { createBrowserClient } from "@insforge/sdk/ssr";

export function createInsForgeBrowserClient() {
  return createBrowserClient();
}
