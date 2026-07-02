"use client";

import { usePathname } from "next/navigation";
import { Bell, Plus, Search, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { resolveNavTitle } from "@/lib/nav-config";

type AppTopbarProps = {
  onAddTransaction?: () => void;
  className?: string;
};

export function AppTopbar({ onAddTransaction, className }: AppTopbarProps) {
  const pathname = usePathname();
  const { label, subtitle } = resolveNavTitle(pathname ?? "");

  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 px-6 py-5",
        className,
      )}
    >
      <div className="flex flex-col">
        <h1 className="font-heading text-xl font-semibold text-foreground">
          {label}
        </h1>
        {subtitle && (
          <span className="text-sm text-muted-foreground">{subtitle}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="neu-pressed-sm hidden items-center gap-2 rounded-2xl px-4 py-2.5 sm:flex">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari transaksi, akun..."
            className="w-48 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground lg:w-64"
          />
        </div>

        <button
          type="button"
          className="neu-raised-sm neu-interactive neu-transition flex size-10 shrink-0 items-center justify-center rounded-2xl text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-4.5" />
        </button>

        <button
          type="button"
          className="neu-raised-sm neu-interactive neu-transition hidden size-10 shrink-0 items-center justify-center rounded-2xl text-muted-foreground hover:text-foreground sm:flex"
        >
          <Settings className="size-4.5" />
        </button>

        <ThemeToggle />

        <Button
          size="lg"
          onClick={onAddTransaction}
          className="neu-raised-sm neu-transition rounded-2xl shadow-none hover:neu-raised-lg"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Tambah Transaksi</span>
        </Button>
      </div>
    </header>
  );
}
