"use client";

import { useState, useMemo } from "react";
import {
  ArrowRightLeft,
  TrendingDown,
  TrendingUp,
  Plus,
  Search,
  Download,
  Edit3,
  Trash2,
  X,
  FileText,
  Filter,
  Calendar,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TransactionModal } from "@/components/transactions/transaction-modal";
import { BulkActionsBar } from "@/components/transactions/bulk-actions-bar";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  getTransactions,
  deleteTransaction,
  deleteTransfer,
  bulkDeleteTransactions,
  getReceiptSignedUrl,
  UnifiedTransaction
} from "@/lib/transactions/actions";
import { toast } from "sonner";
import type { Account } from "@/types";

const ALL_CATEGORIES = [
  "Makanan & Minuman",
  "Transportasi",
  "Belanja",
  "Hiburan",
  "Tagihan & Utilitas",
  "Pendidikan",
  "Kesehatan",
  "Pajak & Finansial",
  "Gaji & Upah",
  "Investasi & Deviden",
  "Transfer Masuk",
  "Pengembalian Uang",
  "Hadiah & Bonus",
  "Usaha / Sampingan",
  "Lainnya"
];

interface TransactionsClientPageProps {
  initialTransactions: UnifiedTransaction[];
  accounts: Account[];
}

export function TransactionsClientPage({
  initialTransactions,
  accounts,
}: TransactionsClientPageProps) {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>(initialTransactions);

  // States Filter
  const [accountId, setAccountId] = useState("all");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState<"all" | "income" | "expense" | "transfer">("all");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Checkbox selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<UnifiedTransaction | null>(null);

  // Resi/receipt modal preview
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  // Refresh transaksi terupdate sesuai filter
  async function refreshTransactions() {
    const filters: any = {};
    if (accountId !== "all") filters.accountId = accountId;
    if (category !== "all") filters.category = category;
    if (type !== "all") filters.type = type;
    if (search.trim()) filters.search = search.trim();
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const data = await getTransactions(filters);
    setTransactions(data);
    setSelectedIds([]); // Reset seleksi
  }

  // Reset semua filter
  function handleResetFilters() {
    setAccountId("all");
    setCategory("all");
    setType("all");
    setSearch("");
    setStartDate("");
    setEndDate("");
    // Trigger refresh sesudahnya
    setTimeout(refreshTransactions, 50);
  }

  // Seleksi satu per satu row
  function handleSelectRow(id: string, checked: boolean) {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  }

  // Seleksi semua row di halaman saat ini
  const allIdsOnPage = transactions.map((t) => t.id);
  const isAllSelected = allIdsOnPage.length > 0 && allIdsOnPage.every((id) => selectedIds.includes(id));

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(allIdsOnPage);
    } else {
      setSelectedIds([]);
    }
  }

  // Handle Edit Klik
  function handleEdit(tx: UnifiedTransaction) {
    setTxToEdit(tx);
    setIsModalOpen(true);
  }

  // Confirm modal states
  const [txToDelete, setTxToDelete] = useState<UnifiedTransaction | null>(null);
  const [singleDeleteLoading, setSingleDeleteLoading] = useState(false);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);

  // Handle Hapus Klik (Single)
  function handleDeleteClick(tx: UnifiedTransaction) {
    setTxToDelete(tx);
  }

  async function handleConfirmSingleDelete() {
    if (!txToDelete) return;
    setSingleDeleteLoading(true);

    let res;
    if (txToDelete.type === "transfer") {
      res = await deleteTransfer(txToDelete.id);
    } else {
      res = await deleteTransaction(txToDelete.id);
    }

    setSingleDeleteLoading(false);
    setTxToDelete(null);

    if (res && "error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Transaksi berhasil dihapus.");
      refreshTransactions();
    }
  }

  // Handle Bulk Delete
  function handleBulkDeleteClick() {
    setIsBulkConfirmOpen(true);
  }

  async function handleConfirmBulkDelete() {
    setIsBulkConfirmOpen(false);
    setBulkLoading(true);
    const res = await bulkDeleteTransactions(selectedIds);
    setBulkLoading(false);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Transaksi massal berhasil dihapus.");
      refreshTransactions();
    }
  }

  // Ekspor transaksi ke CSV
  function handleExportCSV() {
    if (transactions.length === 0) {
      toast.error("Tidak ada data transaksi untuk diekspor");
      return;
    }

    const headers = ["Tanggal", "Tipe", "Kategori", "Jumlah", "Rekening", "Keterangan"];
    const rows = transactions.map((t) => [
      t.date,
      t.type.toUpperCase(),
      t.category,
      t.amount,
      t.type === "transfer" ? `${t.from_account_name} -> ${t.to_account_name}` : t.account_name,
      t.description || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `riwayat-transaksi-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File CSV berhasil diunduh!");
  }

  // Tampilkan Bukti Resi via Signed URL
  async function handleViewReceipt(path: string) {
    setLoadingReceipt(true);
    const signedUrl = await getReceiptSignedUrl(path);
    setLoadingReceipt(false);
    if (signedUrl) {
      setActiveReceiptUrl(signedUrl);
    } else {
      toast.error("Gagal memuat berkas bukti resi");
    }
  }

  // Kelompokkan transaksi berdasarkan tanggal untuk visualisasi rapi
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, UnifiedTransaction[]> = {};
    transactions.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    });
    return groups;
  }, [transactions]);

  return (
    <div className="flex flex-col gap-6 pt-2 font-sans">
      {/* FILTER PANEL */}
      <div className="neu-raised-lg rounded-3xl p-5 bg-background space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Filter className="size-4.5 text-primary" />
          <span>Filter Keuangan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* SEARCH */}
          <div className="space-y-1.5 lg:col-span-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cari Deskripsi</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Makan siang, gaji..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && refreshTransactions()}
                className="pl-9 rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
              />
            </div>
          </div>

          {/* TIPE */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tipe</Label>
            <Select value={type} onValueChange={(val: any) => setType(val)}>
              <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
                <SelectValue placeholder="Pilih Tipe" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
                <SelectItem value="income">Pemasukan</SelectItem>
                <SelectItem value="transfer">Transfer Dana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AKUN / REKENING */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rekening</Label>
            <Select value={accountId} onValueChange={(val) => setAccountId(val ?? "all")}>
              <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
                <SelectValue placeholder="Pilih Rekening" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua Akun</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* KATEGORI */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kategori</Label>
            <Select value={category} onValueChange={(val) => setCategory(val ?? "all")}>
              <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua Kategori</SelectItem>
                {ALL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* RENTANG TANGGAL */}
          <div className="space-y-1.5 col-span-1">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mulai Tanggal</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/50 pt-3">
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={refreshTransactions} className="rounded-2xl px-4 cursor-pointer">
              Terapkan Filter
            </Button>
            <Button size="sm" variant="ghost" onClick={handleResetFilters} className="rounded-2xl cursor-pointer hover:bg-muted text-muted-foreground">
              Reset
            </Button>
          </div>

          <Button size="sm" variant="outline" onClick={handleExportCSV} className="rounded-2xl border-2 gap-2 cursor-pointer">
            <Download className="size-4" />
            <span>Ekspor CSV</span>
          </Button>
        </div>
      </div>

      {/* HEADER TOTALS / CTA */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-foreground">
          Daftar Transaksi ({transactions.length})
        </h3>
        <Button
          onClick={() => {
            setTxToEdit(null);
            setIsModalOpen(true);
          }}
          className="rounded-2xl gap-2 cursor-pointer"
        >
          <Plus className="size-4.5" />
          <span>Tambah Transaksi</span>
        </Button>
      </div>

      {/* TRANSACTIONS LIST */}
      {transactions.length === 0 ? (
        <div className="neu-raised-lg rounded-3xl p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-border/50 bg-background">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
            <AlertCircle className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Transaksi Tidak Ditemukan</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Tidak ada transaksi yang cocok dengan filter yang Anda gunakan atau Anda belum membuat transaksi.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* CHECK ALL BARIS */}
          <div className="flex items-center gap-3 pl-4">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="size-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-muted-foreground">
              Pilih Semua  {selectedIds.length > 0 && `(${selectedIds.length} Terpilih)`}
            </span>
          </div>

          {/* GROUPS LIST */}
          <div className="space-y-6">
            {Object.keys(groupedTransactions).map((dateGroup) => (
              <div key={dateGroup} className="space-y-2">
                {/* TANGGAL GROUP HEADER */}
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-3 flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {dateGroup}
                </h4>

                {/* ROW TRANSAKSI */}
                <div className="space-y-2.5">
                  {groupedTransactions[dateGroup].map((tx) => {
                    const isExpense = tx.type === "expense";
                    const isIncome = tx.type === "income";
                    const isTransfer = tx.type === "transfer";
                    const isSelected = selectedIds.includes(tx.id);

                    let sign = "-";
                    let colorClass = "text-red-500 dark:text-red-400";
                    let IconComp = TrendingDown;

                    if (isIncome) {
                      sign = "+";
                      colorClass = "text-emerald-500 dark:text-emerald-400";
                      IconComp = TrendingUp;
                    } else if (isTransfer) {
                      sign = "";
                      colorClass = "text-indigo-500 dark:text-indigo-400";
                      IconComp = ArrowRightLeft;
                    }

                    return (
                      <div
                        key={tx.id}
                        className={`neu-transition flex items-center justify-between p-4 rounded-3xl border border-border/30 bg-background ${isSelected ? "neu-pressed-sm border-primary/50" : "neu-raised-sm"
                          }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* CHECKBOX */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(tx.id, e.target.checked)}
                            className="size-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                          />

                          {/* ICON */}
                          <div
                            className="size-11 rounded-2xl flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: tx.account_color || "#6366f1" }}
                          >
                            <IconComp className="size-5" />
                          </div>

                          {/* DETAILS */}
                          <div className="flex flex-col text-left min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground truncate">
                                {isTransfer
                                  ? `${tx.from_account_name} ➔ ${tx.to_account_name}`
                                  : tx.category
                                }
                              </span>
                              {tx.is_recurring && (
                                <Badge variant="outline" className="text-[9px] uppercase font-extrabold px-1.5 py-0">
                                  RECURRING
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground truncate mt-0.5">
                              {isTransfer
                                ? "Transfer Keuangan"
                                : tx.account_name
                              }
                              {tx.description && ` • ${tx.description}`}
                            </span>
                          </div>
                        </div>

                        {/* NOMINAL & ACTIONS */}
                        <div className="flex items-center gap-4 shrink-0">
                          <span className={`text-sm font-extrabold tabular-nums ${colorClass}`}>
                            {sign} {formatCurrency(tx.amount)}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {tx.receipt_url && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewReceipt(tx.receipt_url!)}
                                disabled={loadingReceipt}
                                className="size-8 p-0 rounded-xl hover:bg-muted"
                                title="Lihat Nota"
                              >
                                <FileText className="size-4.5 text-muted-foreground" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(tx)}
                              className="size-8 p-0 rounded-xl hover:bg-muted"
                              title="Edit"
                            >
                              <Edit3 className="size-4.5 text-muted-foreground" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClick(tx)}
                              className="size-8 p-0 rounded-xl hover:bg-muted text-red-500 hover:text-red-600 hover:bg-red-50/10"
                              title="Hapus"
                            >
                              <Trash2 className="size-4.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FLOAT BULK ACTIONS BAR */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onDeleteSelected={handleBulkDeleteClick}
        loading={bulkLoading}
      />

      {/* TRANSACTION FORM MODAL */}
      <TransactionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        transactionToEdit={txToEdit}
        onSuccess={refreshTransactions}
      />

      {/* RESI PREVIEW DIALOG */}
      <Dialog open={!!activeReceiptUrl} onOpenChange={(open) => { if (!open) setActiveReceiptUrl(null); }}>
        <DialogContent className="sm:max-w-[480px] font-sans rounded-3xl border border-border bg-background p-6 shadow-2xl transition-all flex flex-col items-center">
          <DialogHeader className="w-full border-b border-border pb-3 mb-4">
            <DialogTitle className="font-heading text-lg font-bold text-foreground text-left">
              Pratinjau Nota Bukti Resi
            </DialogTitle>
          </DialogHeader>
          {activeReceiptUrl && (
            <div className="w-full max-h-[60vh] overflow-hidden rounded-2xl bg-muted flex items-center justify-center border border-border">
              <img src={activeReceiptUrl} alt="Resi Bukti" className="max-w-full max-h-[55vh] object-contain rounded-xl" />
            </div>
          )}
          <div className="w-full flex justify-end mt-4">
            <Button onClick={() => setActiveReceiptUrl(null)} className="rounded-2xl">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL KONFIRMASI HAPUS SINGLE */}
      <ConfirmModal
        open={!!txToDelete}
        onOpenChange={(open) => { if (!open) setTxToDelete(null); }}
        title="Hapus Catatan Transaksi"
        description="Apakah Anda yakin ingin menghapus catatan transaksi ini? Tindakan ini akan secara otomatis mengupdate saldo akun terkait."
        confirmText="Ya, Hapus Transaksi"
        loading={singleDeleteLoading}
        onConfirm={handleConfirmSingleDelete}
      />

      {/* MODAL KONFIRMASI HAPUS MASAL (BULK) */}
      <ConfirmModal
        open={isBulkConfirmOpen}
        onOpenChange={setIsBulkConfirmOpen}
        title="Hapus Banyak Transaksi Sekaligus"
        description={`Apakah Anda yakin ingin menghapus ${selectedIds.length} transaksi yang dipilih sekaligus? Tindakan ini tidak dapat dibatalkan.`}
        confirmText={`Ya, Hapus ${selectedIds.length} Transaksi`}
        loading={bulkLoading}
        onConfirm={handleConfirmBulkDelete}
      />
    </div>
  );
}
