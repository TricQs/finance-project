"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calendar, Upload, FileText, X, ArrowRightLeft, TrendingDown, TrendingUp } from "lucide-react";
import { getAccounts } from "@/lib/accounts/actions";
import { 
  createTransaction, 
  updateTransaction, 
  createTransfer, 
  uploadReceipt,
  getReceiptSignedUrl
} from "@/lib/transactions/actions";
import type { Account, Transaction } from "@/types";
import type { UnifiedTransaction } from "@/lib/transactions/actions";

const EXPENSE_CATEGORIES = [
  "Makanan & Minuman",
  "Transportasi",
  "Belanja",
  "Hiburan",
  "Tagihan & Utilitas",
  "Pendidikan",
  "Kesehatan",
  "Pajak & Finansial",
  "Lainnya"
];

const INCOME_CATEGORIES = [
  "Gaji & Upah",
  "Investasi & Deviden",
  "Transfer Masuk",
  "Pengembalian Uang",
  "Hadiah & Bonus",
  "Usaha / Sampingan",
  "Lainnya"
];

import { useLanguage } from "@/lib/i18n/context";
import { translateCategory } from "@/lib/i18n/dictionary";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionToEdit?: UnifiedTransaction | null;
  onSuccess?: () => void;
}

export function TransactionModal({
  open,
  onOpenChange,
  transactionToEdit = null,
  onSuccess,
}: TransactionModalProps) {
  const { t } = useLanguage();
  const isEdit = !!transactionToEdit;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"expense" | "income" | "transfer">("expense");
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  // States untuk Pemasukan / Pengeluaran
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<string>("monthly");
  
  // States untuk Transfer
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  
  // States untuk Resi
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [existingReceiptPath, setExistingReceiptPath] = useState<string | null>(null);
  const [deleteOldReceipt, setDeleteOldReceipt] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ambil list akun terupdate (termasuk yang diarsipkan agar transaksi lama tetap menampilkan nama akunnya)
  useEffect(() => {
    if (open) {
      getAccounts(true).then(setAccounts);
    }
  }, [open]);

  // Set initial value jika sedang mengedit
  useEffect(() => {
    if (transactionToEdit && open) {
      setActiveTab(transactionToEdit.type);
      setDate(transactionToEdit.date);
      setDescription(transactionToEdit.description || "");

      if (transactionToEdit.type === "transfer") {
        setFromAccountId(transactionToEdit.from_account_id || "");
        setToAccountId(transactionToEdit.to_account_id || "");
        setTransferAmount(transactionToEdit.amount.toLocaleString("en-US"));
        setAccountId("");
        setAmount("");
        setCategory("");
        setSelectedFile(null);
        setReceiptPreview(null);
        setExistingReceiptPath(null);
      } else {
        setAccountId(transactionToEdit.account_id || "");
        setAmount(transactionToEdit.amount.toLocaleString("en-US"));
        setCategory(transactionToEdit.category);
        setIsRecurring(transactionToEdit.is_recurring || false);
        setRecurringInterval(transactionToEdit.recurring_interval || "monthly");
        setFromAccountId("");
        setToAccountId("");
        setTransferAmount("");
        
        if (transactionToEdit.receipt_url) {
          setExistingReceiptPath(transactionToEdit.receipt_url);
          getReceiptSignedUrl(transactionToEdit.receipt_url).then((url) => {
            if (url) setReceiptPreview(url);
          });
        } else {
          setExistingReceiptPath(null);
          setReceiptPreview(null);
        }
      }
      setDeleteOldReceipt(false);
      setSelectedFile(null);
    } else if (open) {
      // Form Reset untuk transaksi baru: Pengguna memilih akun secara manual
      setActiveTab("expense");
      setAccountId("");
      setFromAccountId("");
      setToAccountId("");
      setAmount("");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setIsRecurring(false);
      setRecurringInterval("monthly");
      setTransferAmount("");
      setSelectedFile(null);
      setReceiptPreview(null);
      setExistingReceiptPath(null);
      setDeleteOldReceipt(false);
    }
  }, [transactionToEdit, open]);

  // Handle preview file resi
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Limit 5MB
        toast.error("Ukuran file tidak boleh melebihi 5MB");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setReceiptPreview(url);
      setDeleteOldReceipt(true); // Ganti gambar lama jika ada
    }
  }

  function handleRemoveReceipt() {
    setSelectedFile(null);
    setReceiptPreview(null);
    setDeleteOldReceipt(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 1. VALIDASI
    if (activeTab === "transfer") {
      if (!fromAccountId) return toast.error("Akun asal harus dipilih");
      if (!toAccountId) return toast.error("Akun tujuan harus dipilih");
      if (fromAccountId === toAccountId) return toast.error("Akun asal dan tujuan tidak boleh sama");
      if (!transferAmount || Number(transferAmount.replace(/,/g, "")) <= 0) return toast.error("Jumlah transfer harus lebih dari 0");
    } else {
      if (!accountId) return toast.error("Rekening akun harus dipilih");
      if (!amount || Number(amount.replace(/,/g, "")) <= 0) return toast.error("Nominal jumlah harus lebih dari 0");
      if (!category) return toast.error("Kategori harus dipilih");
    }

    setLoading(true);

    try {
      let finalReceiptPath: string | null = existingReceiptPath;

      // 2. UPLOAD FILE JIKA ADA YANG BARU
      if (activeTab !== "transfer" && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const path = await uploadReceipt(formData);
        if (path) finalReceiptPath = path;
      }

      let result;

      // 3. PROSES SUBMIT
      if (activeTab === "transfer") {
        const payload = {
          from_account_id: fromAccountId,
          to_account_id: toAccountId,
          amount: Number(transferAmount.replace(/,/g, "")),
          description: description.trim() || null,
          date,
        };

        if (isEdit && transactionToEdit) {
          // Transfer edit saat ini hanya bisa hapus lama & buat baru
          // atau edit deskripsi/tanggal saja. Untuk memudahkan, edit transfer dilakukan manual
          // atau diblock untuk mencegah inkonsistensi saldo. Di sini kita update langsung:
          toast.error("Pengeditan transfer langsung belum didukung, silakan hapus dan buat ulang transfer.");
          setLoading(false);
          return;
        } else {
          result = await createTransfer(payload);
        }
      } else {
        const payload = {
          account_id: accountId,
          type: activeTab,
          amount: Number(amount.replace(/,/g, "")),
          category,
          description: description.trim() || null,
          date,
          is_recurring: isRecurring,
          recurring_interval: isRecurring ? (recurringInterval as any) : null,
        };

        if (isEdit && transactionToEdit) {
          result = await updateTransaction(
            transactionToEdit.id,
            payload,
            selectedFile ? finalReceiptPath : null,
            deleteOldReceipt && !selectedFile
          );
        } else {
          result = await createTransaction(payload, finalReceiptPath);
        }
      }

      setLoading(false);

      if (result && "error" in result) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? "Transaksi berhasil diperbarui!" : "Transaksi berhasil dicatat!");
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem.");
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] font-sans rounded-3xl border border-border bg-background p-6 shadow-2xl transition-all">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold text-foreground">
            {isEdit ? t.transactionModal.editTitle : t.transactionModal.addTitle}
          </DialogTitle>
        </DialogHeader>

        {/* JIKA EDIT, TAB DIKUNCI SESUAI TIPE TRANSAKSI ASLINYA */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            if (!isEdit) setActiveTab(val as any);
          }}
          className="w-full pt-1 flex flex-col"
        >
          {!isEdit && (
            <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted p-1 h-auto">
              <TabsTrigger value="expense" className="rounded-xl gap-1.5 cursor-pointer text-xs font-semibold py-2">
                <TrendingDown className="size-3.5 text-red-500" />
                {t.transactionModal.expense}
              </TabsTrigger>
              <TabsTrigger value="income" className="rounded-xl gap-1.5 cursor-pointer text-xs font-semibold py-2">
                <TrendingUp className="size-3.5 text-emerald-500" />
                {t.transactionModal.income}
              </TabsTrigger>
              <TabsTrigger value="transfer" className="rounded-xl gap-1.5 cursor-pointer text-xs font-semibold py-2">
                <ArrowRightLeft className="size-3.5 text-indigo-500" />
                {t.transactionModal.transfer}
              </TabsTrigger>
            </TabsList>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* TABS CONTENT: EXPENSE & INCOME */}
            <TabsContent value="expense" className="space-y-4 outline-none">
              <ExpenseIncomeFormFields
                accounts={accounts}
                accountId={accountId}
                setAccountId={setAccountId}
                amount={amount}
                setAmount={setAmount}
                category={category}
                setCategory={setCategory}
                categories={EXPENSE_CATEGORIES}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="income" className="space-y-4 outline-none">
              <ExpenseIncomeFormFields
                accounts={accounts}
                accountId={accountId}
                setAccountId={setAccountId}
                amount={amount}
                setAmount={setAmount}
                category={category}
                setCategory={setCategory}
                categories={INCOME_CATEGORIES}
                loading={loading}
              />
            </TabsContent>

            {/* TAB CONTENT: TRANSFER */}
            <TabsContent value="transfer" className="space-y-4 outline-none">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Akun Asal (Sumber)
                  </Label>
                  {(() => {
                    const selectedFrom = accounts.find((a) => a.id === fromAccountId);
                    return (
                      <Select value={fromAccountId} onValueChange={(val) => setFromAccountId(val ?? "")} disabled={loading}>
                        <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
                          <SelectValue placeholder="Pilih Akun">
                            {selectedFrom ? selectedFrom.name : (fromAccountId ? "Akun Terhapus" : "Pilih Akun")}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {accounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.name} {!acc.is_active && "(Diarsipkan)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  })()}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Akun Tujuan (Penerima)
                  </Label>
                  {(() => {
                    const selectedTo = accounts.find((a) => a.id === toAccountId);
                    return (
                      <Select value={toAccountId} onValueChange={(val) => setToAccountId(val ?? "")} disabled={loading}>
                        <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
                          <SelectValue placeholder="Pilih Akun">
                            {selectedTo ? selectedTo.name : (toAccountId ? "Akun Terhapus" : "Pilih Akun")}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {accounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.name} {!acc.is_active && "(Diarsipkan)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nominal Transfer
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">IDR</span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={transferAmount}
                    onChange={(e) => {
                      const numOnly = e.target.value.replace(/[^0-9]/g, "");
                      if (!numOnly) setTransferAmount("");
                      else setTransferAmount(parseInt(numOnly, 10).toLocaleString("en-US"));
                    }}
                    className="pl-14 rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                    disabled={loading}
                  />
                </div>
              </div>
            </TabsContent>

            {/* FIELD UMUM (TANGGAL + DESKRIPSI) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tanggal
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10 rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                    disabled={loading}
                  />
                </div>
              </div>

              {activeTab !== "transfer" && (
                <div className="flex items-center gap-2.5 pt-6 sm:pl-3">
                  <input
                    type="checkbox"
                    id="is-recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="size-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    disabled={loading}
                  />
                  <Label htmlFor="is-recurring" className="text-sm font-medium cursor-pointer">
                    Transaksi Berulang
                  </Label>
                </div>
              )}
            </div>

            {/* KONDISI RECURRING INTERVAL */}
            {activeTab !== "transfer" && isRecurring && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Interval Perulangan
                </Label>
                <Select value={recurringInterval} onValueChange={(val) => setRecurringInterval(val ?? "monthly")} disabled={loading}>
                  <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
                    <SelectValue placeholder="Pilih Interval" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="daily">Harian</SelectItem>
                    <SelectItem value="weekly">Mingguan</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                    <SelectItem value="yearly">Tahunan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t.transactionModal.descriptionLabel}
              </Label>
              <Textarea
                placeholder={t.transactionModal.descriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0 min-h-16"
                disabled={loading}
              />
            </div>

            {/* UPLOAD RESI/BUKTI (Hanya untuk Pemasukan / Pengeluaran) */}
            {activeTab !== "transfer" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t.transactionModal.proofLabel}
                </Label>
                <div className="flex items-center gap-4">
                  {receiptPreview ? (
                    <div className="relative size-16 rounded-xl border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      <img src={receiptPreview} alt="Receipt Preview" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveReceipt}
                        className="absolute top-0.5 right-0.5 size-4 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="size-16 rounded-xl border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary flex flex-col items-center justify-center transition-all cursor-pointer"
                      disabled={loading}
                    >
                      <Upload className="size-4.5 mb-1" />
                      <span className="text-[10px] font-bold">BUKTI</span>
                    </button>
                  )}
                  <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
                    <span className="font-semibold text-foreground">
                      {selectedFile ? selectedFile.name : existingReceiptPath ? "Bukti saat ini disimpan" : t.transactionModal.noProof}
                    </span>
                    <span>{t.transactionModal.proofFormat}</span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    className="hidden"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-2xl border-2 cursor-pointer"
                disabled={loading}
              >
                {t.transactionModal.cancel}
              </Button>
              <Button
                type="submit"
                className="rounded-2xl cursor-pointer"
                disabled={loading}
              >
                {loading
                  ? t.settings.saveChanges
                  : isEdit
                  ? t.transactionModal.submitEdit
                  : t.transactionModal.submitAdd}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Sub-Component untuk Form Field Pemasukan / Pengeluaran
function ExpenseIncomeFormFields({
  accounts,
  accountId,
  setAccountId,
  amount,
  setAmount,
  category,
  setCategory,
  categories,
  loading,
}: {
  accounts: Account[];
  accountId: string;
  setAccountId: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  categories: string[];
  loading: boolean;
}) {
  const { t, language } = useLanguage();
  const selectedAccount = accounts.find((a) => a.id === accountId);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t.transactionModal.accountLabel}
          </Label>
          <Select value={accountId} onValueChange={(val) => setAccountId(val ?? "")} disabled={loading}>
            <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
              <SelectValue placeholder={t.transactionModal.accountLabel}>
                {selectedAccount ? selectedAccount.name : (accountId ? t.dashboard.deletedAccount : t.transactionModal.accountLabel)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name} {!acc.is_active && `(${t.accounts.archivedTab})`}
                </SelectItem>
              ))}
              {accountId && !accounts.some((a) => a.id === accountId) && (
                <SelectItem value={accountId}>
                  {t.dashboard.deletedAccount}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t.transactionModal.categoryLabel}
          </Label>
          <Select value={category} onValueChange={(val) => setCategory(val ?? "")} disabled={loading}>
            <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
              <SelectValue placeholder={t.transactionModal.categoryLabel} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {translateCategory(cat, language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t.transactionModal.amountLabel}
        </Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">IDR</span>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              const numOnly = e.target.value.replace(/[^0-9]/g, "");
              if (!numOnly) setAmount("");
              else setAmount(parseInt(numOnly, 10).toLocaleString("en-US"));
            }}
            className="pl-14 rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
            disabled={loading}
          />
        </div>
      </div>
    </>
  );
}
