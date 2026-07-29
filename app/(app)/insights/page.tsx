import React from "react";
import { TrendingUp, PieChart, BarChart2 } from "lucide-react";

export const metadata = {
  title: "Insights & Analisis — Uangku",
};

export default function InsightsPage() {
  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Financial Insights</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Analisis mendalam arus kas, tren belanja, dan rekomendasi keuangan cerdas.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-violet-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Analisis Alokasi Belanja</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Pengeluaran kategori <strong className="text-slate-800 dark:text-white">Makanan & Minuman</strong> mencakup 35% dari total anggaran bulan ini.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Perkiraan Saldo Akhir Bulan</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Berdasarkan laju pengeluaran 14 hari terakhir, Anda diproyeksikan dapat menghemat hingga <strong className="text-emerald-500">Rp 2.450.000</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
