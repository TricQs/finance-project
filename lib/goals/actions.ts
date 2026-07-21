"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createTransaction } from "@/lib/transactions/actions";
import type { Goal } from "@/types";

type ActionResult<T = any> = { error: string } | { success: T };

export async function getGoals(): Promise<Goal[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal mengambil target tabungan:", error.message);
    return [];
  }

  return data as Goal[];
}

export async function createGoal(
  data: Pick<Goal, "name" | "target_amount" | "target_date" | "icon" | "color">
): Promise<ActionResult<Goal>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const { data: newGoal, error } = await supabase
    .from("goals")
    .insert([
      {
        ...data,
        target_amount: Number(data.target_amount),
        current_amount: 0,
        user_id: user.id,
        is_completed: false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Gagal membuat goal tabungan:", error.message);
    return { error: "Gagal membuat target tabungan baru." };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: newGoal as Goal };
}

export async function addGoalFunds(
  id: string,
  amount: number,
  accountId: string
): Promise<ActionResult<Goal>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  // 1. Ambil data rekening dan target tabungan
  const { data: acc } = await supabase
    .from("accounts")
    .select("balance, name")
    .eq("id", accountId)
    .eq("user_id", user.id)
    .single();

  if (!acc) return { error: "Rekening tidak ditemukan." };
  if (Number(acc.balance) < amount) {
    return { error: `Saldo ${acc.name} tidak mencukupi (Saldo: Rp ${Number(acc.balance).toLocaleString("id-ID")})` };
  }

  const { data: gl } = await supabase
    .from("goals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!gl) return { error: "Target tabungan tidak ditemukan." };

  const newCurrentAmount = Number(gl.current_amount) + amount;
  const isCompleted = newCurrentAmount >= Number(gl.target_amount);

  // 2. Update nominal tabungan terkumpul
  const { data: updatedGoal, error: updateError } = await supabase
    .from("goals")
    .update({
      current_amount: newCurrentAmount,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateError) {
    console.error("Gagal mengupdate dana tabungan:", updateError.message);
    return { error: "Gagal mengalokasikan dana tabungan." };
  }

  // 3. Kurangi saldo rekening via pencatatan transaksi pengeluaran kategori "Tabungan"
  const txResult = await createTransaction({
    account_id: accountId,
    type: "expense",
    amount: amount,
    category: "Investasi & Deviden", // atau sub-kategori Tabungan
    description: `Alokasi Tabungan: ${gl.name}`,
    date: new Date().toISOString().split("T")[0],
    is_recurring: false,
    recurring_interval: null,
  });

  if ("error" in txResult) {
    console.error("Gagal mencatat transaksi alokasi tabungan:", txResult.error);
  }

  revalidatePath("/goals");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { success: updatedGoal as Goal };
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const { error } = await supabase
    .from("goals")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Gagal menghapus goal tabungan:", error.message);
    return { error: "Gagal menghapus target tabungan." };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}
