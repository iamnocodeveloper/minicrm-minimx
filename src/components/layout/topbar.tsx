"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { LogOut, Menu, Sparkles, User2 } from "lucide-react";
import { signOutAction } from "@/lib/insforge/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

interface TopbarProps {
  userEmail: string;
  userName?: string;
  onToggleSidebar?: () => void;
}

export function Topbar({ userEmail, userName, onToggleSidebar }: TopbarProps) {
  const [openMenu, setOpenMenu] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      const result = await signOutAction();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Você saiu da conta.");
        // Use full navigation to ensure server components refresh.
        window.location.href = "/login";
      }
    });
  }

  const displayName = userName || userEmail;
  const subtitle = userName ? userEmail : "";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/40 backdrop-blur-lg">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">MiniCRM AI</span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((v) => !v)}
              className="flex items-center gap-3 rounded-full border border-border bg-card/60 py-1 pl-1 pr-3 hover:bg-muted"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                {initials(displayName)}
              </span>
              <span className="hidden sm:flex sm:flex-col sm:items-start">
                <span className="text-xs font-semibold leading-tight">
                  {displayName}
                </span>
                {subtitle ? (
                  <span className="text-[11px] leading-tight text-muted-foreground">
                    {subtitle}
                  </span>
                ) : null}
              </span>
            </button>
            {openMenu ? (
              <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur glass">
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold">{displayName}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
                <div className="my-1 h-px bg-border" />
                <Link
                  href="/settings"
                  onClick={() => setOpenMenu(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  <User2 className="h-4 w-4" />
                  Configurações
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(false);
                    handleSignOut();
                  }}
                  disabled={pending}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-muted disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {pending ? "Saindo..." : "Sair"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
