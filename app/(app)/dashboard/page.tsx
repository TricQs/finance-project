import { ArrowUpRight, TrendingDown, TrendingUp, Wallet } from "lucide-react"

import { WeeklyBarChart } from "@/components/dashboard/weekly-bar-chart"
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown"
import { formatCurrency } from "@/lib/format-currency"
import {
  DUMMY_WEEKLY_DATA,
  DUMMY_CATEGORY_BREAKDOWN,
  DUMMY_SUMMARY,
} from "@/lib/dummy-dashboard-data"

export default function DashboardPage() {
  const {
    totalBalance,
    balanceChangePercent,
    totalIncomeThisMonth,
    totalExpenseThisMonth,
  } = DUMMY_SUMMARY

  return (
    <div className="flex flex-col gap-6 pt-2">
      {/* Row 1: Balance + weekly chart */}
      <div className="neu-raised-lg rounded-3xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="neu-raised-sm flex size-14 shrink-0 items-center justify-center rounded-2xl text-primary">
              <Wallet className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-bold tabular-nums text-foreground">
                {formatCurrency(totalBalance)}
              </span>
              <span className="text-sm text-muted-foreground">
                Total saldo semua akun
              </span>
            </div>
          </div>

          <span className="neu-raised-sm flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-(--income)">
            <ArrowUpRight className="size-4" />
            +{balanceChangePercent}%
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="size-4 text-(--income)" />
            Pemasukan bulan ini:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(totalIncomeThisMonth)}
            </span>
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <TrendingDown className="size-4 text-(--expense)" />
            Pengeluaran bulan ini:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(totalExpenseThisMonth)}
            </span>
          </span>
        </div>

        <div className="mt-6">
          <WeeklyBarChart data={DUMMY_WEEKLY_DATA} />
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-(--income)" />
            Pemasukan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-(--expense)" />
            Pengeluaran
          </span>
        </div>
      </div>

      {/* Row 2: Category breakdown */}
      <div className="neu-raised-lg rounded-3xl p-6">
        <h2 className="font-heading mb-4 text-base font-semibold text-foreground">
          Pengeluaran per Kategori
        </h2>
        <CategoryBreakdown data={DUMMY_CATEGORY_BREAKDOWN} />
      </div>
    </div>
  )
}