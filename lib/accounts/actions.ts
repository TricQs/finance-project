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

  const { data: newAccount, error } = await supabase
    .from("accounts")
    .insert([
      {
        ...data,
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

  // Jika akun dibuat dengan saldo awal, catat sebagai transaksi khusus "Saldo Awal"
  if (Number(data.balance) > 0) {
    const { error: txError } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: user.id,
          account_id: newAccount.id,
          type: "income",
          amount: Number(data.balance),
          category: "Saldo Awal",
          description: `Saldo awal untuk akun ${data.name}`,
          date: new Date().toISOString().split("T")[0],
          is_recurring: false,
        },
      ]);

    if (txError) {
      console.error("Gagal mencatat transaksi saldo awal:", txError.message);
    }
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

export async function deleteAccount(id: string): Promise<ActionResult<{ archived: boolean }>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  // 1. Cek apakah ada transaksi yang berkaitan dengan akun ini
  const { count: txCount, error: txError } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("account_id", id)
    .eq("user_id", user.id);

  if (txError) {
    console.error("Gagal mengecek transaksi terkait akun:", txError.message);
    return { error: "Terjadi kesalahan keamanan saat memeriksa keterkaitan transaksi." };
  }

  // 2. Cek apakah ada transfer yang menggunakan akun ini
  const { data: transfers, error: tfError } = await supabase
    .from("transfers")
    .select("id")
    .or(`from_account_id.eq.${id},to_account_id.eq.${id}`)
    .eq("user_id", user.id)
    .limit(1);

  if (tfError) {
    console.error("Gagal mengecek transfer terkait akun:", tfError.message);
    return { error: "Terjadi kesalahan saat memeriksa keterkaitan transfer." };
  }

  const hasRelations = (txCount && txCount > 0) || (transfers && transfers.length > 0);

  if (hasRelations) {
    // Soft delete (Arsipkan) jika ada histori keuangan
    const { error: archiveError } = await supabase
      .from("accounts")
      .update({ is_active: false })
      .eq("id", id)
      .eq("user_id", user.id);

    if (archiveError) {
      console.error("Gagal mengarsipkan akun:", archiveError.message);
      return { error: "Gagal mengarsipkan akun." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/accounts");
    return { success: { archived: true } };
  } else {
    // Hard delete permanen jika akun bersih dari histori keuangan
    const { error: deleteError } = await supabase
      .from("accounts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Gagal menghapus akun permanen:", deleteError.message);
      return { error: "Gagal menghapus akun secara permanen." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/accounts");
    return { success: { archived: false } };
  }
}
