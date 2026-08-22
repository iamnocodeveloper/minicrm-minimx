import Link from "next/link";
import {
  DollarSign,
  Users,
  Receipt,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/form-field";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { SalesFunnel } from "@/components/dashboard/sales-funnel";
import { ActivityRow } from "@/components/dashboard/activity-row";
import { getClientMetrics, listClients } from "@/data/clients";
import { listRecentActivities } from "@/data/activities";
import { listUpcomingTasks } from "@/data/tasks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { NewClientButton } from "@/components/clients/new-client-button";
import { PIPELINE_FLOW, type PipelineStatusKey } from "@/types/domain";

function KPI({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <Card className="card-hover">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardDescription className="text-[11px] uppercase tracking-wider">
            {title}
          </CardDescription>
          <CardTitle className="mt-1 text-2xl font-semibold text-foreground">
            {value}
          </CardTitle>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
          {icon}
        </div>
      </CardHeader>
      {trend ? (
        <CardContent className="-mt-3">
          <p className="inline-flex items-center gap-1 text-xs text-success">
            <ArrowUpRight className="h-3 w-3" />
            {trend}
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}

export default async function DashboardPage() {
  const [metrics, recent, upcoming, allClients] = await Promise.all([
    getClientMetrics(),
    listRecentActivities(5),
    listUpcomingTasks(8),
    listClients(),
  ]);

  const statusValues: Record<PipelineStatusKey, number> = {
    novo_lead: 0,
    contato: 0,
    proposta: 0,
    negociacao: 0,
    fechado: 0,
  };
  for (const stage of PIPELINE_FLOW) {
    statusValues[stage] = allClients
      .filter((c) => c.status === stage)
      .reduce((s, c) => s + (Number(c.value) || 0), 0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Bem-vindo de volta 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumo em tempo real do seu pipeline. Dados isolados por usuário.
          </p>
        </div>
        <NewClientButton />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI
          title="Receita total"
          value={formatCurrency(metrics.totalRevenue)}
          icon={<DollarSign className="h-4 w-4" />}
          trend="fechamentos no pipeline"
        />
        <KPI
          title="Leads ativos"
          value={String(metrics.activeLeads)}
          icon={<Users className="h-4 w-4" />}
        />
        <KPI
          title="Ticket médio"
          value={formatCurrency(metrics.avgTicket)}
          icon={<Receipt className="h-4 w-4" />}
        />
        <KPI
          title="Taxa de conversão"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Receita ao longo do tempo</CardTitle>
              <CardDescription>
                Fechamentos dos últimos 6 meses — atualização em tempo real.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueChart data={metrics.revenueByMonth} />
          </CardContent>
        </Card>

        {/* Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de vendas</CardTitle>
            <CardDescription>Distribuição dos seus clientes por estágio.</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesFunnel statusCounts={metrics.statusCounts} statusValues={statusValues} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Últimas atividades</CardTitle>
                <CardDescription>Os 5 contatos mais recentes com seus clientes.</CardDescription>
              </div>
              <Link
                href="/activities"
                className="text-xs font-medium text-primary hover:underline"
              >
                Ver tudo
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <EmptyState
                title="Nenhuma atividade registrada."
                description="Crie sua primeira atividade indo até um cliente."
                action={
                  <Link href="/clients">
                    <Button>
                      <Plus className="h-4 w-4" />
                      Ir para clientes
                    </Button>
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-2">
                {recent.map((a) => (
                  <ActivityRow
                    key={a.id}
                    activity={a}
                    clientName={a.client?.name}
                  />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Upcoming tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas tarefas</CardTitle>
            <CardDescription>Tarefas pendentes ordenadas por prazo.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <EmptyState
                title="Sem tarefas pendentes."
                description="Você está em dia. 🎉"
              />
            ) : (
              <ul className="space-y-2">
                {upcoming.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.due_date ? `Até ${formatDate(t.due_date)}` : "Sem prazo"}
                        {t.client?.name ? ` · ${t.client.name}` : ""}
                      </p>
                    </div>
                    {t.client_id ? (
                      <Link
                        href={`/clients/${t.client_id}`}
                        className="rounded-md bg-muted px-2.5 py-1 text-xs text-foreground hover:bg-primary/20 hover:text-primary"
                      >
                        Abrir
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
