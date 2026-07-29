import React from "react";
import { ShoppingBag, Store } from "lucide-react";

export const metadata = {
  title: "Store Integrasi — Uangku",
};

export default function StoreAmazonPage() {
  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Amazon Integration</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Sinkronisasi belanjaan dan pesanan Amazon otomatis.</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs text-center py-12 space-y-3">
        <Store className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Toko Amazon Terhubung</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          Setiap transaksi belanja online di toko pilihan Anda dapat otomatis tercatat ke dalam pengeluaran bulanan.
        </p>
      </div>
    </div>
  );
}
