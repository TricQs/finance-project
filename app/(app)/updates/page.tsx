import React from "react";
import { Sparkles, Bell } from "lucide-react";

export const metadata = {
  title: "Updates — Uangku",
};

export default function UpdatesPage() {
  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product Updates</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Dapatkan informasi fitur terbaru dan pembaruan sistem Uangku.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {[
          { title: "Sistem Otomatisasi Transaksi 2.0", date: "Hari ini", desc: "PL/pgSQL Triggers baru secara otomatis menyinkronkan saldo kas dan dompet digital tanpa penundaan." },
          { title: "Export Laporan PDF & Excel", date: "Kemarin", desc: "Format ekspor baru dengan visual grafik ringkasan dan analisis pengeluaran bulanan." },
          { title: "Dukungan Multi-Mata Uang & RLS", date: "3 Hari lalu", desc: "Keamanan data tingkat baris (Row Level Security) diperketat untuk seluruh tabel dompet." }
        ].map((item, idx) => (
          <div key={idx} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</span>
              <span className="text-xs font-medium text-violet-500 bg-violet-50 dark:bg-violet-950 px-2.5 py-1 rounded-full">{item.date}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
