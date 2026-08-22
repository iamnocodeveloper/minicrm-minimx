"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Copy, Check, Loader2, RefreshCcw, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { PIPELINE_STATUS_LABEL, type PipelineStatusKey } from "@/types/domain";
import { cn } from "@/lib/utils";

export function AIFollowUpPanel({
  clientId,
  clientName,
  stage,
  company,
}: {
  clientId: string;
  clientName: string;
  stage: PipelineStatusKey;
  company?: string;
}) {
  const [context, setContext] = useState(
    `Cliente ${clientName}${company ? ` da empresa ${company}` : ""}. Está no estágio ${PIPELINE_STATUS_LABEL[stage]} do nosso pipeline.\n\nContexto: ainda estamos alinhando as necessidades principais e o orçamento. Foi feita uma primeira reunião onde apresentei os benefícios da nossa solução.`
  );
  const [tone, setTone] = useState<"friendly" | "professional" | "direct">("professional");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/ai/follow-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-stage": stage,
        },
        body: JSON.stringify({
          context,
          tone,
          clientName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao gerar follow-up.");
      setMessage(data.message);
    } catch (err) {
      const m = err instanceof Error ? err.message : "Erro inesperado.";
      toast.error(m);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Mensagem copiada para a área de transferência.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/20 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>Gerar follow-up com IA</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Mensagem personalizada considerando o estágio do pipeline.
            </p>
          </div>
        </div>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          <Zap className="mr-1 inline h-3 w-3 text-primary" />
          OpenAI · server-side
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-3">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Contexto / histórico
            </label>
            <Textarea
              rows={5}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="mt-1.5"
              placeholder="Descreva o histórico, últimos contatos, dor do cliente, próximos passos..."
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tom
            </label>
            <Select
              value={tone}
              onChange={(e) => setTone(e.target.value as "friendly" | "professional" | "direct")}
              className="mt-1.5"
            >
              <option value="friendly">Amigável</option>
              <option value="professional">Profissional</option>
              <option value="direct">Direto</option>
            </Select>
            <p className="mt-2 text-[11px] text-muted-foreground">
              A IA considera o estágio atual: <strong>{PIPELINE_STATUS_LABEL[stage]}</strong>.
            </p>
            <Button onClick={generate} disabled={loading} className="mt-3 w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Gerar follow-up
                </>
              )}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "rounded-xl border border-dashed border-border bg-background/40 p-4",
            !message && "text-sm text-muted-foreground"
          )}
        >
          {message ? (
            <>
              <p className="whitespace-pre-wrap text-sm text-foreground">{message}</p>
              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                <Button variant="outline" onClick={generate} disabled={loading}>
                  <RefreshCcw className="h-4 w-4" />
                  Regenerar
                </Button>
                <Button onClick={copy} disabled={!message}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado" : "Copiar mensagem"}
                </Button>
              </div>
            </>
          ) : (
            <span>A mensagem aparecerá aqui após a geração.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
