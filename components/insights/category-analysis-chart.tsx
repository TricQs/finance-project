"use client";

import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PieChart as PieChartIcon, ShoppingBag, Info } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { useLanguage } from "@/lib/i18n/context";
import { translateCategory } from "@/lib/i18n/dictionary";

interface CategoryItem {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

interface CategoryAnalysisChartProps {
  categories: CategoryItem[];
  totalExpense: number;
}

export function CategoryAnalysisChart({ categories, totalExpense }: CategoryAnalysisChartProps) {
  const { language } = useLanguage();
  const isId = language === "id";
  const isJa = language === "ja";

  const chartData = useMemo(() => {
    return categories.map((item) => ({
      name: translateCategory(item.category, language),
      rawCategory: item.category,
      value: item.amount,
      percentage: item.percentage,
      count: item.count,
      color: item.color,
    }));
  }, [categories, language]);

  if (categories.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border/50 rounded-3xl">
        <PieChartIcon className="size-8 text-muted-foreground/40" />
        <span>{isJa ? "支出データがありません" : isId ? "Belum ada transaksi pengeluaran" : "No expense transactions recorded"}</span>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover/95 border border-border/60 backdrop-blur-sm p-3 rounded-2xl shadow-lg text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-popover-foreground">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="text-foreground font-extrabold text-sm tabular-nums">
            {formatCurrency(data.value)} ({data.percentage}%)
          </div>
          <div className="text-muted-foreground text-[11px]">
            {data.count} {isJa ? "件の取引" : isId ? "transaksi" : "transactions"}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-3xl bg-background border border-border/50 shadow-xs flex flex-col gap-5">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <PieChartIcon className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {isJa ? "カテゴリ別支出分析" : isId ? "Analisis Pengeluaran per Kategori" : "Expense Analysis by Category"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isJa ? "全カテゴリの支出割合と内訳" : isId ? "Proporsi & Rincian Pengeluaran" : "Expense Proportion & Breakdown"}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          {categories.length} {isJa ? "カテゴリ" : isId ? "Kategori" : "Categories"}
        </span>
      </div>

      {/* Donut Chart View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              {isJa ? "合計支出" : isId ? "TOTAL PENGELUARAN" : "TOTAL EXPENSE"}
            </span>
            <span className="text-sm font-extrabold text-foreground tabular-nums max-w-[120px] truncate">
              {formatCurrency(totalExpense)}
            </span>
          </div>
        </div>

        {/* Top 4 Highlight List */}
        <div className="space-y-3">
          {categories.slice(0, 4).map((item) => (
            <div
              key={item.category}
              className="p-3 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/40 transition flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-foreground truncate">
                    {translateCategory(item.category, language)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {item.count} {isJa ? "件の取引" : isId ? "transaksi" : "transactions"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 ml-2 font-mono">
                <span className="font-extrabold text-foreground">{formatCurrency(item.amount)}</span>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
