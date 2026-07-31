"use client";

import { useState } from "react";
import {
  Wallet,
  CreditCard,
  Banknote,
  PiggyBank,
  Briefcase,
  Coins,
  Building2,
  Plus,
  MoreVertical,
  Edit2,
  Archive,
  Trash2,
  ArrowLeftRight,
  Eye,
  Info
} from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { AccountModal } from "@/components/accounts/account-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { BulkActionsBar } from "@/components/transactions/bulk-actions-bar";
import {
  getAccounts,
  deleteAccount,
  updateAccount,
  bulkDeleteAccounts,
  bulkArchiveAccounts
} from "@/lib/accounts/actions";
import { getTransactions, UnifiedTransaction } from "@/lib/transactions/actions";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Account } from "@/types";

const ICON_MAP: Record<string, any> = {
  Wallet,
  CreditCard,
  Banknote,
  PiggyBank,
  Briefcase,
  Coins,
  Building2,
};

import { useLanguage } from "@/lib/i18n/context";

interface AccountsClientPageProps {
  initialAccounts: Account[];
}

export function AccountsClientPage({ initialAccounts }: AccountsClientPageProps) {
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [showArchived, setShowArchived] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

  // Detail view state
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [txHistory, setTxHistory] = useState<UnifiedTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Hitung total kekayaan (hanya dari akun aktif)
  const totalNetWorth = accounts
    .filter(acc => acc.is_active)
    .reduce((sum, acc) => sum + Number(acc.balance), 0);

  // Filter akun: Jika showArchived true -> Tampilkan HANYA akun diarsip (!is_active). Jika false -> Tampilkan HANYA akun aktif (is_active).
  const displayedAccounts = accounts.filter(acc => showArchived ? !acc.is_active : acc.is_active);

  // Checkbox selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);

  const allIdsOnPage = displayedAccounts.map((a) => a.id);
  const isAllSelected = allIdsOnPage.length > 0 && allIdsOnPage.every((id) => selectedIds.includes(id));

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(allIdsOnPage);
    } else {
      setSelectedIds([]);
    }
  }

  function handleSelectRow(id: string, checked: boolean) {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  }

  async function refreshAccounts() {
    const data = await getAccounts(true);
    setAccounts(data);
    setSelectedIds([]);
  }

  // Handle edit klik
  function handleEdit(acc: Account) {
    setAccountToEdit(acc);
    setIsModalOpen(true);
  }

  // Handle arsipkan langsung
  async function handleToggleArchive(acc: Account) {
    const newStatus = !acc.is_active;
    const res = await updateAccount(acc.id, { is_active: newStatus });
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success(newStatus ? `Akun ${acc.name} diaktifkan kembali.` : `Akun ${acc.name} diarsipkan.`);
      refreshAccounts();
    }
  }

  // Delete modal state
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Handle hapus rekening
  function handleDeleteClick(acc: Account) {
    setAccountToDelete(acc);
  }

  async function handleConfirmDelete() {
    if (!accountToDelete) return;
    setDeleteLoading(true);

    const res = await deleteAccount(accountToDelete.id);
    setDeleteLoading(false);
    setAccountToDelete(null);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Akun berhasil dihapus permanen dari Database.");
      refreshAccounts();
    }
  }

  async function handleConfirmBulkDelete() {
    setIsBulkConfirmOpen(false);
    setBulkLoading(true);
    const res = await bulkDeleteAccounts(selectedIds);
    setBulkLoading(false);
    setSelectedIds([]);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Akun massal berhasil dihapus permanen dari Database.");
      refreshAccounts();
    }
  }

  async function handleConfirmBulkArchive(targetIsActive: boolean) {
    setBulkLoading(true);
    const res = await bulkArchiveAccounts(selectedIds, targetIsActive);
    setBulkLoading(false);
    setSelectedIds([]);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success(
        targetIsActive
          ? "Akun berhasil diaktifkan kembali."
          : "Akun berhasil diarsipkan."
      );
      refreshAccounts();
    }
  }

  // Buka detail rekening & muat riwayat transaksinya
  async function handleOpenDetails(acc: Account) {
    setSelectedAccount(acc);
    setLoadingHistory(true);
    const history = await getTransactions({ accountId: acc.id });
    setTxHistory(history);
    setLoadingHistory(false);
  }

  return (
    <div className="flex flex-col gap-6 pt-2 font-sans">
      {/* HEADER BANNER: NET WORTH */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg"
        style={{
          background: "linear-gradient(135deg, var(--auth-primary, #6366f1), #4f46e5)",
        }}
      >
        {/* Decorative background vectors */}
        <div className="absolute right-0 top-0 size-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 size-32 rounded-full bg-indigo-300/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-1">
          <span className="text-sm font-medium text-white/80 uppercase tracking-wider">{t.accounts.totalNetWorth}</span>
          <h2 className="text-4xl font-extrabold tracking-tight tabular-nums">
            {formatCurrency(totalNetWorth)}
          </h2>
          <p className="text-xs text-white/60 mt-1">{t.accounts.totalNetWorthDesc}</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowArchived(!showArchived);
              setSelectedIds([]);
            }}
            className={`rounded-2xl border-2 cursor-pointer transition-all ${showArchived
                ? "bg-primary/10 border-primary text-primary hover:bg-primary/20"
                : "border-border hover:bg-muted"
              }`}
          >
            {t.accounts.showArchived}
          </Button>

          {displayedAccounts.length > 0 && (
            <div className="flex items-center gap-2 pl-2">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="size-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-muted-foreground">
                {t.accounts.selectAll} {selectedIds.length > 0 && `(${selectedIds.length})`}
              </span>
            </div>
          )}
        </div>

        <Button
          id="tour-add-account"
          onClick={() => {
            setAccountToEdit(null);
            setIsModalOpen(true);
          }}
          className="rounded-2xl gap-1.5 shadow-md cursor-pointer font-semibold"
        >
          <Plus className="size-4" />
          <span>{t.accounts.addAccount}</span>
        </Button>
      </div>

      {/* GRID KARTU AKUN */}
      {displayedAccounts.length === 0 ? (
        <div className="neu-raised-lg rounded-3xl p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-border/50">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
            <Wallet className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {showArchived ? "Tidak Ada Akun di Arsip" : "Belum Ada Akun Terdaftar"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {showArchived
              ? "Seluruh akun Anda yang diarsipkan akan muncul di sini."
              : "Catat rekening bank, dompet digital, atau uang tunai Anda untuk mulai melacak keuangan secara akurat."}
          </p>
          {!showArchived && (
            <Button
              onClick={() => {
                setAccountToEdit(null);
                setIsModalOpen(true);
              }}
              className="rounded-2xl"
            >
              Buat Rekening Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedAccounts.map((acc) => {
            const IconComp = ICON_MAP[acc.icon] || Wallet;
            const isSelected = selectedIds.includes(acc.id);
            return (
              <motion.div
                key={acc.id}
                layoutId={acc.id}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`relative overflow-hidden rounded-3xl border border-border/40 p-5 cursor-pointer shadow-sm ${isSelected
                    ? "neu-pressed-sm border-primary/50 bg-primary/5"
                    : acc.is_active
                      ? "neu-raised-lg bg-background hover:shadow-md"
                      : "bg-muted/40 border-muted opacity-70"
                  }`}
                onClick={() => handleOpenDetails(acc)}
              >
                {/* Accent top gradient color strip */}
                <div
                  className="absolute left-0 top-0 right-0 h-2 pointer-events-none"
                  style={{ backgroundColor: acc.color }}
                />

                <div className="flex items-start justify-between gap-4 mt-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleSelectRow(acc.id, e.target.checked)}
                      className="size-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                    />
                    <div
                      className="size-11 rounded-2xl flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: acc.color }}
                    >
                      <IconComp className="size-5.5" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {!acc.is_active && (
                      <Badge variant="secondary" className="rounded-full text-[10px] uppercase font-bold px-2 py-0.5">
                        DIARSIPKAN
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="size-8 rounded-full hover:bg-muted flex items-center justify-center outline-none cursor-pointer">
                        <MoreVertical className="size-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => handleEdit(acc)} className="gap-2">
                          <Edit2 className="size-3.5" />
                          <span>Ubah</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleArchive(acc)} className="gap-2">
                          <Archive className="size-3.5" />
                          <span>{acc.is_active ? "Arsip" : "Aktifkan"}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(acc)} className="text-red-500 hover:text-red-600 focus:text-red-500 gap-2">
                          <Trash2 className="size-3.5" />
                          <span>Hapus</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mt-5 flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {acc.institution || acc.type.toUpperCase()}
                  </span>
                  <span className="text-base font-bold text-foreground truncate mt-0.5">
                    {acc.name}
                  </span>
                  {acc.account_number && (
                    <span className="text-[11px] text-muted-foreground/80 font-mono tracking-tight mt-0.5">
                      {acc.account_number}
                    </span>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">{t.accounts.balance}</span>
                  <span className="text-xl font-extrabold tabular-nums text-foreground">
                    {formatCurrency(Number(acc.balance))}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MODAL TAMBAH / EDIT AKUN */}
      <AccountModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        accountToEdit={accountToEdit}
        onSuccess={refreshAccounts}
      />

      {/* MODAL DETAIL REKENING */}
      <Dialog open={!!selectedAccount} onOpenChange={(open) => { if (!open) setSelectedAccount(null); }}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto font-sans rounded-3xl border border-border bg-background p-6 shadow-2xl transition-all">
          {selectedAccount && (
            <>
              <DialogHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
                <div
                  className="size-11 rounded-2xl flex items-center justify-center text-white"
                  style={{ backgroundColor: selectedAccount.color }}
                >
                  {(() => {
                    const IconComp = ICON_MAP[selectedAccount.icon] || Wallet;
                    return <IconComp className="size-5.5" />;
                  })()}
                </div>
                <div className="flex flex-col text-left">
                  <DialogTitle className="font-heading text-lg font-bold text-foreground">
                    {selectedAccount.name}
                  </DialogTitle>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {selectedAccount.institution || selectedAccount.type} {selectedAccount.account_number && `• ${selectedAccount.account_number}`}
                  </span>
                </div>
              </DialogHeader>

              {/* SALDO DETIL */}
              <div className="py-4 flex justify-between items-center bg-muted/30 rounded-2xl px-5 border border-border/40">
                <span className="text-sm font-semibold text-muted-foreground">Saldo Terkini</span>
                <span className="text-2xl font-extrabold text-foreground tabular-nums">
                  {formatCurrency(Number(selectedAccount.balance))}
                </span>
              </div>

              {/* RIWAYAT TRANSAKSI SPESIFIK REKENING INI */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowLeftRight className="size-3.5 text-primary" />
                  Riwayat Keuangan Akun
                </h4>

                {loadingHistory ? (
                  <div className="py-8 text-center flex flex-col items-center gap-2">
                    <div className="size-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                    <span className="text-xs text-muted-foreground">Memuat histori...</span>
                  </div>
                ) : txHistory.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                    <Info className="size-6 text-muted-foreground/60" />
                    <span>Belum ada transaksi tercatat untuk akun ini.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {txHistory.map((tx) => {
                      const isIncome = tx.type === "income";
                      const isTransfer = tx.type === "transfer";

                      // Cari tanda nominal
                      let sign = "-";
                      let colorClass = "text-red-500 dark:text-red-400";

                      if (isIncome) {
                        sign = "+";
                        colorClass = "text-emerald-500 dark:text-emerald-400";
                      } else if (isTransfer) {
                        // Jika transfer, cek apakah transfer keluar atau masuk untuk akun ini
                        const isTransferOut = tx.from_account_id === selectedAccount.id;
                        sign = isTransferOut ? "-" : "+";
                        colorClass = isTransferOut ? "text-red-500" : "text-emerald-500";
                      }

                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/40 border border-border/30 transition-all text-xs"
                        >
                          <div className="flex flex-col text-left gap-0.5">
                            <span className="font-bold text-foreground text-sm">
                              {isTransfer
                                ? `${tx.from_account_name} ➔ ${tx.to_account_name}`
                                : tx.category
                              }
                            </span>
                            <span className="text-muted-foreground">
                              {tx.date} {tx.description && `• ${tx.description}`}
                            </span>
                          </div>
                          <span className={`font-extrabold text-sm tabular-nums ${colorClass}`}>
                            {sign} {formatCurrency(tx.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* FLOAT BULK ACTIONS BAR UNTUK AKUN */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        itemLabel="akun"
        archiveLabel={showArchived ? "Aktifkan" : "Arsipkan"}
        onArchiveSelected={() => handleConfirmBulkArchive(showArchived)}
        onClearSelection={() => setSelectedIds([])}
        onDeleteSelected={() => setIsBulkConfirmOpen(true)}
        loading={bulkLoading}
      />

      {/* MODAL KONFIRMASI HAPUS SINGLE */}
      <ConfirmModal
        open={!!accountToDelete}
        onOpenChange={(open) => { if (!open) setAccountToDelete(null); }}
        title="Hapus Permanen dari Database"
        description={`PERHATIAN: Menghapusnya sekarang akan MENGHAPUS PERMANEN akun ${accountToDelete?.name ? `"${accountToDelete.name}"` : ""} dan seluruh historinya dari Database.`}
        confirmText="Hapus Permanen"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
      />

      {/* MODAL KONFIRMASI HAPUS MASAL (BULK) */}
      <ConfirmModal
        open={isBulkConfirmOpen}
        onOpenChange={setIsBulkConfirmOpen}
        title="Hapus Banyak Akun Permanen"
        description={`PERHATIAN: Menghapusnya sekarang akan MENGHAPUS PERMANEN ${selectedIds.length} akun yang dipilih dan seluruh historinya dari Database.`}
        confirmText={`Hapus ${selectedIds.length} Akun`}
        loading={bulkLoading}
        onConfirm={handleConfirmBulkDelete}
      />
    </div>
  );
}
