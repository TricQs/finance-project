'use client';

import React, { useMemo } from 'react';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { TrendingDown, TrendingUp, Wallet, CreditCard, PiggyBank, ArrowUpDown } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/format-currency';
import { useLanguage } from '@/lib/i18n/context';
import type { UnifiedTransaction } from '@/lib/transactions/actions';

const chartConfig = {
  income: {
    label: 'Income',
    color: 'oklch(72.3% 0.219 149.579)',
  },
  expense: {
    label: 'Expense',
    color: 'oklch(63.7% 0.237 25.331)',
  },
  savings: {
    label: 'Savings',
    color: 'oklch(62.3% 0.214 259.815)',
  },
} satisfies ChartConfig;

interface AnnualExpenseChartProps {
  transactions: UnifiedTransaction[];
  selectedYear: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

const stageMetrics = [
  { key: 'income' as const, icon: Wallet, color: chartConfig.income.color },
  { key: 'expense' as const, icon: CreditCard, color: chartConfig.expense.color },
  { key: 'savings' as const, icon: PiggyBank, color: chartConfig.savings.color },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

export function AnnualExpenseChart({ transactions, selectedYear }: AnnualExpenseChartProps) {
  const { t, language } = useLanguage();

  const monthNames = useMemo(() => {
    if (language === 'ja') return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    if (language === 'en') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  }, [language]);

  const labels = useMemo(() => ({
    income: language === 'ja' ? '収入' : language === 'en' ? 'Income' : 'Pemasukan',
    expense: language === 'ja' ? '支出' : language === 'en' ? 'Expense' : 'Pengeluaran',
    savings: language === 'ja' ? '貯蓄' : language === 'en' ? 'Savings' : 'Tabungan',
  }), [language]);

  const chartData: MonthlyData[] = useMemo(() => {
    const monthlyIncome = new Array(12).fill(0);
    const monthlyExpense = new Array(12).fill(0);

    transactions.forEach((tx) => {
      if (tx.category === 'Saldo Awal' || tx.category === 'Initial Balance') return;
      const txYear = parseInt(tx.date.substring(0, 4), 10);
      if (txYear !== selectedYear) return;

      const txMonthIndex = parseInt(tx.date.substring(5, 7), 10) - 1;
      if (txMonthIndex < 0 || txMonthIndex >= 12) return;

      if (tx.type === 'income') monthlyIncome[txMonthIndex] += Number(tx.amount);
      else if (tx.type === 'expense') monthlyExpense[txMonthIndex] += Number(tx.amount);
    });

    return monthNames.map((month, idx) => ({
      month,
      income: monthlyIncome[idx],
      expense: monthlyExpense[idx],
      savings: monthlyIncome[idx] - monthlyExpense[idx],
    }));
  }, [transactions, selectedYear, monthNames]);

  // Totals
  const totals = useMemo(() => {
    const totalIncome = chartData.reduce((s, d) => s + d.income, 0);
    const totalExpense = chartData.reduce((s, d) => s + d.expense, 0);
    const totalSavings = totalIncome - totalExpense;
    return { totalIncome, totalExpense, totalSavings };
  }, [chartData]);

  // Percentage change vs previous year (simplified: compare first half vs second half trend)
  const getChangeVsPrevHalf = (key: 'income' | 'expense' | 'savings') => {
    const firstHalf = chartData.slice(0, 6).reduce((s, d) => s + d[key], 0);
    const secondHalf = chartData.slice(6, 12).reduce((s, d) => s + d[key], 0);
    if (firstHalf === 0) return secondHalf > 0 ? 100 : 0;
    return Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-4 shadow-lg min-w-[200px]">
          <div className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            {label} {selectedYear}
          </div>
          <div className="space-y-2">
            {stageMetrics.map((stage) => {
              const dataPoint = payload.find((p) => p.dataKey === stage.key);
              const value = dataPoint?.value || 0;

              return (
                <div key={stage.key} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-sm" style={{ backgroundColor: stage.color }} />
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{labels[stage.key]}</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white tabular-nums">
                    {formatCurrency(value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stageMetrics.map((stage) => {
          const value = totals[
            stage.key === 'income' ? 'totalIncome' : stage.key === 'expense' ? 'totalExpense' : 'totalSavings'
          ];
          const change = getChangeVsPrevHalf(stage.key);

          return (
            <div key={stage.key} className="flex items-center gap-3">
              <div className="w-0.5 h-10 rounded-full" style={{ backgroundColor: stage.color, opacity: 0.6 }} />
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  {labels[stage.key]}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums leading-none">
                    {formatCurrency(value)}
                  </span>
                  {change !== 0 && (
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${
                        (stage.key === 'expense' ? change <= 0 : change >= 0)
                          ? 'text-emerald-500'
                          : 'text-rose-500'
                      }`}
                    >
                      {change >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                      {Math.abs(change)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Area Chart */}
      <ChartContainer
        config={chartConfig}
        className="h-[280px] sm:h-[320px] w-full [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
      >
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <defs>
            <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillSavings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-savings)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="var(--color-savings)" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} strokeOpacity={0.3} />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={{ textAnchor: 'middle', fontSize: 11 }}
            interval={0}
          />

          <YAxis hide />

          <ChartTooltip
            cursor={{
              strokeDasharray: '4 4',
              stroke: 'oklch(62.3% 0.214 259.815)',
              strokeWidth: 1,
              strokeOpacity: 0.5,
            }}
            content={<CustomTooltip />}
            offset={16}
          />

          <Area
            dataKey="income"
            type="natural"
            fill="url(#fillIncome)"
            fillOpacity={0.4}
            stroke="var(--color-income)"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: 'var(--color-income)',
              stroke: 'white',
              strokeWidth: 2,
            }}
          />
          <Area
            dataKey="expense"
            type="natural"
            fill="url(#fillExpense)"
            fillOpacity={0.4}
            stroke="var(--color-expense)"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: 'var(--color-expense)',
              stroke: 'white',
              strokeWidth: 2,
            }}
          />
          <Area
            dataKey="savings"
            type="natural"
            fill="url(#fillSavings)"
            fillOpacity={0.3}
            stroke="var(--color-savings)"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
            activeDot={{
              r: 3,
              fill: 'var(--color-savings)',
              stroke: 'white',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ChartContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 -mt-2">
        {stageMetrics.map((stage) => (
          <div key={stage.key} className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm" style={{ backgroundColor: stage.color }} />
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              {labels[stage.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
