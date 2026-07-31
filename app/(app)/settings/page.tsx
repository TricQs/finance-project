"use client";

import React, { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ThemeToggleCompact } from "@/components/layout/theme-toggle-compact";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("");

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

        {/* Sesi Keluar (Log out) - Zona Bahaya */}
        <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-2">{t.settings.dangerZone}</h2>
          <p className="text-rose-600/70 dark:text-rose-400/70 text-sm mb-5">
            {t.settings.dangerDesc}
          </p>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="size-4" />
            {loading ? t.settings.loggingOut : t.settings.logout}
          </button>
        </div>
      </div>
    </div>
  );
}
