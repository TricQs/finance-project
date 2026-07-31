"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  BarChart2, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Flame, 
  PiggyBank, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getInsightsData, FinancialInsightsData } from "@/lib/insights/actions";
import { motion } from "framer-motion";

import { useLanguage } from "@/lib/i18n/context";
import { translateCategory } from "@/lib/i18n/dictionary";

interface InsightsClientPageProps {
  initialData: FinancialInsightsData;
}

export function InsightsClientPage({ initialData }: InsightsClientPageProps) {
  const { t, language } = useLanguage();
  const [data, setData] = useState<FinancialInsightsData>(initialData);
  const [loading, setLoading] = useState(false);

  async function handlePeriodChange(newPeriod: "this_month" | "last_3_months" | "this_year" | "all") {
    setLoading(true);
    const updated = await getInsightsData(newPeriod);
    setData(updated);
    setLoading(false);
  }

  // Configuration for Health Badge
  const HEALTH_CONFIG = {
    EXCELLENT: {
      label: t.insights.excellent,
      badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
      bgGradient: "from-emerald-500 to-teal-700",
      icon: ShieldCheck,
      desc: t.insights.excellentDesc,
    },
    GOOD: {
      label: t.insights.healthy,
      badgeClass: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400",
      bgGradient: "from-indigo-600 to-blue-700",
      icon: ShieldCheck,
      desc: t.insights.healthyDesc,
    },
    WARNING: {
      label: t.insights.needsAttention,
      badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
      bgGradient: "from-amber-500 to-orange-600",
      icon: AlertTriangle,
      desc: t.insights.needsAttentionDesc,
    },
    CRITICAL: {
      label: t.insights.needsAttention,
      badgeClass: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
      bgGradient: "from-red-600 to-rose-700",
      icon: AlertTriangle,
      desc: t.insights.needsAttentionDesc,
    },
  }[data.healthStatus];

  const HealthIcon = HEALTH_CONFIG.icon;

  return (
    <div className="flex flex-col gap-6 pt-2 font-sans pb-10">
      {/* HEADER BANNER & HEALTH SCORE */}
      <div 
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl bg-gradient-to-br ${HEALTH_CONFIG.bgGradient}`}
      >
        <div className="absolute right-0 top-0 size-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-md rounded-full px-3 py-1 text-xs font-semibold tracking-wider">
                FINANCIAL INSIGHTS & HEALTH
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Kondisi Keuangan: {HEALTH_CONFIG.label}
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              {HEALTH_CONFIG.desc}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 self-start md:self-auto shrink-0">
            <div className="relative size-16 flex items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-white"
                  strokeDasharray={`${data.healthScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-lg font-black">{data.healthScore}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white/70 font-medium uppercase tracking-wider">{t.insights.healthScore}</span>
              <span className="text-base font-bold">{t.insights.savingsRate}: {data.savingsRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER PERIODE */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <span>{t.insights.flowAnalysis}</span>
        </h2>

        <div className="flex items-center gap-1.5 bg-muted p-1 rounded-2xl border border-border/40">
          {[
            { id: "this_month", label: t.insights.periodThisMonth },
            { id: "last_3_months", label: t.insights.period3Months },
            { id: "this_year", label: t.insights.periodThisYear },
            { id: "all", label: t.insights.periodAll },
          ].map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => handlePeriodChange(item.id as any)}
              disabled={loading}
              className={`rounded-xl text-xs font-semibold px-3 py-1.5 transition-all cursor-pointer ${
                data.period === item.id 
                  ? "bg-background text-foreground shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-3xl bg-background border border-border/50 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.insights.totalIncome}</span>
            <div className="size-9 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ArrowUpRight className="size-5" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-foreground tabular-nums">
            {formatCurrency(data.totalIncome)}
          </span>
        </div>

        {/* Total Expense */}
        <div className="p-5 rounded-3xl bg-background border border-border/50 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.insights.totalExpense}</span>
            <div className="size-9 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <ArrowDownRight className="size-5" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-foreground tabular-nums">
            {formatCurrency(data.totalExpense)}
          </span>
        </div>

        {/* Net Savings */}
        <div className="p-5 rounded-3xl bg-background border border-border/50 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.insights.netSavings}</span>
            <div className="size-9 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <PiggyBank className="size-5" />
            </div>
          </div>
          <span className={`text-2xl font-extrabold tabular-nums ${data.netSavings >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {formatCurrency(data.netSavings)}
          </span>
        </div>
      </div>

      {/* GRID KONTEN UTAMA: CATEGORY BREAKDOWN & PROJECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KATEGORI PENGELUARAN BREAKDOWN */}
        <div className="p-6 rounded-3xl bg-background border border-border/50 shadow-xs space-y-5 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChartIcon className="size-5 text-indigo-500" />
              <h3 className="text-base font-bold text-foreground">{t.insights.topExpenseCategory}</h3>
            </div>
            <span className="text-xs text-muted-foreground">{data.categoryBreakdown.length} {t.insights.categoryCount}</span>
          </div>

          {data.categoryBreakdown.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
              <PieChartIcon className="size-8 text-muted-foreground/40" />
              <span>{t.dashboard.noTransactions}</span>
            </div>
          ) : (
            <div className="space-y-4">
              {data.categoryBreakdown.map((item) => (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      {translateCategory(item.category, language)}
                      <span className="text-[10px] text-muted-foreground font-normal">({item.count} {t.insights.transactionCount})</span>
                    </span>
                    <div className="flex items-center gap-2 font-bold tabular-nums">
                      <span className="text-foreground">{formatCurrency(item.amount)}</span>
                      <span className="text-muted-foreground w-8 text-right">{item.percentage}%</span>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2 rounded-full" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SMART FINANCIAL FORECAST & BURN RATE */}
        <div className="space-y-6">
          {/* Daily Burn Rate Card */}
          <div className="p-6 rounded-3xl bg-background border border-border/50 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Flame className="size-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-foreground">{t.insights.dailyBurnRate}</h3>
                <span className="text-xs text-muted-foreground">{t.insights.dailyBurnDesc}</span>
              </div>
            </div>
            <div className="pt-1 flex items-baseline justify-between border-t border-border/40">
              <span className="text-xs text-muted-foreground">{t.insights.dailyAverage}:</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                {formatCurrency(data.dailyBurnRate)} <span className="text-xs text-muted-foreground font-medium">{t.insights.perDay}</span>
              </span>
            </div>
          </div>

          {/* Month-End Projected Savings */}
          <div className="p-6 rounded-3xl bg-background border border-border/50 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <BarChart2 className="size-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-foreground">{t.insights.endOfMonthProjection}</h3>
                <span className="text-xs text-muted-foreground">{t.insights.projectionDesc}</span>
              </div>
            </div>
            <div className="pt-1 flex items-baseline justify-between border-t border-border/40">
              <span className="text-xs text-muted-foreground">{t.insights.estimatedBalance}:</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(data.projectedMonthEndSavings)}
              </span>
            </div>
          </div>

          {/* Top Category Highlight Card */}
          {data.topExpenseCategory && (
            <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-foreground flex items-center gap-3">
              <Sparkles className="size-6 text-indigo-500 shrink-0" />
              <p className="leading-relaxed">
                {t.insights.topCategoryHighlight.replace("{cat}", translateCategory(data.topExpenseCategory, language))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* WALLET DISTRIBUTION (DISTRIBUSI REKENING) */}
      <div className="p-6 rounded-3xl bg-background border border-border/50 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="size-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">{t.insights.walletDistribution}</h3>
        </div>

        {data.walletDistribution.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t.accounts.emptyState}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.walletDistribution.map((item) => (
              <div key={item.name} className="p-4 rounded-2xl border border-border/40 bg-muted/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-foreground truncate">{item.name}</span>
                  <span className="text-primary">{item.percentage}%</span>
                </div>
                <Progress value={item.percentage} className="h-1.5 rounded-full" />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>{t.accounts.balance}</span>
                  <span className="font-bold text-foreground tabular-nums">{formatCurrency(item.balance)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
