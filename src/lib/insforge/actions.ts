/**
 * Auth Server Actions / API helpers.
 *
 * Auth mutations (sign-in, sign-up, sign-out, OAuth, ID-token,
 * verification) MUST run on the server where cookies can be written
 * (httpOnly refresh token). This module exposes them as Server Actions.
 */
"use server";

import { cookies } from "next/headers";
import { createAuthActions } from "@insforge/sdk/ssr";

async function actions() {
  return createAuthActions({ cookies: await cookies() });
}

export type AuthResult = { user: { id: string; email: string } | null; error: string | null };

export async function signInAction(form: FormData): Promise<AuthResult> {
  const auth = await actions();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) {
    return { user: null, error: "Informe e-mail e senha." };
  }
  const { data, error } = await auth.signInWithPassword({ email, password });
  if (error || !data?.user) {
    return { user: null, error: error?.message ?? "Não foi possível entrar." };
  }
  return { user: { id: data.user.id, email: data.user.email }, error: null };
}

export async function signUpAction(form: FormData): Promise<AuthResult> {
  const auth = await actions();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const name = String(form.get("name") ?? "").trim();
  if (!email || !password || !name) {
    return { user: null, error: "Preencha nome, e-mail e senha." };
  }
  if (password.length < 8) {
    return { user: null, error: "Sua senha deve ter pelo menos 8 caracteres." };
  }
  const { data, error } = await auth.signUp({
    email,
    password,
    name,
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || ""}/login`,
  });
  if (error) {
    return { user: null, error: error.message };
  }
  // If verification is not required, the user is already signed in.
  if (data?.user) {
    return { user: { id: data.user.id, email: data.user.email }, error: null };
  }
  return {
    user: null,
    error:
      "Conta criada! Verifique seu e-mail para confirmar o cadastro e então faça login.",
  };
}

export async function signOutAction(): Promise<{ error: string | null }> {
  const auth = await actions();
  const result = await auth.signOut();
  return { error: result?.error?.message ?? null };
}
