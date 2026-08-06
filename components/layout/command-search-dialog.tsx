"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Wallet,
  ArrowRightLeft,
  SlidersHorizontal,
  PiggyBank,
  Settings,
  Plus,
  FileText,
  Sun,
  Moon,
  ShoppingBag,
  BellRing
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { ActionSearchBar, Action } from "@/components/ui/action-search-bar";
import { useLanguage } from "@/lib/i18n/context";
import { useTheme } from "next-themes";

interface CommandSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandSearchDialog({ open, onOpenChange }: CommandSearchDialogProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isId = language === "id";
  const isJa = language === "ja";

  // Shortcut Cmd+K / Ctrl+K Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleSelectAction = (actionCallback: () => void) => {
    onOpenChange(false);
    actionCallback();
  };

  const appActions: Action[] = [
    {
      id: "nav-dashboard",
      label: t.nav.dashboard,
      icon: <LayoutGrid className="h-4 w-4 text-indigo-500" />,
      description: isJa ? "ダッシュボード" : isId ? "Ringkasan Arus Kas" : "Cashflow Summary",
      short: "⌘1",
      end: "Nav",
      onSelect: () => handleSelectAction(() => router.push("/dashboard"))
    },
    {
      id: "nav-accounts",
      label: t.nav.accounts,
      icon: <Wallet className="h-4 w-4 text-emerald-500" />,
      description: isJa ? "口座・残高" : isId ? "Kelola Saldo Dompet" : "Wallet Balances",
      short: "⌘2",
      end: "Nav",
      onSelect: () => handleSelectAction(() => router.push("/accounts"))
    },
    {
      id: "nav-transactions",
      label: t.nav.transactions,
      icon: <ArrowRightLeft className="h-4 w-4 text-blue-500" />,
      description: isJa ? "取引履歴" : isId ? "Riwayat Transaksi" : "Transaction History",
      short: "⌘3",
      end: "Nav",
      onSelect: () => handleSelectAction(() => router.push("/transactions"))
    },
    {
      id: "nav-insights",
      label: t.nav.insights,
      icon: <SlidersHorizontal className="h-4 w-4 text-purple-500" />,
      description: isJa ? "財務分析" : isId ? "Analisis Skor Keuangan" : "Financial Health Score",
      short: "⌘4",
      end: "Nav",
      onSelect: () => handleSelectAction(() => router.push("/insights"))
    },
    {
      id: "nav-budgets",
      label: t.nav.budgets,
      icon: <PiggyBank className="h-4 w-4 text-amber-500" />,
      description: isJa ? "予算管理" : isId ? "Batas Anggaran Bulanan" : "Monthly Budget Limits",
      short: "⌘5",
      end: "Nav",
      onSelect: () => handleSelectAction(() => router.push("/budgets"))
    },
    {
      id: "nav-reminders",
      label: isJa ? "請求書リマインダー" : isId ? "Pengingat Tagihan Bulanan" : "Bill Reminders",
      icon: <BellRing className="h-4 w-4 text-rose-500" />,
      description: isJa ? "リマインダー" : isId ? "Jadwal Tagihan Rutin" : "Recurring Bills",
      short: "⌘6",
      end: "Nav",
      onSelect: () => handleSelectAction(() => router.push("/reminders"))
    },
    {
      id: "nav-settings",
      label: t.nav.settings,
      icon: <Settings className="h-4 w-4 text-slate-500" />,
      description: isJa ? "設定・言語" : isId ? "Profil & Pengaturan" : "Profile & Preferences",
      short: "⌘7",
      end: "Nav",
      onSelect: () => handleSelectAction(() => router.push("/settings"))
    },
    {
      id: "store-shopee",
      label: "Shopee Store",
      icon: <ShoppingBag className="h-4 w-4 text-orange-500" />,
      description: "E-Commerce",
      short: "",
      end: "Store",
      onSelect: () => handleSelectAction(() => router.push("/store/shopee"))
    },
    {
      id: "store-tokopedia",
      label: "Tokopedia Store",
      icon: <ShoppingBag className="h-4 w-4 text-emerald-500" />,
      description: "E-Commerce",
      short: "",
      end: "Store",
      onSelect: () => handleSelectAction(() => router.push("/store/tokopedia"))
    },
    {
      id: "action-add-trans",
      label: isJa ? "新規取引を追加" : isId ? "Tambah Transaksi Baru" : "Add New Transaction",
      icon: <Plus className="h-4 w-4 text-indigo-500" />,
      description: isId ? "Input Transaksi Baru" : "New Transaction",
      short: "⌘+N",
      end: "Action",
      onSelect: () => handleSelectAction(() => router.push("/transactions"))
    },
    {
      id: "action-export-pdf",
      label: isJa ? "PDFレポートを出力" : isId ? "Cetak Laporan PDF" : "Export PDF Report",
      icon: <FileText className="h-4 w-4 text-rose-500" />,
      description: isId ? "Unduh Statemen Keuangan" : "Financial PDF Statement",
      short: "⌘+P",
      end: "Action",
      onSelect: () => handleSelectAction(() => router.push("/transactions"))
    },
    {
      id: "action-toggle-theme",
      label: theme === "dark" 
        ? (isJa ? "ライトモードに切り替え" : isId ? "Ganti ke Mode Terang (Light)" : "Switch to Light Mode")
        : (isJa ? "ダークモードに切り替え" : isId ? "Ganti ke Mode Gelap (Dark)" : "Switch to Dark Mode"),
      icon: theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />,
      description: isId ? "Ubah Tema Tampilan" : "Toggle Color Theme",
      short: "⌘+T",
      end: "Action",
      onSelect: () => handleSelectAction(() => setTheme(theme === "dark" ? "light" : "dark"))
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader className="sr-only">
        <DialogTitle>Quick Action Search</DialogTitle>
        <DialogDescription>Search commands and actions</DialogDescription>
      </DialogHeader>
      <DialogContent className="max-w-lg p-4 bg-background border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl">
        <ActionSearchBar actions={appActions} />
      </DialogContent>
    </Dialog>
  );
}
