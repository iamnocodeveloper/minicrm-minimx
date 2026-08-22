import { SettingsPanel } from "@/components/settings/settings-panel";
import { getSessionUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) return null;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie dados de demonstração, sessão e preferências.
        </p>
      </header>
      <SettingsPanel user={user} />
    </div>
  );
}
