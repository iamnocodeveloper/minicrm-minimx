"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  Plus,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  ListChecks,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";
import { createTaskAction } from "@/app/(app)/actions/task-actions";

interface SuggestedTask {
  title: string;
  due_in_days: number;
}

interface SummaryResponse {
  summary: string;
  key_points: string[];
  decisions: string[];
  objections: string[];
  next_actions: string[];
  suggested_tasks: SuggestedTask[];
}

export function MeetingSummary() {
  const [clientName, setClientName] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResponse | null>(null);
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());

  async function generate() {
    if (transcript.trim().length < 80) {
      toast.error("Cole pelo menos 80 caracteres da transcrição.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/meeting-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, clientName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao resumir.");
      setResult(data.summary);
    } catch (err) {
      const m = err instanceof Error ? err.message : "Erro inesperado.";
      toast.error(m);
    } finally {
      setLoading(false);
    }
  }

  async function addTask(task: SuggestedTask, idx: number) {
    const key = `${task.title}-${idx}`;
    if (addedTasks.has(key)) return;
    try {
      const due = new Date(Date.now() + task.due_in_days * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      await createTaskAction({
        title: task.title,
        description: clientName ? `Cliente: ${clientName}` : "",
        due_date: due,
      });
      setAddedTasks((prev) => new Set(prev).add(key));
      toast.success("Tarefa criada.");
    } catch (err) {
      const m = err instanceof Error ? err.message : "Erro ao criar tarefa.";
      toast.error(m);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/20 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <CardTitle>Transcrição</CardTitle>
          </div>
          <CardDescription>
            Cole o conteúdo da reunião ou as anotações do call.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Cliente (opcional)
            </label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: Pixel Café"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Transcrição
            </label>
            <Textarea
              rows={14}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Cole aqui as falas, tópicos discutidos, decisões e anotações..."
              className="mt-1.5"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Nunca armazenamos a transcrição — ela é processada apenas para
              gerar o resumo e descartada em seguida.
            </p>
          </div>
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Resumindo...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Resumir com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-32" />
            <Skeleton className="h-24" />
          </div>
        ) : result ? (
          <>
            <ResultCard
              title="Resumo"
              icon={<ClipboardList className="h-4 w-4" />}
              accent
            >
              <p className="text-sm text-foreground">{result.summary}</p>
            </ResultCard>

            {result.key_points.length > 0 ? (
              <ResultCard title="Principais pontos" icon={<ListChecks className="h-4 w-4" />}>
                <ul className="space-y-1 text-sm">
                  {result.key_points.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-primary" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </ResultCard>
            ) : null}

            {result.decisions.length > 0 ? (
              <ResultCard title="Decisões" icon={<CheckCircle2 className="h-4 w-4 text-success" />}>
                <ul className="space-y-1 text-sm">
                  {result.decisions.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </ResultCard>
            ) : null}

            {result.objections.length > 0 ? (
              <ResultCard title="Objeções" icon={<AlertCircle className="h-4 w-4 text-warning" />}>
                <ul className="space-y-1 text-sm">
                  {result.objections.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </ResultCard>
            ) : null}

            {result.next_actions.length > 0 ? (
              <ResultCard title="Próximas ações" icon={<ArrowRight className="h-4 w-4 text-info" />}>
                <ul className="space-y-1 text-sm">
                  {result.next_actions.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-info" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </ResultCard>
            ) : null}

            {result.suggested_tasks.length > 0 ? (
              <ResultCard title="Tarefas sugeridas" icon={<Plus className="h-4 w-4 text-primary" />}>
                <ul className="space-y-2">
                  {result.suggested_tasks.map((t, i) => {
                    const key = `${t.title}-${i}`;
                    const added = addedTasks.has(key);
                    return (
                      <li
                        key={key}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{t.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Prazo sugerido: {t.due_in_days} dia{t.due_in_days === 1 ? "" : "s"}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={added ? "secondary" : "outline"}
                          disabled={added}
                          onClick={() => addTask(t, i)}
                        >
                          {added ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Plus className="h-4 w-4" />}
                          {added ? "Adicionada" : "Criar tarefa"}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </ResultCard>
            ) : null}
          </>
        ) : (
          <Card className="border-dashed">
            <CardContent className="grid place-items-center p-10 text-center text-sm text-muted-foreground">
              <div>
                <Sparkles className="mx-auto mb-2 h-6 w-6 text-primary" />
                O resumo, decisões, objeções e tarefas aparecerão aqui.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  title,
  icon,
  children,
  accent,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card className={cn(accent && "border-primary/40")}>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary">
          {icon}
        </div>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
