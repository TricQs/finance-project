"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Debt } from "@/types";

type ActionResult<T = unknown> = { error: string } | { success: T };

export async function getDebts(type?: "debt" | "receivable"): Promise<Debt[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("debts")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("due_date", { ascending: true });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Gagal mengambil data hutang/piutang:", error.message);
    return [];
  }

  return data as Debt[];
}

export async function createDebt(
  data: Pick<Debt, "type" | "contact_name" | "original_amount" | "due_date" | "description">
): Promise<ActionResult<Debt>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const { data: newDebt, error } = await supabase
    .from("debts")
    .insert([
      {
        ...data,
        original_amount: Number(data.original_amount),
        remaining_amount: Number(data.original_amount),
        user_id: user.id,
        is_settled: false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Gagal mencatat hutang/piutang:", error.message);
    return { error: "Gagal menyimpan catatan hutang/piutang." };
  }

  revalidatePath("/debts");
  revalidatePath("/dashboard");
  return { success: newDebt as Debt };
}

export async function addDebtPayment(id: string, amount: number): Promise<ActionResult<Debt>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  // 1. Ambil data hutang lama
  const { data: dt } = await supabase
    .from("debts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!dt) return { error: "Catatan tidak ditemukan." };

  const newRemainingAmount = Math.max(0, Number(dt.remaining_amount) - amount);
  const isSettled = newRemainingAmount === 0;

  // 2. Update cicilan
  const { data: updatedDebt, error } = await supabase
    .from("debts")
    .update({
      remaining_amount: newRemainingAmount,
      is_settled: isSettled,
      settled_at: isSettled ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Gagal mencatat pembayaran cicilan:", error.message);
    return { error: "Gagal mencatat cicilan." };
  }

  revalidatePath("/debts");
  return { success: updatedDebt as Debt };
}

export async function settleDebt(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const { error } = await supabase
    .from("debts")
    .update({
      remaining_amount: 0,
      is_settled: true,
      settled_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Gagal melunasi utang/piutang:", error.message);
    return { error: "Gagal melunasi catatan." };
  }

  revalidatePath("/debts");
  return { success: true };
}

export async function deleteDebt(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const { error } = await supabase
    .from("debts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Gagal menghapus catatan:", error.message);
    return { error: "Gagal menghapus catatan." };
  }

  revalidatePath("/debts");
  return { success: true };
}
