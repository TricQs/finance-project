"use client";

import { usePathname } from "next/navigation";
import { Bell, Plus, Search, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggleCompact } from "@/components/layout/theme-toggle-compact";
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
        "flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-border/20 bg-background/50 backdrop-blur-md sticky top-0 z-30",
        className,
      )}
    >
      <div className="flex flex-col text-left">
        <h1 className="font-heading text-lg sm:text-xl font-bold text-foreground tracking-tight">
          {label}
        </h1>
        {subtitle && (
          <span className="text-xs sm:text-sm text-muted-foreground">{subtitle}</span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden items-center gap-2 rounded-2xl border border-border bg-muted/30 px-3.5 py-2 sm:flex">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            className="w-36 bg-transparent text-xs sm:text-sm text-foreground outline-none placeholder:text-muted-foreground lg:w-56"
          />
        </div>

        <button
          type="button"
          className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all cursor-pointer"
        >
          <Bell className="size-4 sm:size-4.5" />
        </button>

        <ThemeToggleCompact />

        {onAddTransaction && (
          <Button
            size="sm"
            onClick={onAddTransaction}
            className="rounded-2xl gap-1.5 cursor-pointer font-semibold shadow-sm"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Tambah Transaksi</span>
          </Button>
        )}
      </div>
    </header>
  );
}
