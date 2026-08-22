"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Sparkles, Trash2, AlertTriangle, Database, User2, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { initials } from "@/lib/utils";
import {
  clearDemoDataAction,
  seedDemoDataAction,
} from "@/app/(app)/actions/demo-actions";
import { signOutAction } from "@/lib/insforge/actions";

interface SettingsPanelProps {
  user: { id: string; email: string; name?: string };
}

export function SettingsPanel({ user }: SettingsPanelProps) {
  const [loading, setLoading] = useState<"seed" | "clear" | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [, startTransition] = useTransition();

  function seed() {
    setLoading("seed");
    startTransition(async () => {
      try {
        const r = await seedDemoDataAction();
        if (!r.ok) throw new Error("Falha");
        toast.success(
          `Dados de demonstração criados: ${r.clients} clientes, ${r.activities} atividades e ${r.tasks} tarefas.`
        );
      } catch (err) {
        const m = err instanceof Error ? err.message : "Erro.";
        toast.error(m);
      } finally {
        setLoading(null);
      }
    });
  }

  function clearData() {
    setLoading("clear");
    startTransition(async () => {
      try {
        const r = await clearDemoDataAction();
        if (!r.ok) throw new Error("Falha");
        toast.success(`Dados de demonstração removidos: ${r.clients + r.activities + r.tasks} itens.`);
        setConfirmClear(false);
      } catch (err) {
        const m = err instanceof Error ? err.message : "Erro.";
        toast.error(m);
      } finally {
        setLoading(null);
      }
    });
  }

  function handleSignOut() {
    startTransition(async () => {
      const result = await signOutAction();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Sessão encerrada.");
      window.location.href = "/login";
    });
  }

  const display = user.name || user.email;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Seu perfil</CardTitle>
          <CardDescription>Identidade vinculada à sua conta.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/20 text-lg font-semibold text-primary">
            {initials(display)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold">{display}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              {user.email}
            </p>
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <User2 className="h-3 w-3" />
              ID: {user.id.slice(0, 8)}…
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sair
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados de demonstração</CardTitle>
          <CardDescription>
            Popular clientes, atividades e tarefas de exemplo para explorar o CRM.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-foreground">
            <p className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
              Os dados são cadastrados APENAS na sua conta (isolados por usuário).
              Para removê-los depois, clique em "Remover dados demo".
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={seed} disabled={loading !== null} className="sm:flex-1">
              {loading === "seed" ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Criando dados...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Carregar dados de demonstração
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmClear(true)}
              disabled={loading !== null}
              className="sm:flex-1"
            >
              <Trash2 className="h-4 w-4" />
              Remover dados demo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Remover dados de demonstração"
        description="Esta ação remove apenas os clientes, atividades e tarefas criados pelo botão 'Carregar dados demo'."
      >
        <p className="text-sm text-foreground">
          Tem certeza que deseja continuar? Esta ação não pode ser desfeita.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmClear(false)} disabled={loading === "clear"}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={clearData} disabled={loading === "clear"}>
            {loading === "clear" ? "Removendo..." : "Sim, remover"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
