import { ArrowUpRight, TrendingDown, TrendingUp, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WeeklyBarChart } from "@/components/dashboard/weekly-bar-chart";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { formatCurrency } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";

export const revalidate = 0; // Disable static caching so it loads real-time data

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 1. QUERY TOTAL BALANCES DARI ACCOUNTS
  const { data: accounts } = await supabase
    .from("accounts")
    .select("balance")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .is("deleted_at", null);

  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;

  // TANGGAL PENENTU
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];

  // 2. QUERY PEMASUKAN & PENGELUARAN BULAN INI
  const { data: thisMonthTx } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", user.id)
    .gte("date", startOfThisMonth)
    .is("deleted_at", null);

  let totalIncomeThisMonth = 0;
  let totalExpenseThisMonth = 0;

  thisMonthTx?.forEach((tx) => {
    if (tx.type === "income") totalIncomeThisMonth += Number(tx.amount);
    else if (tx.type === "expense") totalExpenseThisMonth += Number(tx.amount);
  });

  // 3. QUERY PEMASUKAN & PENGELUARAN BULAN LALU (untuk persentase tren)
  const { data: lastMonthTx } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", user.id)
    .gte("date", startOfLastMonth)
    .lte("date", endOfLastMonth)
    .is("deleted_at", null);

  let totalIncomeLastMonth = 0;
  let totalExpenseLastMonth = 0;

  lastMonthTx?.forEach((tx) => {
    if (tx.type === "income") totalIncomeLastMonth += Number(tx.amount);
    else if (tx.type === "expense") totalExpenseLastMonth += Number(tx.amount);
  });

  // PERHITUNGAN TREN PERSENTASE (Pencegahan Divide by Zero)
  const lastMonthNet = totalIncomeLastMonth - totalExpenseLastMonth;
  const thisMonthNet = totalIncomeThisMonth - totalExpenseThisMonth;

  let balanceChangePercent = 0;
  if (lastMonthNet === 0) {
    balanceChangePercent = thisMonthNet > 0 ? 100 : 0;
  } else {
    balanceChangePercent = Number((((thisMonthNet - lastMonthNet) / Math.abs(lastMonthNet)) * 100).toFixed(1));
  }

  // 4. QUERY MINGGUAN (7 Hari Terakhir)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  const { data: weeklyTx } = await supabase
    .from("transactions")
    .select("amount, type, date")
    .eq("user_id", user.id)
    .gte("date", sevenDaysAgoStr)
    .is("deleted_at", null);

  // Buat array 7 hari terakhir
  const weeklyDataMap = new Map<string, { income: number; expense: number }>();
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    weeklyDataMap.set(dateStr, { income: 0, expense: 0 });
  }

  weeklyTx?.forEach((tx) => {
    const dayData = weeklyDataMap.get(tx.date);
    if (dayData) {
      if (tx.type === "income") dayData.income += Number(tx.amount);
      else if (tx.type === "expense") dayData.expense += Number(tx.amount);
    }
  });

  const weeklyData = Array.from(weeklyDataMap.entries())
    .map(([dateStr, val]) => {
      const dayIndex = new Date(dateStr).getDay();
      return {
        day: DAY_NAMES[dayIndex],
        income: val.income,
        expense: val.expense,
        timestamp: new Date(dateStr).getTime() // untuk sorting chronological
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(({ day, income, expense }) => ({ day, income, expense }));

  // 5. QUERY PENGELUARAN PER KATEGORI (Bulan Ini)
  const { data: categoryTx } = await supabase
    .from("transactions")
    .select("amount, category")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("date", startOfThisMonth)
    .is("deleted_at", null);

  const categoryMap = new Map<string, number>();
  categoryTx?.forEach((tx) => {
    const cur = categoryMap.get(tx.category) || 0;
    categoryMap.set(tx.category, cur + Number(tx.amount));
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, amount], index) => ({
      category,
      amount,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount);

  // 6. APAKAH USER BELUM PUNYA DATA TRANSAKSI SAMA SEKALI? (Empty State)
  const hasNoData = totalBalance === 0 && (thisMonthTx?.length || 0) === 0;

  if (hasNoData) {
    return (
      <div className="flex flex-col gap-6 pt-2 font-sans">
        <div className="neu-raised-lg rounded-3xl p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-border/50 bg-background">
          <div className="size-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-primary mb-4">
            <Wallet className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Selamat Datang di Uangku!</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-8">
            Dompet pintar Anda sudah terintegrasi. Mulailah dengan membuat akun rekening pertama Anda, lalu catat pemasukan atau pengeluaran perdana Anda.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/accounts">
              <Button className="rounded-2xl gap-2 cursor-pointer">
                Buat Rekening Baru
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-2 font-sans">
      {/* Row 1: Balance + weekly chart */}
      <div className="neu-raised-lg rounded-3xl p-6 sm:p-7 bg-background">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-13 shrink-0 flex items-center justify-center rounded-2xl text-primary bg-primary/10 border border-primary/20 shadow-sm">
              <Wallet className="size-6" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-4xl font-extrabold tabular-nums text-foreground tracking-tight">
                {formatCurrency(totalBalance)}
              </span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                Total saldo rekening aktif
              </span>
            </div>
          </div>

          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border transition-colors ${
            balanceChangePercent >= 0 
              ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
              : "text-red-500 bg-red-500/10 border-red-500/20"
          }`}>
            <ArrowUpRight className={`size-4 ${balanceChangePercent < 0 && "rotate-90"}`} />
            {balanceChangePercent >= 0 ? `+${balanceChangePercent}` : balanceChangePercent}% m-o-m
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-4 text-xs font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="size-4 text-emerald-500" />
            Pemasukan bulan ini:{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(totalIncomeThisMonth)}
            </span>
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <TrendingDown className="size-4 text-red-500" />
            Pengeluaran bulan ini:{" "}
            <span className="font-bold text-red-600 dark:text-red-400 tabular-nums">
              {formatCurrency(totalExpenseThisMonth)}
            </span>
          </span>
        </div>

        {/* Weekly Chart */}
        <div className="mt-8">
          <WeeklyBarChart data={weeklyData} />
        </div>

        <div className="mt-5 flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            Pemasukan (7 Hari Terakhir)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-red-500" />
            Pengeluaran
          </span>
        </div>
      </div>

      {/* Row 2: Category breakdown */}
      <div className="neu-raised-lg rounded-3xl p-6 bg-background">
        <h2 className="font-heading mb-5 text-sm font-bold text-muted-foreground uppercase tracking-wider text-left">
          Pengeluaran per Kategori (Bulan Ini)
        </h2>
        {categoryBreakdown.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Belum ada catatan pengeluaran di bulan ini.
          </div>
        ) : (
          <CategoryBreakdown data={categoryBreakdown} />
        )}
      </div>
    </div>
  );
}