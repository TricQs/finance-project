"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Transaction, Transfer } from "@/types";

type ActionResult<T = any> = { error: string } | { success: T };

export type UnifiedTransaction = {
  id: string;
  user_id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  category: string;
  description: string | null;
  date: string;
  receipt_url: string | null;
  is_recurring?: boolean;
  recurring_interval?: string | null;
  account_id?: string | null;
  from_account_id?: string | null;
  to_account_id?: string | null;
  account_name?: string;
  from_account_name?: string;
  to_account_name?: string;
  account_color?: string;
  created_at: string;
};

type TransactionFilters = {
  accountId?: string;
  category?: string;
  type?: "income" | "expense" | "transfer";
  startDate?: string;
  endDate?: string;
  search?: string;
};

export async function getTransactions(filters: TransactionFilters = {}): Promise<UnifiedTransaction[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Ambil data akun terlebih dahulu untuk mapping nama & warna
  const { data: accountsData } = await supabase
    .from("accounts")
    .select("id, name, color")
    .eq("user_id", user.id);

  const accountMap = new Map<string, { name: string; color: string }>();
  accountsData?.forEach((acc) => {
    accountMap.set(acc.id, { name: acc.name, color: acc.color });
  });

  let transactions: any[] = [];
  let transfers: any[] = [];

  // 1. QUERY TABEL TRANSACTIONS (Pemasukan & Pengeluaran)
  if (!filters.type || filters.type === "income" || filters.type === "expense") {
    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null);

    if (filters.type) {
      query = query.eq("type", filters.type);
    }
    if (filters.accountId) {
      query = query.eq("account_id", filters.accountId);
    }
    if (filters.category) {
      query = query.eq("category", filters.category);
    }
    if (filters.startDate) {
      query = query.gte("date", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("date", filters.endDate);
    }
    if (filters.search) {
      query = query.ilike("description", `%${filters.search}%`);
    }

    const { data } = await query;
    if (data) transactions = data;
  }

  // 2. QUERY TABEL TRANSFERS
  if (!filters.type || filters.type === "transfer") {
    let query = supabase
      .from("transfers")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null);

    if (filters.accountId) {
      query = query.or(`from_account_id.eq.${filters.accountId},to_account_id.eq.${filters.accountId}`);
    }
    if (filters.startDate) {
      query = query.gte("date", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("date", filters.endDate);
    }
    if (filters.search) {
      query = query.ilike("description", `%${filters.search}%`);
    }

    const { data } = await query;
    if (data) transfers = data;
  }

  // 3. UNIFIKASI DAN MAPPING DATA
  const unifiedTx: UnifiedTransaction[] = [];

  transactions.forEach((tx) => {
    const acc = tx.account_id ? accountMap.get(tx.account_id) : null;
    unifiedTx.push({
      id: tx.id,
      user_id: tx.user_id,
      type: tx.type,
      amount: Number(tx.amount),
      category: tx.category,
      description: tx.description,
      date: tx.date,
      receipt_url: tx.receipt_url,
      is_recurring: tx.is_recurring,
      recurring_interval: tx.recurring_interval,
      account_id: tx.account_id,
      account_name: acc?.name || "Akun Terhapus",
      account_color: acc?.color || "#94a3b8",
      created_at: tx.created_at,
    });
  });

  transfers.forEach((tf) => {
    const fromAcc = tf.from_account_id ? accountMap.get(tf.from_account_id) : null;
    const toAcc = tf.to_account_id ? accountMap.get(tf.to_account_id) : null;
    unifiedTx.push({
      id: tf.id,
      user_id: tf.user_id,
      type: "transfer",
      amount: Number(tf.amount),
      category: "Transfer",
      description: tf.description,
      date: tf.date,
      receipt_url: null,
      from_account_id: tf.from_account_id,
      to_account_id: tf.to_account_id,
      from_account_name: fromAcc?.name || "Akun Terhapus",
      to_account_name: toAcc?.name || "Akun Terhapus",
      account_color: "#6366f1", // Warna default transfer
      created_at: tf.created_at,
    });
  });

  // Urutkan berdasarkan tanggal desc, lalu created_at desc
  return unifiedTx.sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

// 4. UPLOAD RECEIPT KE SUPABASE STORAGE
export async function uploadReceipt(formData: FormData): Promise<string | null> {
  const file = formData.get("file") as File;
  if (!file) return null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

  // Kirim arrayBuffer untuk upload server-side
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from("receipts")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    console.error("Gagal mengunggah resi:", error.message);
    return null;
  }

  return fileName;
}

// 5. DAPATKAN SIGNED URL UNTUK RESI PRIVAT
export async function getReceiptSignedUrl(path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("receipts")
    .createSignedUrl(path, 600); // 10 Menit

  if (error) {
    console.error("Gagal membuat Signed URL:", error.message);
    return null;
  }

  return data?.signedUrl || null;
}

// 6. DELETE FILE RESI DARI STORAGE
async function deleteReceiptFile(path: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage.from("receipts").remove([path]);
  if (error) {
    console.error("Gagal menghapus file resi dari storage:", error.message);
  }
}

// 7. CREATE TRANSACTION
export async function createTransaction(
  data: Pick<Transaction, "account_id" | "type" | "amount" | "category" | "description" | "date" | "is_recurring" | "recurring_interval">,
  receiptPath: string | null = null
): Promise<ActionResult<Transaction>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const { data: newTx, error } = await supabase
    .from("transactions")
    .insert([
      {
        ...data,
        amount: Number(data.amount),
        user_id: user.id,
        receipt_url: receiptPath,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Gagal membuat transaksi:", error.message);
    // Hapus file resi dari storage jika transaksi gagal dibuat agar bersih
    if (receiptPath) {
      await deleteReceiptFile(receiptPath);
    }
    return { error: "Gagal menyimpan transaksi." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  return { success: newTx as Transaction };
}

// 8. UPDATE TRANSACTION
export async function updateTransaction(
  id: string,
  data: Partial<Pick<Transaction, "account_id" | "type" | "amount" | "category" | "description" | "date" | "is_recurring" | "recurring_interval">>,
  newReceiptPath: string | null = null,
  deleteOldReceipt = false
): Promise<ActionResult<Transaction>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  // 1. Dapatkan resi lama jika ada
  let oldReceiptUrl: string | null = null;
  if (deleteOldReceipt || newReceiptPath) {
    const { data: oldTx } = await supabase
      .from("transactions")
      .select("receipt_url")
      .eq("id", id)
      .single();
    if (oldTx) oldReceiptUrl = oldTx.receipt_url;
  }

  const updatePayload: any = { ...data };
  if (data.amount !== undefined) updatePayload.amount = Number(data.amount);
  if (newReceiptPath) updatePayload.receipt_url = newReceiptPath;
  else if (deleteOldReceipt) updatePayload.receipt_url = null;

  const { data: updatedTx, error } = await supabase
    .from("transactions")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Gagal mengupdate transaksi:", error.message);
    if (newReceiptPath) await deleteReceiptFile(newReceiptPath);
    return { error: "Gagal memperbarui transaksi." };
  }

  // Hapus resi lama jika sukses diganti atau dihapus
  if (oldReceiptUrl && (newReceiptPath || deleteOldReceipt)) {
    await deleteReceiptFile(oldReceiptUrl);
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  return { success: updatedTx as Transaction };
}

// 9. DELETE TRANSACTION
export async function deleteTransaction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  // Ambil path resi untuk dihapus nanti
  const { data: tx } = await supabase
    .from("transactions")
    .select("receipt_url")
    .eq("id", id)
    .single();

  // Soft delete transaksi
  const { error } = await supabase
    .from("transactions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Gagal menghapus transaksi:", error.message);
    return { error: "Gagal menghapus transaksi." };
  }

  // Hapus file resi dari storage jika ada
  if (tx?.receipt_url) {
    await deleteReceiptFile(tx.receipt_url);
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  return { success: true };
}

// 10. CREATE TRANSFER
export async function createTransfer(
  data: Pick<Transfer, "from_account_id" | "to_account_id" | "amount" | "description" | "date">
): Promise<ActionResult<Transfer>> {
  if (data.from_account_id === data.to_account_id) {
    return { error: "Akun asal dan akun tujuan tidak boleh sama." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const { data: newTransfer, error } = await supabase
    .from("transfers")
    .insert([
      {
        ...data,
        amount: Number(data.amount),
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Gagal membuat transfer:", error.message);
    return { error: "Gagal mencatat transfer dana." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  return { success: newTransfer as Transfer };
}

// 11. DELETE TRANSFER
export async function deleteTransfer(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const { error } = await supabase
    .from("transfers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Gagal menghapus transfer:", error.message);
    return { error: "Gagal menghapus catatan transfer." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  return { success: true };
}

// 12. BULK DELETE TRANSACTIONS
export async function bulkDeleteTransactions(ids: string[]): Promise<ActionResult> {
  if (!ids.length) return { error: "Tidak ada transaksi yang dipilih." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  // Dapatkan semua path resi
  const { data: receipts } = await supabase
    .from("transactions")
    .select("receipt_url")
    .in("id", ids)
    .eq("user_id", user.id);

  // Soft delete transactions
  const { error } = await supabase
    .from("transactions")
    .update({ deleted_at: new Date().toISOString() })
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) {
    console.error("Gagal melakukan bulk delete transaksi:", error.message);
    return { error: "Gagal menghapus transaksi terpilih." };
  }

  // Hapus semua file resi dari storage secara asinkronus
  const receiptPaths = receipts?.map((r) => r.receipt_url).filter(Boolean) as string[];
  if (receiptPaths && receiptPaths.length > 0) {
    supabase.storage.from("receipts").remove(receiptPaths).catch((err) => {
      console.error("Gagal melakukan bulk delete file resi:", err);
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  return { success: true };
}
