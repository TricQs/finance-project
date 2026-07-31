"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Download,
  CreditCard,
  PiggyBank,
  Search,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  ArrowRightLeft,
  Calendar,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { UnifiedTransaction } from "@/lib/transactions/actions";
import type { Account } from "@/types";
import { toast } from "sonner";
import Link from "next/link";

import { useLanguage } from "@/lib/i18n/context";
import { translateCategory } from "@/lib/i18n/dictionary";

interface DashboardClientProps {
  userName: string;
  accounts: Account[];
  allYearTransactions: UnifiedTransaction[];
}

export function DashboardClientPage({
  userName,
  accounts,
  allYearTransactions,
}: DashboardClientProps) {
  const { getGreeting, t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isTourOpen, setIsTourOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("tour") === "true") {
      setIsTourOpen(true);
    }
  }, [searchParams]);

  // 1. Total Net Worth (Sum of active accounts)
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  }, [accounts]);

  // 2. Stat Bulan Ini (Monthly Income, Expense, Savings)
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const { thisMonthIncome, thisMonthExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;

    allYearTransactions.forEach((tx) => {
      // Filter transaksi bulan ini (selain Saldo Awal)
      if (tx.date.startsWith(currentMonthStr)) {
        if (tx.category === "Saldo Awal") return;

        if (tx.type === "income") income += Number(tx.amount);
        else if (tx.type === "expense") expense += Number(tx.amount);
      }
    });

    return { thisMonthIncome: income, thisMonthExpense: expense };
  }, [allYearTransactions, currentMonthStr]);

  const monthlySavings = thisMonthIncome - thisMonthExpense;

  // 3. Bar Chart Data (12 Bulan untuk Tahun Terpilih)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

  const { barChartData, totalYearExpense } = useMemo(() => {
    const monthlyTotals = new Array(12).fill(0);

    allYearTransactions.forEach((tx) => {
      if (tx.type === "expense" && tx.category !== "Saldo Awal") {
        const txYear = parseInt(tx.date.substring(0, 4), 10);
        if (txYear === selectedYear) {
          const txMonthIndex = parseInt(tx.date.substring(5, 7), 10) - 1;
          if (txMonthIndex >= 0 && txMonthIndex < 12) {
            monthlyTotals[txMonthIndex] += Number(tx.amount);
          }
        }
      }
    });

    const maxExp = Math.max(...monthlyTotals, 0);
    const sumExp = monthlyTotals.reduce((a, b) => a + b, 0);

    const bars = monthNames.map((month, idx) => {
      const amt = monthlyTotals[idx];
      const heightPct = maxExp > 0 ? Math.max(8, (amt / maxExp) * 100) : 0;
      const isCurrentMonth = idx === now.getMonth() && selectedYear === now.getFullYear();

      return {
        month,
        amount: amt,
        heightPct: `${heightPct}%`,
        isCurrentMonth,
      };
    });

    return { barChartData: bars, totalYearExpense: sumExp };
  }, [allYearTransactions, selectedYear, now]);

  // 4. Category Breakdown Bulan Ini
  const sortedCategories = useMemo(() => {
    const catMap: Record<string, number> = {};

    allYearTransactions.forEach((tx) => {
      if (tx.type === "expense" && tx.date.startsWith(currentMonthStr)) {
        catMap[tx.category] = (catMap[tx.category] || 0) + Number(tx.amount);
      }
    });

    return Object.entries(catMap)
      .map(([name, amount]) => ({
        name,
        amount,
        pct: thisMonthExpense > 0 ? Math.round((amount / thisMonthExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [allYearTransactions, currentMonthStr, thisMonthExpense]);

  // 5. Live Search Filter Recent Transactions
  const filteredRecentTx = useMemo(() => {
    let result = allYearTransactions;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (tx) =>
          tx.category.toLowerCase().includes(q) ||
          (tx.account_name && tx.account_name.toLowerCase().includes(q)) ||
          (tx.description && tx.description.toLowerCase().includes(q))
      );
    }

    return result.slice(0, 10);
  }, [allYearTransactions, search]);

  // Export CSV (Translates headers & values dynamically & formats clean YYYY-MM-DD for Excel)
  function handleExportCSV() {
    if (allYearTransactions.length === 0) {
      toast.error("Belum ada data transaksi untuk diekspor");
      return;
    }

    const headers = language === "en"
      ? ["Date", "Type", "Category", "Amount", "Account", "Description"]
      : language === "ja"
      ? ["日付", "タイプ", "カテゴリー", "金額", "口座", "説明"]
      : ["Tanggal", "Tipe", "Kategori", "Jumlah", "Rekening", "Keterangan"];

    const rows = allYearTransactions.map((t) => {
      const cleanDate = (t.date || "").split("T")[0];
      const translatedType = t.type === "expense"
        ? (language === "ja" ? "支出" : language === "en" ? "Expense" : "Pengeluaran")
        : t.type === "income"
        ? (language === "ja" ? "収入" : language === "en" ? "Income" : "Pemasukan")
        : (language === "ja" ? "振替" : language === "en" ? "Transfer" : "Transfer");

      const translatedCat = translateCategory(t.category, language);

      return [
        cleanDate,
        translatedType,
        translatedCat,
        t.amount,
        t.type === "transfer" ? `${t.from_account_name || ""} -> ${t.to_account_name || ""}` : (t.account_name || ""),
        t.description || "",
      ];
    });

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan-keuangan-${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("File CSV berhasil diunduh!");
  }

  return (
    <div className="flex flex-col gap-6 pt-2 pb-10 font-sans text-zinc-900 dark:text-zinc-100">
      {/* HERO BANNER */}
      <div id="tour-hero-banner" className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 size-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 font-heading">
              {getGreeting()}, {userName} <Sparkles size={22} className="text-amber-300 shrink-0" />
            </h1>
            <p className="text-sm text-indigo-100 mt-1">
              {t.dashboard.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold flex items-center gap-2 transition shadow-md cursor-pointer"
            >
              <Download size={14} /> {t.transactions.exportCSV}
            </Button>
          </div>
        </div>

        {/* 4 STAT CARDS */}
        <div id="tour-stats-row" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {/* Total Net Worth */}
          <div id="tour-networth-card" className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="size-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Wallet size={18} />
              </div>
              <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0 border-purple-500/30 text-purple-600 dark:text-purple-300">
                {t.dashboard.netWorthBadge}
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight tabular-nums">
                {formatCurrency(totalBalance)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                {t.dashboard.totalNetWorth}
              </p>
            </div>
          </div>

          {/* Monthly Income */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="size-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={18} />
              </div>
              <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-300">
                {t.dashboard.incomeBadge}
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(thisMonthIncome)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                {t.dashboard.incomeThisMonth}
              </p>
            </div>
          </div>

          {/* Monthly Expense */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="size-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <CreditCard size={18} />
              </div>
              <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0 border-rose-500/30 text-rose-600 dark:text-rose-300">
                {t.dashboard.expenseBadge}
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
                {formatCurrency(thisMonthExpense)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                {t.dashboard.expenseThisMonth}
              </p>
            </div>
          </div>

          {/* Savings */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="size-9 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <PiggyBank size={18} />
              </div>
              <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0 border-blue-500/30 text-blue-600 dark:text-blue-300">
                {t.dashboard.savingsBadge}
              </Badge>
            </div>
            <div className="mt-3">
              <p className={`text-xl sm:text-2xl font-extrabold font-heading tracking-tight tabular-nums ${monthlySavings >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-500"}`}>
                {formatCurrency(monthlySavings)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                {t.dashboard.savingsThisMonth}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: BAR CHART OVERVIEW & CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses Chart (2 cols) */}
        <div id="tour-chart" className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {t.dashboard.expenseChartTitle} {selectedYear}
              </h2>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-heading mt-1 tabular-nums">
                {formatCurrency(totalYearExpense)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400">{t.dashboard.year}:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold bg-background text-foreground outline-none cursor-pointer"
              >
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
              </select>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-1.5 sm:gap-2 pt-6 px-1">
            {barChartData.map((bar) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                {bar.amount > 0 && (
                  <span className="absolute -top-8 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {formatCurrency(bar.amount)}
                  </span>
                )}
                <div
                  className={`w-full rounded-t-lg transition-all ${bar.amount === 0
                    ? "bg-zinc-100 dark:bg-zinc-800/50 min-h-[4px]"
                    : bar.isCurrentMonth
                      ? "bg-indigo-600 shadow-md shadow-indigo-500/30"
                      : "bg-indigo-500/80 group-hover:bg-indigo-600"
                    }`}
                  style={{ height: bar.heightPct }}
                />
                <span className={`text-[11px] font-semibold ${bar.isCurrentMonth ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-zinc-400"}`}>
                  {bar.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown (1 col) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-indigo-600" /> {t.dashboard.topCategory}
              </h2>
            </div>
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white font-heading tabular-nums">
                {formatCurrency(thisMonthExpense)}
              </span>
              <span className="text-xs font-medium text-zinc-500">{t.dashboard.thisMonth}</span>
            </div>

            {/* Category List */}
            {sortedCategories.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400 flex flex-col items-center gap-2">
                <AlertCircle className="size-6 text-zinc-400/50" />
                <span>{t.dashboard.noTransactions}</span>
              </div>
            ) : (
              <div className="space-y-3.5">
                {sortedCategories.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]">{translateCategory(item.name, language)}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-zinc-400">{formatCurrency(item.amount)}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 w-8 text-right font-bold">{item.pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 3: RECENT TRANSACTIONS TABLE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              {t.dashboard.recentTransactions}
            </h2>
            <Link
              href="/transactions"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline ml-2"
            >
              {t.dashboard.viewAll} ➔
            </Link>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 rounded-xl border-zinc-200 dark:border-zinc-800 text-xs"
            />
          </div>
        </div>

        {/* Table */}
        {filteredRecentTx.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            {t.dashboard.noTransactions}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">{t.dashboard.tableDescription}</th>
                  <th className="py-3 px-4">{t.dashboard.tableDate}</th>
                  <th className="py-3 px-4">{t.dashboard.tableAccount}</th>
                  <th className="py-3 px-4">{t.dashboard.tableType}</th>
                  <th className="py-3 px-4 text-right">{t.dashboard.tableAmount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredRecentTx.map((tx) => {
                  const isIncome = tx.type === "income";
                  const isExpense = tx.type === "expense";
                  const isTransfer = tx.type === "transfer";

                  return (
                    <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white max-w-[200px] truncate">
                        {isTransfer ? `${tx.from_account_name || t.dashboard.deletedAccount} ➔ ${tx.to_account_name || t.dashboard.deletedAccount}` : translateCategory(tx.category, language)}
                        {tx.description && <span className="text-zinc-400 font-normal block text-[11px] truncate">{tx.description}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 font-medium">
                        {tx.date}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500">
                        {isTransfer ? (language === "ja" ? "振替" : language === "en" ? "Transfer" : "Transfer") : (tx.account_name || t.dashboard.deletedAccount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${isExpense
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            : isIncome
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                            }`}
                        >
                          {tx.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-extrabold tabular-nums ${isIncome ? "text-emerald-600 dark:text-emerald-400" : isExpense ? "text-rose-600 dark:text-rose-400" : "text-indigo-600"
                        }`}>
                        {isIncome ? "+" : isExpense ? "-" : ""}{formatCurrency(Number(tx.amount))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
