import { listClients } from "@/data/clients";
import { ClientsTable } from "@/components/clients/clients-table";
import { NewClientButton } from "@/components/clients/new-client-button";

export default async function ClientsPage() {
  const clients = await listClients();
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Todos os seus leads e oportunidades em um só lugar.
          </p>
        </div>
        <NewClientButton />
      </header>
      <ClientsTable initialClients={clients} />
    </div>
  );
}
