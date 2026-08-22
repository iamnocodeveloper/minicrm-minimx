"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/lib/insforge/actions";
import { registerSchema } from "@/lib/validations/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Sparkles, Mail, Lock, User2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse({ name, email, password, confirm });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Verifique os campos.");
      return;
    }

    const form = new FormData();
    form.set("name", parsed.data.name);
    form.set("email", parsed.data.email);
    form.set("password", parsed.data.password);

    startTransition(async () => {
      const result = await signUpAction(form);
      if (result.error && result.user == null) {
        setError(result.error);
        if (!result.error.includes("Verifique seu e-mail")) toast.error(result.error);
        else toast.info(result.error);
        return;
      }
      if (result.user) {
        toast.success("Conta criada!");
        router.push("/dashboard");
        router.refresh();
      } else {
        // Verification flow required — push to login.
        router.push("/login");
      }
    });
  }

  return (
    <div className="relative grid min-h-screen w-full place-items-center overflow-hidden px-4 py-10">
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
            Comece agora e veja seu <span className="gradient-text">funil</span>
            <br />
            render mais em minutos.
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Crie sua conta gratuitamente e configure seu pipeline em menos
            de 60 segundos.
          </p>
        </div>

        <div className="w-full">
          <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-2xl glass rise">
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/20 neon-border">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <p className="text-lg font-semibold">MiniCRM AI</p>
            </div>
            <h2 className="text-2xl font-semibold">Criar nova conta</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Você poderá usar o CRM assim que confirmar o e-mail.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <FormField label="Nome completo" htmlFor="name">
                <div className="relative">
                  <User2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="pl-9"
                  />
                </div>
              </FormField>

              <FormField label="E-mail" htmlFor="email">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
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
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo de 8 caracteres"
                    className="pl-9"
                  />
                </div>
              </FormField>

              <FormField label="Confirmar senha" htmlFor="confirm">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repita a senha"
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
                {pending ? "Criando conta..." : "Criar conta"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Já tem conta?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Entrar
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
