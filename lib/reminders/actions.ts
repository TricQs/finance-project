"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createTransaction } from "@/lib/transactions/actions";
import type { Reminder } from "@/types";

type ActionResult<T = any> = { error: string } | { success: T };

export async function getReminders(): Promise<Reminder[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Gagal mengambil tagihan/pengingat:", error.message);
    return [];
  }

  return data as Reminder[];
}

export async function createReminder(
  data: Pick<Reminder, "title" | "amount" | "due_date" | "repeat_interval">
): Promise<ActionResult<Reminder>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const { data: newReminder, error } = await supabase
    .from("reminders")
    .insert([
      {
        ...data,
        amount: data.amount ? Number(data.amount) : null,
        user_id: user.id,
        is_done: false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Gagal membuat pengingat:", error.message);
    return { error: "Gagal membuat pengingat tagihan." };
  }

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
  return { success: newReminder as Reminder };
}

export async function payReminder(id: string, accountId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  // 1. Ambil detail pengingat terlebih dahulu
  const { data: rmd, error: fetchError } = await supabase
    .from("reminders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !rmd) {
    console.error("Gagal mengambil data tagihan:", fetchError?.message);
    return { error: "Data tagihan tidak ditemukan." };
  }

  // 2. Tandai lunas
  const { error: updateError } = await supabase
    .from("reminders")
    .update({
      is_done: true,
      done_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Gagal melunasi tagihan:", updateError.message);
    return { error: "Gagal menandai tagihan sebagai lunas." };
  }

  // 3. Otomatis buat pengeluaran di transaksi jika nominal diisi
  if (rmd.amount && Number(rmd.amount) > 0) {
    const txResult = await createTransaction({
      account_id: accountId,
      type: "expense",
      amount: Number(rmd.amount),
      category: "Tagihan & Utilitas",
      description: `Pembayaran Tagihan: ${rmd.title}`,
      date: new Date().toISOString().split("T")[0],
      is_recurring: false,
      recurring_interval: null,
    });

    if ("error" in txResult) {
      console.error("Gagal membuat transaksi pengeluaran otomatis:", txResult.error);
    }
  }

  // 4. Jika recurring, buat tagihan periode berikutnya otomatis
  if (rmd.repeat_interval !== "once") {
    const nextDueDate = new Date(rmd.due_date);
    if (rmd.repeat_interval === "weekly") nextDueDate.setDate(nextDueDate.getDate() + 7);
    else if (rmd.repeat_interval === "monthly") nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    else if (rmd.repeat_interval === "yearly") nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);

    const { error: newRmdError } = await supabase
      .from("reminders")
      .insert([
        {
          user_id: user.id,
          title: rmd.title,
          amount: rmd.amount,
          due_date: nextDueDate.toISOString().split("T")[0],
          repeat_interval: rmd.repeat_interval,
          is_done: false,
        },
      ]);

    if (newRmdError) {
      console.error("Gagal menjadwalkan tagihan periodik berikutnya:", newRmdError.message);
    }
  }

  revalidatePath("/reminders");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteReminder(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Pengguna tidak terautentikasi" };

  const { error } = await supabase
    .from("reminders")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Gagal menghapus pengingat:", error.message);
    return { error: "Gagal menghapus pengingat." };
  }

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
  return { success: true };
}
