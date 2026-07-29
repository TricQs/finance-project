import React from "react";
import { ShoppingBag, Store } from "lucide-react";

export const metadata = {
  title: "Walmart Integration — Uangku",
};

export default function StoreWalmartPage() {
  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Walmart Integration</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Sinkronisasi belanja bulanan supermarket.</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs text-center py-12 space-y-3">
        <Store className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Toko Walmart Terhubung</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          Impor bukti transaksi belanja kebutuhan pokok secara langsung.
        </p>
      </div>
    </div>
  );
}
