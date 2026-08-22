"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { clientSchema, type ClientFormInput } from "@/lib/validations/schemas";
import { PIPELINE_STATUS_LABEL, PRIORITY_LABEL, type Client, type PipelineStatusKey, type PriorityKey } from "@/types/domain";
import { createClientAction, updateClientAction } from "@/app/(app)/actions/client-actions";

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Client;
  onSuccess?: (client: Client) => void;
  defaultStatus?: PipelineStatusKey;
}

export function ClientFormModal({
  open,
  onClose,
  initial,
  onSuccess,
  defaultStatus = "novo_lead",
}: ClientFormModalProps) {
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientFormInput>({
    resolver: zodResolver(clientSchema) as never,
    defaultValues: {
      name: initial?.name ?? "",
      company: initial?.company ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      value: initial?.value ?? null,
      status: initial?.status ?? defaultStatus,
      priority: initial?.priority ?? "medium",
      source: initial?.source ?? "",
      notes: initial?.notes ?? "",
    },
  });

  function onSubmit(values: ClientFormInput) {
    startTransition(async () => {
      try {
        const result = initial
          ? await updateClientAction(initial.id, values)
          : await createClientAction(values);
        if (!result.ok) throw new Error("Falha ao salvar");
        toast.success(initial ? "Cliente atualizado." : "Cliente criado.");
        onSuccess?.(result.client);
        reset();
        onClose();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Não foi possível salvar.";
        toast.error(message);
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Editar cliente" : "Novo cliente"}
      description={
        initial
          ? "Atualize as informações do cliente e mantenha seu funil em dia."
          : "Adicione um novo lead/oportunidade ao seu pipeline."
      }
    >
      <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nome" error={errors.name?.message}>
            <Input {...register("name")} placeholder="Ana Souza" />
          </FormField>
          <FormField label="Empresa" error={errors.company?.message}>
            <Input {...register("company")} placeholder="Pixel Café" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="E-mail" error={errors.email?.message}>
            <Input type="email" {...register("email")} placeholder="ana@empresa.com" />
          </FormField>
          <FormField label="Telefone" error={errors.phone?.message}>
            <Input {...register("phone")} placeholder="+55 11 99999-1010" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Valor (R$)" error={errors.value?.message}>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={watch("value") ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setValue("value", val === "" ? null : Number(val));
              }}
              placeholder="0"
            />
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <Select {...register("status")}>
              {(Object.keys(PIPELINE_STATUS_LABEL) as PipelineStatusKey[]).map((k) => (
                <option key={k} value={k}>
                  {PIPELINE_STATUS_LABEL[k]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Prioridade" error={errors.priority?.message}>
            <Select {...register("priority")}>
              {(Object.keys(PRIORITY_LABEL) as PriorityKey[]).map((k) => (
                <option key={k} value={k}>
                  {PRIORITY_LABEL[k]}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Origem" error={errors.source?.message}>
          <Input {...register("source")} placeholder="Indicação, LinkedIn, Site..." />
        </FormField>

        <FormField label="Observações" error={errors.notes?.message}>
          <Textarea rows={4} {...register("notes")} placeholder="Contexto, preferências, próximos passos..." />
        </FormField>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : initial ? "Salvar alterações" : "Adicionar cliente"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
