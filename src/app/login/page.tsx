"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAction } from "@/lib/insforge/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Sparkles, Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const form = new FormData();
    form.set("email", email);
    form.set("password", password);

    startTransition(async () => {
      const result = await signInAction(form);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Bem-vindo de volta!");
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <div className="relative grid min-h-screen w-full place-items-center overflow-hidden px-4 py-10">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/20 neon-border">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xl font-semibold">MiniCRM AI</p>
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-foreground">
            Seu <span className="gradient-text">pipeline</span>, seus leads,
            <br />
            e a IA fechando deals por você.
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            CRM premium com Kanban, dashboard, atividades, tarefas e
            follow-ups gerados por inteligência artificial em segundos.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              "Pipeline visual",
              "Métricas em tempo real",
              "Follow-up com IA",
              "Resumo de reuniões",
            ].map((f) => (
              <div
                key={f}
                className="rounded-xl border border-border bg-card/60 p-3 text-sm backdrop-blur"
              >
                <div className="h-1.5 w-8 rounded-full bg-primary/70" />
                <p className="mt-2 text-foreground">{f}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full">
          <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-2xl glass rise">
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/20 neon-border">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <p className="text-lg font-semibold">MiniCRM AI</p>
            </div>
            <h2 className="text-2xl font-semibold">Entrar na sua conta</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use seu e-mail e senha para acessar o workspace.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <FormField label="E-mail" htmlFor="email">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@empresa.com"
                    className="pl-9"
                  />
                </div>
              </FormField>

              <FormField label="Senha" htmlFor="password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="pl-9"
                  />
                </div>
              </FormField>

              {error ? (
                <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                  <AlertCircle className="mt-0.5 h-4 w-4" />
                  <span>{error}</span>
                </div>
              ) : null}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Entrando..." : "Entrar"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Ainda não tem conta?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Criar conta
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
