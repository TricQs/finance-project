"use client";

import { useState, useEffect } from "react";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { upsertBudget, BudgetCategoryItem } from "@/lib/budgets/actions";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";
import { translateCategory } from "@/lib/i18n/dictionary";

const BUDGET_CATEGORIES = [
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

interface BudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetToEdit?: BudgetCategoryItem | null;
  onSuccess?: () => void;
}

export function BudgetModal({
  open,
  onOpenChange,
  budgetToEdit,
  onSuccess,
}: BudgetModalProps) {
  const { t, language } = useLanguage();
  const [category, setCategory] = useState("Makanan & Minuman");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (budgetToEdit) {
      setCategory(budgetToEdit.category);
      setAmount(budgetToEdit.amount.toLocaleString("en-US"));
    } else {
      setCategory("Makanan & Minuman");
      setAmount("");
    }
  }, [budgetToEdit, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) {
      toast.error("Silakan pilih kategori anggaran");
      return;
    }

    const rawNum = Number(amount.replace(/,/g, ""));
    if (!rawNum || rawNum <= 0) {
      toast.error("Batas anggaran harus lebih besar dari 0");
      return;
    }

    setLoading(true);
    const res = await upsertBudget(category, rawNum);
    setLoading(false);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success(budgetToEdit ? "Batas anggaran berhasil diperbarui!" : "Anggaran kategori baru berhasil ditetapkan!");
      onSuccess?.();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] font-sans rounded-3xl border border-border bg-background p-6 shadow-2xl transition-all">
        <DialogHeader className="border-b border-border pb-4 mb-2">
          <DialogTitle className="font-heading text-lg font-bold text-foreground">
            {budgetToEdit ? t.budgetModal.editTitle : t.budgetModal.addTitle}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* KATEGORI */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t.budgetModal.categoryLabel}
            </Label>
            <Select 
              value={category} 
              onValueChange={(val) => setCategory(val ?? "")}
              disabled={loading || !!budgetToEdit}
            >
              <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0 w-full">
                <SelectValue placeholder={t.budgetModal.categoryLabel} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {BUDGET_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {translateCategory(cat, language)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* BATAS NOMINAL ANGGARAN BULANAN */}
          <div className="space-y-1.5">
            <Label htmlFor="budget-amount" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t.budgetModal.limitLabel}
            </Label>
            <Input
              id="budget-amount"
              type="text"
              inputMode="numeric"
              placeholder={t.budgetModal.limitPlaceholder}
              value={amount}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                if (!raw) {
                  setAmount("");
                } else {
                  setAmount(Number(raw).toLocaleString("en-US"));
                }
              }}
              className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0 text-base font-bold tabular-nums"
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-2xl border-2 border-border"
            >
              {t.budgetModal.cancel}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-2xl font-bold shadow-sm"
            >
              {loading ? t.settings.saveChanges : budgetToEdit ? t.budgetModal.submitEdit : t.budgetModal.submitAdd}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
