"use client";

import React, { useState } from "react";
import { User, LogOut, Shield, Bell, Palette } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ThemeToggleCompact } from "@/components/layout/theme-toggle-compact";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-sans animate-fade-only">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Pengaturan
        </h1>
        <p className="text-slate-500 dark:text-zinc-400 mt-1">
          Kelola profil, preferensi, dan keamanan akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Menu Navigasi Pengaturan */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#eef2ff] dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400 font-semibold rounded-2xl text-sm transition-all cursor-pointer">
            <User className="size-5 shrink-0" />
            <span>Profil Akun</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white font-medium rounded-2xl text-sm transition-all cursor-pointer">
            <Palette className="size-5 shrink-0" />
            <span>Tampilan</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white font-medium rounded-2xl text-sm transition-all cursor-pointer">
            <Bell className="size-5 shrink-0" />
            <span>Notifikasi</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white font-medium rounded-2xl text-sm transition-all cursor-pointer">
            <Shield className="size-5 shrink-0" />
            <span>Keamanan</span>
          </button>
        </div>

        {/* Kolom Kanan: Konten Aktif */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Profil Akun</h2>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-8 items-start sm:items-center">
              <div className="h-20 w-20 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center border-2 border-indigo-500/20 shrink-0">
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">P</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Pengguna</h3>
                <p className="text-slate-500 dark:text-zinc-400 text-sm mb-3">pengguna@email.com</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                    Ubah Foto
                  </button>
                  <button className="px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                    Hapus
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  defaultValue="Pengguna"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Email</label>
                <input 
                  type="email" 
                  defaultValue="pengguna@email.com"
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-500 text-sm cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1.5">Email tidak dapat diubah karena terhubung dengan autentikasi utama.</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer">
                Simpan Perubahan
              </button>
            </div>
          </div>
          
          {/* Sesi Tampilan */}
          <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tampilan</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Mode Gelap / Terang</h3>
                <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Ubah tema tampilan aplikasi secara manual.</p>
              </div>
              <ThemeToggleCompact />
            </div>
          </div>

          {/* Sesi Keluar (Log out) - Penting untuk Mobile */}
          <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-2">Zona Bahaya</h2>
            <p className="text-rose-600/70 dark:text-rose-400/70 text-sm mb-5">
              Keluar dari akun Anda di perangkat ini. Anda harus masuk kembali untuk mengakses dasbor.
            </p>
            <button 
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="size-4" />
              {loading ? "Keluar..." : "Keluar dari Akun (Log out)"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
