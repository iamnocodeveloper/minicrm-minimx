"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientFormModal } from "./client-form-modal";
import type { Client } from "@/types/domain";

export function ClientProfileEditButton({ client }: { client: Client }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
        Editar
      </Button>
      <ClientFormModal open={open} onClose={() => setOpen(false)} initial={client} />
    </>
  );
}
