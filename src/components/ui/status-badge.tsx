"use client";

import { Badge } from "@/components/ui/badge";
import { PIPELINE_STATUS_LABEL, type PipelineStatusKey } from "@/types/domain";
import { PRIORITY_LABEL, type PriorityKey } from "@/types/domain";

export function StatusBadge({ status }: { status: PipelineStatusKey }) {
  const label = PIPELINE_STATUS_LABEL[status];
  const variant: "default" | "info" | "warning" | "success" | "muted" =
    status === "novo_lead"
      ? "info"
      : status === "contato"
      ? "default"
      : status === "proposta"
      ? "warning"
      : status === "negociacao"
      ? "warning"
      : "success";
  return <Badge variant={variant}>{label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: PriorityKey }) {
  const label = PRIORITY_LABEL[priority];
  const variant =
    priority === "high" ? "danger" : priority === "medium" ? "warning" : "muted";
  return <Badge variant={variant}>{label}</Badge>;
}
