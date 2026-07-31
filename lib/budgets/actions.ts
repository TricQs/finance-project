"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface BudgetCategoryItem {
  id: string;
  category: string;
  amount: number; // Limit anggaran
  spent: number; // Akumulasi pengeluaran bulan ini
  remaining: number; // Sisa anggaran (amount - spent)
  percentage: number; // Persentase (spent / amount * 100)
  status: "SAFE" | "WARNING" | "EXCEEDED";
  color: string;
}

export interface BudgetsSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  budgets: BudgetCategoryItem[];
}

export type ActionResult<T> = { success: T } | { error: string };

const CATEGORY_COLORS: Record<string, string> = {
  "Makanan & Minuman": "#f59e0b",
  "Transportasi": "#3b82f6",
  "Belanja": "#ec4899",
  "Hiburan": "#8b5cf6",
  "Tagihan & Utilitas": "#ef4444",
  "Pendidikan": "#10b981",
  "Kesehatan": "#06b6d4",
  "Pajak & Finansial": "#64748b",
  "Lainnya": "#a1a1aa",
};

export async function getBudgets(): Promise<BudgetsSummary> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalBudget: 0,
      totalSpent: 0,
      totalRemaining: 0,
      overallPercentage: 0,
      budgets: [],
    };
  }

  // 1. Ambil daftar anggaran kategori
  const { data: budgetRows, error: bError } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (bError || !budgetRows) {
    console.error("Gagal mengambil data anggaran:", bError?.message);
    return {
      totalBudget: 0,
      totalSpent: 0,
      totalRemaining: 0,
      overallPercentage: 0,
      budgets: [],
    };
  }

  // 2. Hitung total pengeluaran per kategori untuk bulan berjalan ini
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

  const { data: expenses, error: eError } = await supabase
    .from("transactions")
    .select("category, amount")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("date", firstDayOfMonth)
    .is("deleted_at", null);

  const categorySpentMap: Record<string, number> = {};
  if (expenses) {
    expenses.forEach((tx) => {
      categorySpentMap[tx.category] = (categorySpentMap[tx.category] || 0) + Number(tx.amount);
    });
  }

  // 3. Gabungkan data batas anggaran dengan realisasi pengeluaran
  let totalBudget = 0;
  let totalSpent = 0;

  const budgets: BudgetCategoryItem[] = budgetRows.map((b) => {
    const limit = Number(b.amount);
    const spent = categorySpentMap[b.category] || 0;
    const remaining = limit - spent;
    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    totalBudget += limit;
    totalSpent += spent;

    let status: BudgetCategoryItem["status"] = "SAFE";
    if (percentage >= 100) {
      status = "EXCEEDED";
    } else if (percentage >= 70) {
      status = "WARNING";
    }

    return {
      id: b.id,
      category: b.category,
      amount: limit,
      spent,
      remaining,
      percentage,
      status,
      color: CATEGORY_COLORS[b.category] || "#6366f1",
    };
  });

  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return {
    totalBudget,
    totalSpent,
    totalRemaining,
    overallPercentage,
    budgets,
  };
}

export async function upsertBudget(
  category: string,
  amount: number
): Promise<ActionResult<{ success: boolean }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Pengguna tidak terautentikasi" };
  if (!category) return { error: "Kategori harus dipilih" };
  if (amount <= 0) return { error: "Batas anggaran harus lebih dari 0" };

  // Check if budget for category already exists for user
  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", user.id)
    .eq("category", category)
    .single();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  let error;
  if (existing) {
    const { error: updateError } = await supabase
      .from("budgets")
      .update({ 
        amount, 
        period: "monthly",
        year: currentYear,
        month: currentMonth
      })
      .eq("id", existing.id);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from("budgets")
      .insert([
        {
          user_id: user.id,
          category,
          amount,
          period: "monthly",
          year: currentYear,
          month: currentMonth,
        },
      ]);
    error = insertError;
  }

  if (error) {
    console.error("Gagal menyimpan anggaran:", error.message);
    return { error: `Gagal menyimpan: ${error.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/budgets");
  return { success: { success: true } };
}

export async function deleteBudget(id: string): Promise<ActionResult<{ success: boolean }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Gagal menghapus anggaran:", error.message);
    return { error: "Gagal menghapus batas anggaran." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/budgets");
  return { success: { success: true } };
}
