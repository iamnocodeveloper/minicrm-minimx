"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Pencil, Trash2, Filter, Mail, Phone, Building2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/form-field";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { ClientFormModal } from "./client-form-modal";
import { deleteClientAction } from "@/app/(app)/actions/client-actions";
import {
  PIPELINE_STATUS_LABEL,
  type Client,
  type PipelineStatusKey,
} from "@/types/domain";

type SortKey = "name" | "value" | "created_at";
type SortDir = "asc" | "desc";

export function ClientsTable({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PipelineStatusKey | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editing, setEditing] = useState<Client | null>(null);
  const [toDelete, setToDelete] = useState<Client | null>(null);
  const [pendingDelete, startDelete] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = clients.filter((c) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.company ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
    list = [...list].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return dir * a.name.localeCompare(b.name, "pt-BR");
      if (sortKey === "value") return dir * ((Number(a.value) || 0) - (Number(b.value) || 0));
      return dir * (a.created_at < b.created_at ? -1 : 1);
    });
    return list;
  }, [clients, search, statusFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function handleDelete() {
    if (!toDelete) return;
    startDelete(async () => {
      try {
        await deleteClientAction(toDelete.id);
        setClients((prev) => prev.filter((c) => c.id !== toDelete.id));
        toast.success("Cliente removido.");
        setToDelete(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Não foi possível remover.";
        toast.error(message);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, empresa ou e-mail"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="hidden h-4 w-4 text-muted-foreground sm:block" />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PipelineStatusKey | "all")}
            className="w-44"
          >
            <option value="all">Todos os status</option>
            {(Object.keys(PIPELINE_STATUS_LABEL) as PipelineStatusKey[]).map((k) => (
              <option key={k} value={k}>
                {PIPELINE_STATUS_LABEL[k]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={clients.length === 0 ? "Você ainda não tem clientes" : "Nenhum cliente encontrado"}
          description={
            clients.length === 0
              ? "Comece adicionando seu primeiro lead ao pipeline."
              : "Tente ajustar os filtros de busca."
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <Th onClick={() => toggleSort("name")} active={sortKey === "name"} dir={sortDir}>
                      Cliente
                    </Th>
                    <Th>Contato</Th>
                    <Th onClick={() => toggleSort("value")} active={sortKey === "value"} dir={sortDir}>
                      Valor
                    </Th>
                    <Th>Status</Th>
                    <Th>Prioridade</Th>
                    <Th onClick={() => toggleSort("created_at")} active={sortKey === "created_at"} dir={sortDir}>
                      Criado
                    </Th>
                    <Th className="text-right">Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr
                      key={c.id}
                      className={cn(
                        "border-t border-border transition hover:bg-muted/20",
                        i % 2 === 0 ? "bg-card/40" : "bg-transparent"
                      )}
                    >
                      <td className="px-4 py-3">
                        <Link href={`/clients/${c.id}`} className="block">
                          <p className="font-medium text-foreground">{c.name}</p>
                          {c.company ? (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" /> {c.company}
                            </p>
                          ) : null}
                        </Link>
                      </td>
                      <td className="space-y-0.5 px-4 py-3 text-xs text-muted-foreground">
                        {c.email ? (
                          <p className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{c.email}</span>
                          </p>
                        ) : null}
                        {c.phone ? (
                          <p className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {c.phone}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(Number(c.value ?? 0))}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditing(c)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setToDelete(c)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/15 hover:text-danger"
                            aria-label="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {filtered.map((c) => (
              <li key={c.id}>
                <Card className="card-hover p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/clients/${c.id}`} className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                      {c.company ? (
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" /> {c.company}
                        </p>
                      ) : null}
                    </Link>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(c)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(c)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/15 hover:text-danger"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-medium">{formatCurrency(Number(c.value ?? 0))}</span>
                    <span className="flex items-center gap-2">
                      <StatusBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                    </span>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      <ClientFormModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
      />

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Excluir cliente"
        description="Tem certeza que deseja excluir este cliente? Essa ação não pode ser desfeita."
      >
        <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
          <p className="text-sm text-foreground">
            Ao excluir {toDelete?.name}, todas as atividades e tarefas
            relacionadas também serão removidas.
          </p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setToDelete(null)} disabled={pendingDelete}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={pendingDelete}>
            {pendingDelete ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  dir?: SortDir;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-3 text-left font-medium", className)}>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "inline-flex items-center gap-1 transition hover:text-foreground",
            active ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {children}
          {active ? <span aria-hidden>{dir === "asc" ? "▲" : "▼"}</span> : null}
        </button>
      ) : (
        children
      )}
    </th>
  );
}
