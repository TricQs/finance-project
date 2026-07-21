"use client";

import { useState } from "react";
import { 
  PiggyBank, 
  Plus, 
  Trash2, 
  Sparkles, 
  Copy, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown,
  Info
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
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  getBudgets, 
  createOrUpdateBudget, 
  copyPreviousMonthBudget, 
  getSuggestedBudget, 
  deleteBudget,
  UnifiedBudget 
} from "@/lib/budgets/actions";
import { toast } from "sonner";

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

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

interface BudgetsClientPageProps {
  initialBudgets: UnifiedBudget[];
  initialMonth: number;
  initialYear: number;
}

export function BudgetsClientPage({
  initialBudgets,
  initialMonth,
  initialYear,
}: BudgetsClientPageProps) {
  const [budgets, setBudgets] = useState<UnifiedBudget[]>(initialBudgets);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  async function loadBudgetsForPeriod(m: number, y: number) {
    const data = await getBudgets(m, y);
    setBudgets(data);
  }

  // Ganti bulan mundur
  function handlePrevMonth() {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth === 0) {
      newMonth = 12;
      newYear -= 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    loadBudgetsForPeriod(newMonth, newYear);
  }

  // Ganti bulan maju
  function handleNextMonth() {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth === 13) {
      newMonth = 1;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    loadBudgetsForPeriod(newMonth, newYear);
  }

  // Salin template anggaran bulan lalu
  async function handleCopyBudget() {
    setSubmitting(true);
    const res = await copyPreviousMonthBudget(month, year);
    setSubmitting(false);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Anggaran bulan lalu berhasil disalin ke bulan ini!");
      setBudgets(res.success);
    }
  }

  // Dapatkan saran anggaran berdasarkan pengeluaran 3 bulan terakhir
  async function handleGetSuggestion() {
    setLoadingSuggestion(true);
    const avg = await getSuggestedBudget(category);
    setLoadingSuggestion(false);
    if (avg > 0) {
      setAmount(avg.toString());
      toast.info(`Disarankan nominal Rp ${avg.toLocaleString("id-ID")} berdasarkan rata-rata pengeluaran 3 bulan terakhir.`);
    } else {
      toast.error("Belum memiliki pengeluaran historis untuk kategori ini.");
    }
  }

  // Simpan Anggaran
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return toast.error("Nominal limit harus lebih dari 0");

    setSubmitting(true);
    const res = await createOrUpdateBudget(category, Number(amount), "monthly", month, year);
    setSubmitting(false);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Anggaran berhasil diperbarui!");
      setIsOpen(false);
      loadBudgetsForPeriod(month, year);
    }
  }

  // Hapus Anggaran
  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus anggaran kategori ini?")) return;
    const res = await deleteBudget(id);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Anggaran dihapus.");
      loadBudgetsForPeriod(month, year);
    }
  }

  // Hitung total ringkasan
  const totalLimit = budgets.reduce((sum, bg) => sum + Number(bg.amount), 0);
  const totalSpent = budgets.reduce((sum, bg) => sum + bg.spent, 0);
  const totalPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 pt-2 font-sans">
      {/* PERIOD PICKER PANEL */}
      <div className="neu-raised-sm rounded-3xl p-4 bg-background flex items-center justify-between">
        <Button variant="ghost" onClick={handlePrevMonth} className="rounded-xl size-10 p-0 cursor-pointer">
          <ChevronLeft className="size-5" />
        </Button>
        <span className="text-base font-bold text-foreground">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <Button variant="ghost" onClick={handleNextMonth} className="rounded-xl size-10 p-0 cursor-pointer">
          <ChevronRight className="size-5" />
        </Button>
      </div>

      {/* SUMMARY BANNER */}
      {budgets.length > 0 && (
        <div className="neu-raised-lg rounded-3xl p-6 bg-background space-y-4">
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Anggaran Dialokasikan</span>
              <span className="text-2xl font-extrabold text-foreground tabular-nums mt-0.5">{formatCurrency(totalLimit)}</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Realisasi Terpakai</span>
              <span className="text-2xl font-extrabold text-foreground tabular-nums mt-0.5">{formatCurrency(totalSpent)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Efisiensi</span>
              <span className={totalPercent > 100 ? "text-red-500" : "text-emerald-500"}>
                {totalPercent.toFixed(1)}% Terpakai
              </span>
            </div>
            <Progress 
              value={Math.min(totalPercent, 100)} 
              className="h-2 rounded-full"
              style={{
                backgroundColor: "var(--border)",
                color: totalPercent > 100 ? "var(--red-500)" : "var(--primary)"
              }}
            />
          </div>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button 
          variant="outline"
          size="sm"
          onClick={handleCopyBudget}
          disabled={submitting}
          className="rounded-2xl border-2 cursor-pointer gap-2"
        >
          <Copy className="size-4" />
          <span>Salin Bulan Lalu</span>
        </Button>

        <Button onClick={() => setIsOpen(true)} className="rounded-2xl gap-2 cursor-pointer">
          <Plus className="size-4.5" />
          <span>Set Anggaran</span>
        </Button>
      </div>

      {/* BUDGETS LIST */}
      {budgets.length === 0 ? (
        <div className="neu-raised-lg rounded-3xl p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-border/50 bg-background">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
            <PiggyBank className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Belum Ada Anggaran</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Atur limit pengeluaran bulanan per kategori untuk menghentikan kebiasaan boros.
          </p>
          <Button onClick={() => setIsOpen(true)} className="rounded-2xl">
            Buat Anggaran Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((bg) => {
            const percent = bg.amount > 0 ? (bg.spent / bg.amount) * 100 : 0;
            const isOver = bg.spent > bg.amount;
            
            // Dynamic bar color
            let colorHex = "#10b981"; // emerald
            if (percent > 80 && percent <= 100) colorHex = "#f59e0b"; // amber
            else if (percent > 100) colorHex = "#f43f5e"; // rose

            return (
              <div 
                key={bg.id}
                className="neu-raised-sm bg-background border border-border/40 rounded-3xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col text-left">
                    <span className="text-lg font-bold text-foreground">{bg.category}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      Batas Bulanan: <strong>{formatCurrency(Number(bg.amount))}</strong>
                    </span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(bg.id)}
                    className="size-9 p-0 rounded-xl hover:bg-red-50/10 text-muted-foreground hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingDown className="size-3.5" />
                      Aktual: {formatCurrency(bg.spent)}
                    </span>
                    <span style={{ color: colorHex }}>
                      {percent.toFixed(0)}%
                    </span>
                  </div>

                  <div className="relative w-full h-2.5 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.min(percent, 100)}%`,
                        backgroundColor: colorHex
                      }}
                    />
                  </div>

                  {isOver && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-wider pt-0.5">
                      <Info className="size-3.5" />
                      <span>Melebihi Anggaran Sebesar {formatCurrency(bg.spent - bg.amount)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DIALOG ADD/EDIT BUDGET */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[420px] font-sans rounded-3xl border border-border bg-background p-6 shadow-2xl transition-all">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-foreground">
              Atur Anggaran Kategori
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kategori Pengeluaran</Label>
              <Select value={category} onValueChange={(val) => setCategory(val ?? EXPENSE_CATEGORIES[0])}>
                <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Limit Anggaran Bulanan</Label>
                <button
                  type="button"
                  onClick={handleGetSuggestion}
                  disabled={loadingSuggestion}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="size-3" />
                  <span>Saran (3 Bln)</span>
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">IDR</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-14 rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-2xl">
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-2xl">
                {submitting ? "Menyimpan..." : "Simpan Anggaran"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
