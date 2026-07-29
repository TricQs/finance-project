import React from "react";
import { MessageSquare, Send } from "lucide-react";

export const metadata = {
  title: "Messages — Uangku",
};

export default function MessagesPage() {
  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages & Notifications</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Pesan transaksi, tagihan utang, dan konfirmasi pembayaran.</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs text-center py-12 space-y-3">
        <Send className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Kotak Pesan Terpusat</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          Fitur perpesanan dan pengiriman tagihan otomatis sedang disiapkan. Anda dapat mengirim bukti pengiriman dana secara langsung.
        </p>
      </div>
    </div>
  );
}
