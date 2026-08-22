import { listClients } from "@/data/clients";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";

export default async function PipelinePage() {
  const clients = await listClients();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Arraste e solte os cards entre as colunas para atualizar o estágio.
          As alterações são salvas automaticamente.
        </p>
      </header>
      <PipelineBoard initialClients={clients} />
    </div>
  );
}
