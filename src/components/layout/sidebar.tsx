"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  Activity as ActivityIcon,
  Settings,
  Sparkles,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/activities", label: "Atividades", icon: ActivityIcon },
  { href: "/ai-meeting", label: "Resumir reunião", icon: FileText },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card/50 backdrop-blur-md">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2 px-5 pb-6 pt-7"
      >
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/20 neon-border">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-foreground">
            MiniCRM AI
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            Premium workspace
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-primary/15 text-primary neon-border"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
              data-active={active}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
            IA Ativa
          </p>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Follow-ups e resumos de reunião prontos para você usar.
        </p>
      </div>
    </aside>
  );
}
