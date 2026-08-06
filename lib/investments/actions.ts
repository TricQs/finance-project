"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createTransaction } from "@/lib/transactions/actions";
import type { Investment } from "@/types";

type ActionResult<T = unknown> = { error: string } | { success: T };

export async function getInvestments(): Promise<Investment[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("buy_date", { ascending: false });

  if (error) {
    console.error("Gagal mengambil data investasi:", error.message);
    return [];
  }

  return data as Investment[];
}

export async function recordBuy(
  data: Pick<Investment, "type" | "name" | "ticker" | "platform" | "quantity" | "buy_price" | "buy_date" | "notes">,
  accountId?: string
): Promise<ActionResult<Investment>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const totalCost = Number(data.quantity) * Number(data.buy_price);

  // Jika accountId disertakan, periksa saldo rekening
  if (accountId) {
    const { data: acc } = await supabase
      .from("accounts")
      .select("balance, name")
      .eq("id", accountId)
      .eq("user_id", user.id)
      .single();

    if (!acc) return { error: "Rekening asal tidak ditemukan." };
    if (Number(acc.balance) < totalCost) {
      return { error: `Saldo ${acc.name} tidak mencukupi untuk pembelian ini (Dibutuhkan: Rp ${totalCost.toLocaleString("id-ID")})` };
    }
  }

  // Cek apakah aset dengan ticker sama sudah dimiliki (hanya untuk saham/crypto yang belum dijual)
  let existingAsset: Investment | null = null;
  if (data.ticker) {
    const { data: asset } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", user.id)
      .eq("ticker", data.ticker)
      .eq("is_sold", false)
      .is("deleted_at", null)
      .limit(1);

    if (asset && asset.length > 0) {
      existingAsset = asset[0];
    }
  }

  let finalAsset: Investment;

  if (existingAsset) {
    // 1. Rekalkulasi Harga Rata-Rata (Avg Buy Price)
    const oldQty = Number(existingAsset.quantity);
    const oldPrice = Number(existingAsset.buy_price);
    const newQty = oldQty + Number(data.quantity);
    
    const newAvgPrice = ((oldQty * oldPrice) + totalCost) / newQty;

    const { data: updated, error: updateError } = await supabase
      .from("investments")
      .update({
        quantity: newQty,
        buy_price: Number(newAvgPrice.toFixed(4)),
        platform: data.platform || existingAsset.platform,
        notes: data.notes || existingAsset.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingAsset.id)
      .select()
      .single();

    if (updateError) {
      console.error("Gagal memperbarui portofolio aset:", updateError.message);
      return { error: "Gagal memperbarui harga rata-rata aset." };
    }
    finalAsset = updated as Investment;
  } else {
    // 2. Buat record investasi baru
    const { data: inserted, error: insertError } = await supabase
      .from("investments")
      .insert([
        {
          ...data,
          quantity: Number(data.quantity),
          buy_price: Number(data.buy_price),
          user_id: user.id,
          is_sold: false,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Gagal mencatat investasi baru:", insertError.message);
      return { error: "Gagal menyimpan investasi baru." };
    }
    finalAsset = inserted as Investment;
  }

  // 3. Catat transaksi pengeluaran (kategori Investasi) jika rekening asal diset
  if (accountId) {
    const txResult = await createTransaction({
      account_id: accountId,
      type: "expense",
      amount: totalCost,
      category: "Investasi & Deviden",
      description: `Beli Investasi: ${data.name} (${data.ticker || ""})`,
      date: data.buy_date,
      is_recurring: false,
      recurring_interval: null,
    });

    if ("error" in txResult) {
      console.error("Gagal mencatat mutasi pengeluaran beli investasi:", txResult.error);
    }
  }

  revalidatePath("/investments");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { success: finalAsset };
}

export async function recordSell(
  id: string,
  sellQty: number,
  sellPrice: number,
  sellDate: string,
  accountId?: string
): Promise<ActionResult<Investment>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  // 1. Ambil data investasi saat ini
  const { data: gl } = await supabase
    .from("investments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!gl) return { error: "Portofolio tidak ditemukan." };
  if (Number(gl.quantity) < sellQty) {
    return { error: `Jumlah unit yang dijual melebihi kepemilikan (Dimiliki: ${gl.quantity} unit)` };
  }

  const remainingQty = Number(gl.quantity) - sellQty;
  const isSoldOut = remainingQty === 0;

  // 2. Update portofolio investasi
  const updatePayload: Record<string, unknown> = {
    quantity: remainingQty,
    is_sold: isSoldOut,
    updated_at: new Date().toISOString(),
  };

  if (isSoldOut) {
    updatePayload.sold_price = Number(sellPrice);
    updatePayload.sold_date = sellDate;
  }

  const { data: updatedAsset, error: updateError } = await supabase
    .from("investments")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateError) {
    console.error("Gagal memperbarui portofolio jual:", updateError.message);
    return { error: "Gagal memproses transaksi penjualan." };
  }

  // 3. Tambahkan nominal penjualan ke rekening terpilih (kategori Pemasukan Investasi)
  const totalProceeds = sellQty * sellPrice;
  const realizedGain = sellQty * (sellPrice - Number(gl.buy_price));

  if (accountId) {
    const txResult = await createTransaction({
      account_id: accountId,
      type: "income",
      amount: totalProceeds,
      category: "Investasi & Deviden",
      description: `Jual Investasi: ${gl.name} (${gl.ticker || ""}) - Realized Gain/Loss: Rp ${realizedGain.toLocaleString("id-ID")}`,
      date: sellDate,
      is_recurring: false,
      recurring_interval: null,
    });

    if ("error" in txResult) {
      console.error("Gagal mencatat mutasi pemasukan jual investasi:", txResult.error);
    }
  }

  revalidatePath("/investments");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { success: updatedAsset as Investment };
}

export async function deleteInvestment(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const { error } = await supabase
    .from("investments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Gagal menghapus catatan portofolio:", error.message);
    return { error: "Gagal menghapus investasi." };
  }

  revalidatePath("/investments");
  revalidatePath("/dashboard");
  return { success: true };
}
