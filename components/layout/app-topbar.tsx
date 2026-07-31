"use client";

import { usePathname } from "next/navigation";
import { Bell, Plus, HelpCircle } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggleCompact } from "@/components/layout/theme-toggle-compact";
import { useLanguage } from "@/lib/i18n/context";
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
  const { t } = useLanguage();
  const { label, subtitle } = resolveNavTitle(pathname ?? "");

  // Map dynamic translated title if route matches
  let pageTitle = label;
  let pageSubtitle = subtitle;

  if (pathname?.startsWith("/dashboard")) {
    pageTitle = t.nav.dashboard;
    pageSubtitle = t.dashboard.subtitle;
  } else if (pathname?.startsWith("/accounts")) {
    pageTitle = t.nav.accounts;
    pageSubtitle = t.accounts.subtitle;
  } else if (pathname?.startsWith("/transactions")) {
    pageTitle = t.nav.transactions;
    pageSubtitle = t.transactions.subtitle;
  } else if (pathname?.startsWith("/insights")) {
    pageTitle = t.nav.insights;
    pageSubtitle = t.insights.subtitle;
  } else if (pathname?.startsWith("/budgets")) {
    pageTitle = t.nav.budgets;
    pageSubtitle = t.budgets.subtitle;
  } else if (pathname?.startsWith("/settings")) {
    pageTitle = t.nav.settings;
    pageSubtitle = t.settings.subtitle;
  }

  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-border/40 bg-background/95 backdrop-blur-md transform-gpu sticky top-0 z-30 font-sans shrink-0",
        className,
      )}
    >
      <div className="flex flex-col text-left">
        <h1 className="font-heading text-lg sm:text-xl font-bold text-foreground tracking-tight">
          {pageTitle}
        </h1>
        {pageSubtitle && (
          <span className="text-xs text-muted-foreground">{pageSubtitle}</span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-uangku-tour"))}
          title="Panduan Aplikasi"
          className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-400/80 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-all cursor-pointer shadow-xs"
        >
          <HelpCircle className="size-4 sm:size-4.5" />
        </button>

        <button
          type="button"
          title="Notifikasi"
          className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-400/80 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-all cursor-pointer shadow-xs"
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
