"use client";

import React, { useState, useEffect } from "react";
import { LogOut, RotateCcw, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ThemeToggleCompact } from "@/components/layout/theme-toggle-compact";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { resetAllUserData, deleteUserAccount } from "@/lib/settings/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("");

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDeleteAccountConfirmOpen, setIsDeleteAccountConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        setFullName(profile?.full_name || user.email?.split("@")[0] || "Pengguna");
      }
    }
    loadUserData();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .upsert({ id: user.id, full_name: fullName, updated_at: new Date().toISOString() });
        toast.success("Profil berhasil diperbarui!");
      }
    } catch (err) {
      toast.error("Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleConfirmReset = async () => {
    setActionLoading(true);
    const res = await resetAllUserData();
    setActionLoading(false);
    setIsResetConfirmOpen(false);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Seluruh data transaksi dan akun berhasil direset!");
      router.push("/dashboard");
    }
  };

  const handleConfirmDeleteAccount = async () => {
    setActionLoading(true);
    const res = await deleteUserAccount();
    setActionLoading(false);
    setIsDeleteAccountConfirmOpen(false);

    if (res && "error" in res) {
      toast.error(res.error);
    }
  };

  const userInitial = (fullName || userEmail || "U").charAt(0).toUpperCase();

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-sans animate-fade-only">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t.settings.title}
        </h1>
      </div>

      <div className="w-full space-y-6">
        {/* Sesi Profil Akun */}
        <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t.settings.profile}</h2>

          <div className="flex flex-col sm:flex-row gap-6 mb-8 items-start sm:items-center">
            <div className="h-20 w-20 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center border-2 border-indigo-500/20 shrink-0">
              <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{userInitial}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{fullName || "..."}</h3>
              <p className="text-slate-500 dark:text-zinc-400 text-sm mb-3">{userEmail || "..."}</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                  {t.settings.changeAvatar}
                </button>
                <button className="px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                  {t.settings.removeAvatar}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">{t.settings.fullName}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">{t.settings.email}</label>
              <input
                type="email"
                value={userEmail}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-500 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1.5">{t.settings.emailDisabledHint}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              {saving ? t.settings.loggingOut : t.settings.saveChanges}
            </button>
          </div>
        </div>

        {/* Sesi Tampilan & Bahasa */}
        <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.settings.appearance}</h2>

          <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{t.settings.themeLightDark}</h3>
              <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">{t.settings.appearanceDesc}</p>
            </div>
            <ThemeToggleCompact />
          </div>

          {/* Pilihan Bahasa (Language) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{t.settings.language}</h3>
              <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">{t.settings.languageDesc}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setLanguage("id")}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5",
                  language === "id"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700"
                )}
              >
                <span>Indonesia</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5",
                  language === "en"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700"
                )}
              >
                <span>English</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage("ja")}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5",
                  language === "ja"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700"
                )}
              >
                <span>日本語</span>
              </button>
            </div>
          </div>
        </div>

        {/* Zona Bahaya (Danger Zone) - Keluar, Reset Data, & Hapus Akun */}
        <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div>
            <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-1">{t.settings.dangerZone}</h2>
            <p className="text-rose-600/70 dark:text-rose-400/70 text-sm">
              {t.settings.dangerDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleLogout}
              disabled={loading || actionLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="size-4" />
              {loading ? t.settings.loggingOut : t.settings.logout}
            </button>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              disabled={loading || actionLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
            >
              <RotateCcw className="size-4" />
              {language === "ja" ? "全データリセット (Reset Data)" : language === "en" ? "Reset All Data" : "Reset Pabrik (Kosongkan Data)"}
            </button>

            <button
              onClick={() => setIsDeleteAccountConfirmOpen(true)}
              disabled={loading || actionLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-rose-950 text-rose-400 border border-rose-500/40 hover:bg-black text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Trash2 className="size-4 text-rose-400" />
              {language === "ja" ? "アカウントを永久削除 (Delete Account)" : language === "en" ? "Delete Account Permanently" : "Hapus Akun Permanen"}
            </button>
          </div>
        </div>
      </div>

      {/* DIALOG CONFIRMATION: RESET ALL DATA */}
      <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-[420px] rounded-3xl font-sans p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-amber-600 flex items-center gap-2">
              <RotateCcw className="size-5" />
              {language === "ja" ? "全データリセットの確認" : language === "en" ? "Confirm Reset All Data" : "Konfirmasi Reset Pabrik"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {language === "ja"
              ? "すべての取引履歴、口座、予算、目標、負債データが削除されます。この操作は取り消せません。"
              : language === "en"
              ? "Are you sure you want to erase all transactions, accounts, budgets, and debt records? This action cannot be undone."
              : "Apakah Anda yakin ingin menghapus seluruh histori transaksi, rekening, anggaran, dan catatan hutang? Tindakan ini tidak dapat dibatalkan."}
          </p>
          <DialogFooter className="gap-2 pt-3">
            <button
              onClick={() => setIsResetConfirmOpen(false)}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              {language === "ja" ? "キャンセル" : language === "en" ? "Cancel" : "Batal"}
            </button>
            <button
              onClick={handleConfirmReset}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition"
            >
              {actionLoading ? "Resetting..." : language === "ja" ? "リセット実行" : language === "en" ? "Yes, Reset All" : "Ya, Reset Semua Data"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG CONFIRMATION: DELETE ACCOUNT PERMANENTLY */}
      <Dialog open={isDeleteAccountConfirmOpen} onOpenChange={setIsDeleteAccountConfirmOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-[420px] rounded-3xl font-sans p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-rose-600 flex items-center gap-2">
              <Trash2 className="size-5" />
              {language === "ja" ? "アカウント永久削除の確認" : language === "en" ? "Confirm Permanent Account Deletion" : "Konfirmasi Hapus Akun Permanen"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {language === "ja"
              ? "アカウントとすべての関連データがSupabaseデータベースから永久に削除されます。復元はできません。"
              : language === "en"
              ? "Your account and all associated data will be permanently deleted from the database. You cannot restore this account."
              : "Akun Anda beserta seluruh data di database Supabase akan dihapus secara permanen. Anda tidak akan dapat memulihkan akun ini lagi."}
          </p>
          <DialogFooter className="gap-2 pt-3">
            <button
              onClick={() => setIsDeleteAccountConfirmOpen(false)}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              {language === "ja" ? "キャンセル" : language === "en" ? "Cancel" : "Batal"}
            </button>
            <button
              onClick={handleConfirmDeleteAccount}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
            >
              {actionLoading ? "Deleting..." : language === "ja" ? "アカウントを削除" : language === "en" ? "Delete My Account" : "Ya, Hapus Akun Saya"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
