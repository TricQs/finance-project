"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function resetAllUserData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User tidak ditemukan" };
  }

  try {
    // Hapus seluruh data transaksi, akun, anggaran, hutang, target, & pengingat milik user ini
    await Promise.all([
      supabase.from("transactions").delete().eq("user_id", user.id),
      supabase.from("accounts").delete().eq("user_id", user.id),
      supabase.from("budgets").delete().eq("user_id", user.id),
      supabase.from("goals").delete().eq("user_id", user.id),
      supabase.from("debts").delete().eq("user_id", user.id),
      supabase.from("reminders").delete().eq("user_id", user.id),
    ]);

    return { success: true };
  } catch (err: unknown) {
    console.error("Error resetAllUserData:", err);
    const message = err instanceof Error ? err.message : "Gagal melakukan reset data";
    return { error: message };
  }
}

export async function deleteUserAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User tidak ditemukan" };
  }

  const userId = user.id;

  try {
    // 1. Hapus seluruh data pengguna dari database
    await Promise.all([
      supabase.from("transactions").delete().eq("user_id", userId),
      supabase.from("accounts").delete().eq("user_id", userId),
      supabase.from("budgets").delete().eq("user_id", userId),
      supabase.from("goals").delete().eq("user_id", userId),
      supabase.from("debts").delete().eq("user_id", userId),
      supabase.from("reminders").delete().eq("user_id", userId),
      supabase.from("profiles").delete().eq("id", userId),
    ]);

    // 2. Sign out local session
    await supabase.auth.signOut({ scope: "local" });

    // 3. Hapus user dari Supabase Auth secara permanen via Admin Client
    try {
      const adminClient = createAdminClient();
      await adminClient.auth.admin.deleteUser(userId);
    } catch (adminErr) {
      console.error("Admin deleteUser error:", adminErr);
    }
  } catch (err: unknown) {
    console.error("Error deleteUserAccount:", err);
    const message = err instanceof Error ? err.message : "Gagal menghapus akun";
    return { error: message };
  }

  redirect("/auth");
}
