"use server";

import { createClient } from "@/lib/supabase/server";
import { getAccounts } from "@/lib/accounts/actions";
import type { UnifiedTransaction } from "@/lib/transactions/actions";

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface MonthlyCashFlow {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface WalletDistribution {
  id: string;
  name: string;
  balance: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface FinancialInsightsData {
  period: "this_month" | "last_3_months" | "this_year" | "all";
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number; // in percentage (0-100)
  healthStatus: "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL";
  healthScore: number; // 0 - 100
  dailyBurnRate: number;
  projectedMonthEndSavings: number;
  topExpenseCategory: string | null;
  categoryBreakdown: CategoryBreakdown[];
  monthlyCashFlow: MonthlyCashFlow[];
  walletDistribution: WalletDistribution[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Makanan & Minuman": "#f59e0b",
  "Transportasi": "#3b82f6",
  "Belanja": "#ec4899",
  "Hiburan": "#8b5cf6",
  "Tagihan & Utilitas": "#ef4444",
  "Pendidikan": "#10b981",
  "Kesehatan": "#06b6d4",
  "Pajak & Finansial": "#64748b",
  "Gaji & Upah": "#10b981",
  "Investasi & Deviden": "#6366f1",
  "Transfer Masuk": "#0ea5e9",
  "Hadiah & Bonus": "#f43f5e",
  "Usaha / Sampingan": "#84cc16",
  "Lainnya": "#a1a1aa",
};

export async function getInsightsData(
  period: "this_month" | "last_3_months" | "this_year" | "all" = "this_month"
): Promise<FinancialInsightsData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      period,
      totalIncome: 0,
      totalExpense: 0,
      netSavings: 0,
      savingsRate: 0,
      healthStatus: "WARNING",
      healthScore: 50,
      dailyBurnRate: 0,
      projectedMonthEndSavings: 0,
      topExpenseCategory: null,
      categoryBreakdown: [],
      monthlyCashFlow: [],
      walletDistribution: [],
    };
  }

  // 1. Ambil data akun untuk Wallet Distribution
  const accounts = await getAccounts(false);
  const totalNetWorth = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  
  const walletDistribution: WalletDistribution[] = accounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    balance: Number(acc.balance),
    percentage: totalNetWorth > 0 ? Math.round((Number(acc.balance) / totalNetWorth) * 100) : 0,
    color: acc.color,
    icon: acc.icon,
  }));

  // 2. Query data transaksi sesuai periode
  const now = new Date();
  let startDateStr = "";

  if (period === "this_month") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    startDateStr = firstDay.toISOString().split("T")[0];
  } else if (period === "last_3_months") {
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    startDateStr = threeMonthsAgo.toISOString().split("T")[0];
  } else if (period === "this_year") {
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    startDateStr = firstDayOfYear.toISOString().split("T")[0];
  }

  let txQuery = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("date", { ascending: true });

  if (startDateStr) {
    txQuery = txQuery.gte("date", startDateStr);
  }

  const { data: rawTx, error } = await txQuery;

  if (error || !rawTx) {
    console.error("Gagal mengambil data transaksi untuk insights:", error?.message);
    return {
      period,
      totalIncome: 0,
      totalExpense: 0,
      netSavings: 0,
      savingsRate: 0,
      healthStatus: "GOOD",
      healthScore: 70,
      dailyBurnRate: 0,
      projectedMonthEndSavings: totalNetWorth,
      topExpenseCategory: null,
      categoryBreakdown: [],
      monthlyCashFlow: [],
      walletDistribution,
    };
  }

  const transactions = rawTx as UnifiedTransaction[];

  // 3. Akumulasi Pemasukan & Pengeluaran Total
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals: Record<string, { amount: number; count: number }> = {};
  const monthlyDataMap: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((tx) => {
    // Abaikan kategori "Saldo Awal" agar modal awal tidak dihitung sebagai pemasukan gaji/usaha bulanan
    if (tx.category === "Saldo Awal") return;

    const txAmount = Number(tx.amount);
    const txMonth = tx.date.substring(0, 7); // Format: "YYYY-MM"

    if (!monthlyDataMap[txMonth]) {
      monthlyDataMap[txMonth] = { income: 0, expense: 0 };
    }

    if (tx.type === "income") {
      totalIncome += txAmount;
      monthlyDataMap[txMonth].income += txAmount;
    } else if (tx.type === "expense") {
      totalExpense += txAmount;
      monthlyDataMap[txMonth].expense += txAmount;

      // Grouping category
      if (!categoryTotals[tx.category]) {
        categoryTotals[tx.category] = { amount: 0, count: 0 };
      }
      categoryTotals[tx.category].amount += txAmount;
      categoryTotals[tx.category].count += 1;
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.min(100, Math.round((netSavings / totalIncome) * 100))) : 0;

  // 4. Kategori Breakdown
  const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryTotals)
    .map(([cat, data]) => ({
      category: cat,
      amount: data.amount,
      percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
      color: CATEGORY_COLORS[cat] || "#6366f1",
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topExpenseCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].category : null;

  // 5. Monthly Cash Flow Format
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const monthlyCashFlow: MonthlyCashFlow[] = Object.entries(monthlyDataMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([yearMonth, data]) => {
      const [yr, mo] = yearMonth.split("-");
      const monthLabel = `${monthNames[parseInt(mo, 10) - 1]} '${yr.substring(2)}`;
      return {
        month: monthLabel,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      };
    });

  // 6. Proyeksi Akhir Bulan & Daily Burn Rate
  const daysPassed = Math.max(1, now.getDate());
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(0, daysInMonth - daysPassed);

  const dailyBurnRate = Math.round(totalExpense / daysPassed);
  const projectedExtraExpense = dailyBurnRate * daysRemaining;
  const projectedMonthEndSavings = Math.max(0, totalNetWorth - projectedExtraExpense);

  // 7. Health Score Calculation
  let healthScore = 70;
  if (savingsRate >= 40) healthScore = 95;
  else if (savingsRate >= 20) healthScore = 80;
  else if (savingsRate >= 10) healthScore = 65;
  else if (savingsRate > 0) healthScore = 50;
  else healthScore = 30;

  let healthStatus: FinancialInsightsData["healthStatus"] = "GOOD";
  if (healthScore >= 85) healthStatus = "EXCELLENT";
  else if (healthScore >= 65) healthStatus = "GOOD";
  else if (healthScore >= 45) healthStatus = "WARNING";
  else healthStatus = "CRITICAL";

  return {
    period,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    healthStatus,
    healthScore,
    dailyBurnRate,
    projectedMonthEndSavings,
    topExpenseCategory,
    categoryBreakdown,
    monthlyCashFlow,
    walletDistribution,
  };
}
