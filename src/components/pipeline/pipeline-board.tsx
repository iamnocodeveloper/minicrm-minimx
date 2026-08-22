"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { Building2, CalendarClock, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "@/components/ui/status-badge";
import { NewClientButton } from "@/components/clients/new-client-button";
import {
  PIPELINE_FLOW,
  PIPELINE_STATUS_LABEL,
  type Client,
  type PipelineStatusKey,
} from "@/types/domain";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { updateClientStatusAction } from "@/app/(app)/actions/client-actions";

function ClientCard({ client, isOverlay = false }: { client: Client; isOverlay?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card/90 p-3 shadow-sm transition cursor-grab active:cursor-grabbing",
        "border-border card-hover",
        isOverlay && "ring-2 ring-primary/60 shadow-2xl"
      )}
      data-dragging={isOverlay}
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/clients/${client.id}`} className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{client.name}</p>
          {client.company ? (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{client.company}</span>
            </p>
          ) : null}
        </Link>
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/60" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          {formatCurrency(Number(client.value ?? 0))}
        </span>
        <PriorityBadge priority={client.priority} />
      </div>
      {client.created_at ? (
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarClock className="h-3 w-3" />
          {formatDate(client.created_at)}
        </p>
      ) : null}
    </div>
  );
}

function DraggableCard({
  client,
  onOpen,
}: {
  client: Client;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: client.id,
    data: { client },
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onDoubleClick={() => onOpen(client.id)}
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <ClientCard client={client} />
    </div>
  );
}

function DroppableColumn({
  stage,
  items,
  onOpen,
}: {
  stage: PipelineStatusKey;
  items: Client[];
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage, data: { stage } });
  const total = items.reduce((s, i) => s + (Number(i.value) || 0), 0);
  return (
    <div className="flex h-full min-w-[260px] flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <StatusBadge status={stage} />
          <span className="text-xs text-muted-foreground">
            {items.length} cliente{items.length === 1 ? "" : "s"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatCurrency(total)}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "kanban-col flex flex-1 flex-col gap-3 p-3 transition",
          isOver && "ring-2 ring-primary/60"
        )}
        data-stage={stage}
      >
        {items.length === 0 ? (
          <div className="grid flex-1 place-items-center rounded-lg border border-dashed border-border/50 p-6 text-center text-xs text-muted-foreground">
            Solte um card aqui
          </div>
        ) : (
          items.map((c) => <DraggableCard key={c.id} client={c} onOpen={onOpen} />)
        )}
        <NewClientButton
          defaultStatus={stage}
          label="Adicionar"
          variant="outline"
        />
      </div>
    </div>
  );
}

interface PipelineBoardProps {
  initialClients: Client[];
}

export function PipelineBoard({ initialClients }: PipelineBoardProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [active, setActive] = useState<Client | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  function byStage(stage: PipelineStatusKey) {
    return clients
      .filter((c) => c.status === stage)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

  function findStage(id: string): PipelineStatusKey | null {
    const item = clients.find((c) => c.id === id);
    return item?.status ?? null;
  }

  function findClient(id: string): Client | null {
    return clients.find((c) => c.id === id) ?? null;
  }

  function onDragStart(e: DragStartEvent) {
    const data = e.active.data.current as { client?: Client } | undefined;
    if (data?.client) setActive(data.client);
  }

  function onDragEnd(e: DragEndEvent) {
    setActive(null);
    const { active: activeItem, over } = e;
    if (!over) return;

    const clientId = String(activeItem.id);
    const targetStage = (over.data.current as { stage?: PipelineStatusKey } | undefined)?.stage ?? null;
    if (!targetStage) return;

    const prev = findStage(clientId);
    if (!prev || prev === targetStage) return;

    // Optimistic update
    const next = clients.map((c) => (c.id === clientId ? { ...c, status: targetStage } : c));
    setClients(next);

    startTransition(async () => {
      try {
        await updateClientStatusAction(clientId, targetStage);
        toast.success(`Movido para ${PIPELINE_STATUS_LABEL[targetStage]}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Não foi possível atualizar o status.";
        toast.error(message);
        // Rollback
        setClients((prevList) =>
          prevList.map((c) => (c.id === clientId ? { ...c, status: prev! } : c))
        );
      }
    });
  }

  function handleOpen(_id: string) {
    // Navigation is handled by the Link inside each card. This is a
    // placeholder for explicit double-click open (currently no-op).
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {PIPELINE_FLOW.map((stage) => (
            <DroppableColumn
              key={stage}
              stage={stage}
              items={byStage(stage)}
              onOpen={handleOpen}
            />
          ))}
        </div>
      </div>
      <DragOverlay>
        {active ? <ClientCard client={active} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
