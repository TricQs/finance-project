"use client";

import { usePathname } from "next/navigation";
import { Bell, Plus, Search, HelpCircle } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggleCompact } from "@/components/layout/theme-toggle-compact";
import { resolveNavTitle } from "@/lib/nav-config";

type AppTopbarProps = {
  onAddTransaction?: () => void;
  className?: string;
};

export function AppTopbar({
  onAddTransaction,
  className,
}: AppTopbarProps) {
  const pathname = usePathname();
  const { label, subtitle } = resolveNavTitle(pathname ?? "");

  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-border/40 bg-background/95 backdrop-blur-md transform-gpu sticky top-0 z-30 font-sans shrink-0",
        className,
      )}
    >
      <div className="flex flex-col text-left">
        <h1 className="font-heading text-lg sm:text-xl font-bold text-foreground tracking-tight">
          {label}
        </h1>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden items-center gap-2 rounded-2xl border border-border/60 bg-muted/30 px-3.5 py-2 sm:flex">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            className="w-36 bg-transparent text-xs sm:text-sm text-foreground outline-none placeholder:text-muted-foreground lg:w-56"
          />
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-uangku-tour"))}
          title="Panduan Aplikasi"
          className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-background text-muted-foreground hover:text-primary hover:border-primary/50 transition-all cursor-pointer shadow-xs"
        >
          <HelpCircle className="size-4 sm:size-4.5" />
        </button>

        <button
          type="button"
          className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-background text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all cursor-pointer shadow-xs"
        >
          <Bell className="size-4 sm:size-4.5" />
        </button>

        <ThemeToggleCompact />

        {onAddTransaction && (
          <Button
            size="sm"
            onClick={onAddTransaction}
            className="rounded-2xl gap-1.5 cursor-pointer font-semibold shadow-sm text-xs sm:text-sm px-3.5 py-2"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Tambah Transaksi</span>
          </Button>
        )}
      </div>
    </header>
  );
}
