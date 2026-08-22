import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Mail, Phone, Globe2, Calendar, StickyNote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientProfileEditButton } from "@/components/clients/client-profile-edit-button";
import { ClientTimelinePanel } from "@/components/clients/client-timeline-panel";
import { ClientTasksPanel } from "@/components/clients/client-tasks-panel";
import { AIFollowUpPanel } from "@/components/ai/ai-follow-up-panel";
import { getClient } from "@/data/clients";
import { listActivitiesForClient } from "@/data/activities";
import { listTasksForClient } from "@/data/tasks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, activities, tasks] = await Promise.all([
    getClient(id),
    listActivitiesForClient(id),
    listTasksForClient(id),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para a lista
        </Link>
      </div>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
            <StatusBadge status={client.status} />
            <PriorityBadge priority={client.priority} />
          </div>
          {client.company ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" /> {client.company}
            </p>
          ) : null}
        </div>
        <ClientProfileEditButton client={client} />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Info card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.email ? (
              <InfoRow icon={<Mail className="h-4 w-4" />} label="E-mail">
                <a
                  href={`mailto:${client.email}`}
                  className="text-foreground hover:text-primary"
                >
                  {client.email}
                </a>
              </InfoRow>
            ) : null}
            {client.phone ? (
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Telefone">
                <a
                  href={`tel:${client.phone}`}
                  className="text-foreground hover:text-primary"
                >
                  {client.phone}
                </a>
              </InfoRow>
            ) : null}
            {client.source ? (
              <InfoRow icon={<Globe2 className="h-4 w-4" />} label="Origem">
                {client.source}
              </InfoRow>
            ) : null}
            <InfoRow icon={<Calendar className="h-4 w-4" />} label="Criado">
              {formatDate(client.created_at)}
            </InfoRow>
            <InfoRow label="Valor da oportunidade">
              <span className="text-lg font-semibold gradient-text">
                {formatCurrency(Number(client.value ?? 0))}
              </span>
            </InfoRow>
            {client.notes ? (
              <InfoRow icon={<StickyNote className="h-4 w-4" />} label="Observações">
                <span className="whitespace-pre-wrap text-sm text-foreground">
                  {client.notes}
                </span>
              </InfoRow>
            ) : null}
          </CardContent>
        </Card>

        {/* AI follow-up */}
        <div className="lg:col-span-2">
          <AIFollowUpPanel
            clientId={client.id}
            clientName={client.name}
            stage={client.status}
            company={client.company ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ClientTimelinePanel clientId={client.id} initial={activities} />
        <ClientTasksPanel clientId={client.id} initial={tasks} />
      </div>
    </div>
  );
}

function InfoRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
