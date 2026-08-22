import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return (
    <DashboardShell userEmail={user.email} userName={user.name}>
      {children}
    </DashboardShell>
  );
}
