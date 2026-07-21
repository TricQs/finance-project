"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Budget } from "@/types";

type ActionResult<T = any> = { error: string } | { success: T };

export type UnifiedBudget = Budget & {
  spent: number;
};

export async function getBudgets(month: number, year: number): Promise<UnifiedBudget[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // 1. Ambil anggaran di bulan & tahun terpilih
  const { data: budgetsData, error: budgetError } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", month)
    .eq("year", year);

  if (budgetError) {
    console.error("Gagal mengambil anggaran:", budgetError.message);
    return [];
  }

  // 2. Ambil total pengeluaran aktual per kategori di bulan ini
  const startStr = `${year}-${month.toString().padStart(2, "0")}-01`;
  const end = new Date(year, month, 0); // Hari terakhir bulan tersebut
  const endStr = `${year}-${month.toString().padStart(2, "0")}-${end.getDate().toString().padStart(2, "0")}`;

  const { data: expensesData, error: expenseError } = await supabase
    .from("transactions")
    .select("amount, category")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("date", startStr)
    .lte("date", endStr)
    .is("deleted_at", null);

  if (expenseError) {
    console.error("Gagal mengambil data pengeluaran anggaran:", expenseError.message);
  }

  // Hitung total pengeluaran per kategori
  const expenseMap = new Map<string, number>();
  expensesData?.forEach((ex) => {
    const cur = expenseMap.get(ex.category) || 0;
    expenseMap.set(ex.category, cur + Number(ex.amount));
  });

  // 3. Gabungkan anggaran dan jumlah pengeluarannya
  return budgetsData.map((bg) => ({
    ...bg,
    spent: expenseMap.get(bg.category) || 0,
  })) as UnifiedBudget[];
}

export async function createOrUpdateBudget(
  category: string,
  amount: number,
  period: "monthly" | "yearly",
  month: number,
  year: number
): Promise<ActionResult<Budget>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  // Upsert anggaran berdasarkan primary key unik (user_id, category, period, month, year)
  const { data, error } = await supabase
    .from("budgets")
    .upsert({
      user_id: user.id,
      category,
      amount: Number(amount),
      period,
      month,
      year,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,category,period,month,year"
    })
    .select()
    .single();

  if (error) {
    console.error("Gagal menyimpan anggaran:", error.message);
    return { error: "Gagal menyimpan limit anggaran." };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { success: data as Budget };
}

export async function copyPreviousMonthBudget(
  currentMonth: number,
  currentYear: number
): Promise<ActionResult<UnifiedBudget[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  // Hitung bulan lalu
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  // Ambil anggaran bulan lalu
  const { data: prevBudgets, error: fetchError } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", prevMonth)
    .eq("year", prevYear);

  if (fetchError) {
    console.error("Gagal mengambil anggaran bulan lalu:", fetchError.message);
    return { error: "Gagal mengambil data anggaran bulan lalu." };
  }

  if (!prevBudgets || prevBudgets.length === 0) {
    return { error: "Tidak ditemukan data anggaran pada bulan sebelumnya." };
  }

  // Salin ke bulan ini menggunakan upsert
  const newBudgets = prevBudgets.map((bg) => ({
    user_id: user.id,
    category: bg.category,
    amount: Number(bg.amount),
    period: bg.period,
    month: currentMonth,
    year: currentYear,
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase
    .from("budgets")
    .upsert(newBudgets, {
      onConflict: "user_id,category,period,month,year"
    });

  if (upsertError) {
    console.error("Gagal menyalin anggaran:", upsertError.message);
    return { error: "Gagal menyimpan salinan anggaran." };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  
  const updatedBudgets = await getBudgets(currentMonth, currentYear);
  return { success: updatedBudgets };
}

export async function getSuggestedBudget(category: string): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  // Hitung tanggal 90 hari yang lalu
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .eq("category", category)
    .gte("date", ninetyDaysAgoStr)
    .is("deleted_at", null);

  if (error) {
    console.error("Gagal mengambil pengeluaran historis:", error.message);
    return 0;
  }

  const totalSpent = data?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
  // Bagi 3 untuk rata-rata bulanan
  return Number((totalSpent / 3).toFixed(0));
}

export async function deleteBudget(id: string): Promise<ActionResult> {
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
    return { error: "Gagal menghapus limit anggaran." };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { success: true };
}
