"use client";

import { useState, useTransition } from "react";
import {
  PhoneCall,
  Mail,
  Users,
  MessageCircle,
  StickyNote,
  Plus,
  Trash2,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { EmptyState } from "@/components/ui/form-field";
import {
  ACTIVITY_TYPE_LABEL,
  type Activity,
  type ActivityTypeKey,
} from "@/types/domain";
import { relativeTime, formatDateTime } from "@/lib/utils";
import { createActivityAction, deleteActivityAction } from "@/app/(app)/actions/activity-actions";

const ICONS: Record<ActivityTypeKey, React.ComponentType<{ className?: string }>> = {
  call: PhoneCall,
  email: Mail,
  meeting: Users,
  whatsapp: MessageCircle,
  note: StickyNote,
};

export function ClientTimelinePanel({
  clientId,
  initial,
}: {
  clientId: string;
  initial: Activity[];
}) {
  const [items, setItems] = useState<Activity[]>(initial);
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<ActivityTypeKey>("call");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [, startAdd] = useTransition();

  function reset() {
    setType("call");
    setTitle("");
    setDescription("");
  }

  function handleCreate() {
    if (title.trim().length < 2) {
      toast.error("Informe um título com pelo menos 2 caracteres.");
      return;
    }
    startAdd(async () => {
      try {
        const res = await createActivityAction({
          client_id: clientId,
          type,
          title: title.trim(),
          description: description.trim() || "",
        });
        if (!res.ok) throw new Error("Falha");
        setItems((prev) => [res.activity, ...prev]);
        toast.success("Atividade registrada.");
        reset();
        setAdding(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Não foi possível salvar.";
        toast.error(message);
      }
    });
  }

  function handleDelete(id: string) {
    startAdd(async () => {
      try {
        await deleteActivityAction(id, clientId);
        setItems((prev) => prev.filter((a) => a.id !== id));
        toast.success("Atividade removida.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Não foi possível remover.";
        toast.error(message);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Histórico de atividades</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Nova atividade
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={<CalendarClock className="h-6 w-6" />}
            title="Nenhuma atividade ainda"
            description="Registre ligações, e-mails e reuniões para manter o histórico completo."
          />
        ) : (
          <ol className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
            {items.map((a) => {
              const Icon = ICONS[a.type];
              return (
                <li key={a.id} className="group relative">
                  <span className="absolute -left-6 grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-primary ring-4 ring-background">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="rounded-xl border border-border bg-card/60 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{a.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {ACTIVITY_TYPE_LABEL[a.type]} · {relativeTime(a.created_at)} ·{" "}
                          <span title={formatDateTime(a.created_at)}>
                            {formatDateTime(a.created_at)}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
                        className="rounded-md p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-muted hover:text-danger"
                        aria-label="Excluir atividade"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {a.description ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                        {a.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Nova atividade"
        description="Registre um contato, ligação ou nota para este cliente."
      >
        <div className="space-y-4">
          <FormField label="Tipo">
            <Select value={type} onChange={(e) => setType(e.target.value as ActivityTypeKey)}>
              {(Object.keys(ACTIVITY_TYPE_LABEL) as ActivityTypeKey[]).map((k) => (
                <option key={k} value={k}>
                  {ACTIVITY_TYPE_LABEL[k]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Título">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ligação de follow-up"
            />
          </FormField>
          <FormField label="Descrição">
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes, decisões, próximos passos..."
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAdding(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Registrar atividade</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
