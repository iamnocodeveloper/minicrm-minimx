"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientFormModal } from "./client-form-modal";
import type { PipelineStatusKey } from "@/types/domain";

interface NewClientButtonProps {
  defaultStatus?: PipelineStatusKey;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function NewClientButton({
  defaultStatus = "novo_lead",
  label = "Novo cliente",
  variant = "default",
}: NewClientButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {label}
      </Button>
      <ClientFormModal
        open={open}
        onClose={() => setOpen(false)}
        defaultStatus={defaultStatus}
      />
    </>
  );
}
