"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Account } from "@/types";

type ActionResult<T = any> = { error: string } | { success: T };

export async function getAccounts(includeArchived = false): Promise<Account[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!includeArchived) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Gagal mengambil data akun:", error.message);
    return [];
  }

  return data as Account[];
}

export async function createAccount(
  data: Pick<Account, "name" | "type" | "institution" | "account_number" | "balance" | "currency" | "color" | "icon">
): Promise<ActionResult<Account>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const initialBalance = Number(data.balance) || 0;

  const { data: newAccount, error } = await supabase
    .from("accounts")
    .insert([
      {
        name: data.name,
        type: data.type,
        institution: data.institution || null,
        account_number: data.account_number || null,
        currency: data.currency || "IDR",
        color: data.color,
        icon: data.icon,
        balance: initialBalance,
        user_id: user.id,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Gagal membuat akun:", error.message);
    return { error: "Gagal membuat akun baru." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  return { success: newAccount as Account };
}

export async function updateAccount(
  id: string,
  data: Partial<Pick<Account, "name" | "type" | "institution" | "account_number" | "currency" | "color" | "icon" | "is_active">>
): Promise<ActionResult<Account>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const { data: updatedAccount, error } = await supabase
    .from("accounts")
    .update(data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Gagal memperbarui akun:", error.message);
    return { error: "Gagal memperbarui informasi akun." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  return { success: updatedAccount as Account };
}

export async function deleteAccount(id: string): Promise<ActionResult<{ success: boolean }>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  // Hard delete permanen langsung dari Database (Cascade delete transaksi terkait)
  const { error: deleteError } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("Gagal menghapus akun permanen:", deleteError.message);
    return { error: "Gagal menghapus akun secara permanen dari Database." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  return { success: true };
}

export async function bulkDeleteAccounts(ids: string[]): Promise<ActionResult<{ success: boolean }>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  if (!ids || ids.length === 0) return { success: true };

  const { error } = await supabase
    .from("accounts")
    .delete()
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) {
    console.error("Gagal menghapus massal akun:", error.message);
    return { error: "Gagal menghapus beberapa akun sekaligus." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  return { success: true };
}

export async function bulkArchiveAccounts(ids: string[], is_active: boolean): Promise<ActionResult<{ success: boolean }>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  if (!ids || ids.length === 0) return { success: true };

  const { error } = await supabase
    .from("accounts")
    .update({ is_active })
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) {
    console.error("Gagal mengubah status arsip massal akun:", error.message);
    return { error: "Gagal memperbarui status beberapa akun." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  return { success: true };
}
