"use client";

import { useState } from "react";
import { 
  PiggyBank, 
  Plus, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Flame, 
  Edit2, 
  Trash2, 
  CheckCircle2,
  PieChart
} from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BudgetModal } from "@/components/budgets/budget-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { getBudgets, deleteBudget, BudgetsSummary, BudgetCategoryItem } from "@/lib/budgets/actions";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { useLanguage } from "@/lib/i18n/context";

interface BudgetsClientPageProps {
  initialSummary: BudgetsSummary;
}

export function BudgetsClientPage({ initialSummary }: BudgetsClientPageProps) {
  const { t, language } = useLanguage();
  const [summary, setSummary] = useState<BudgetsSummary>(initialSummary);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<BudgetCategoryItem | null>(null);

  // Confirm delete modal
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetCategoryItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function refreshBudgets() {
    const data = await getBudgets();
    setSummary(data);
  }

  function handleEdit(item: BudgetCategoryItem) {
    setBudgetToEdit(item);
    setIsModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!budgetToDelete) return;
    setDeleteLoading(true);

    const res = await deleteBudget(budgetToDelete.id);
    setDeleteLoading(false);
    setBudgetToDelete(null);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Batas anggaran kategori berhasil dihapus.");
      refreshBudgets();
    }
  }

  return (
    <div className="flex flex-col gap-6 pt-2 font-sans pb-10">
      {/* HEADER BANNER: SUMMARY ANGGARAN */}
      <div 
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl"
        style={{
          background: "linear-gradient(135deg, #1e1b4b, #312e81, #4338ca)",
        }}
      >
        <div className="absolute right-0 top-0 size-64 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-md rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                {language === "ja" ? "月間予算トラッカー" : language === "en" ? "MONTHLY BUDGET TRACKER" : "PEMANTAU ANGGARAN BULANAN"}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.budgets.title}
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              {t.budgets.subtitle}
            </p>
          </div>

          {/* OVERALL PERCENTAGE BADGE */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0 self-start md:self-auto">
            <div className="relative size-16 flex items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={summary.overallPercentage >= 100 ? "text-red-400" : summary.overallPercentage >= 70 ? "text-amber-300" : "text-emerald-400"}
                  strokeDasharray={`${Math.min(100, summary.overallPercentage)}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-base font-black">{summary.overallPercentage}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white/70 font-medium uppercase tracking-wider">{t.budgets.totalUsage}</span>
              <span className="text-base font-extrabold tabular-nums">
                {formatCurrency(summary.totalSpent)}
              </span>
              <span className="text-[11px] text-white/60">{t.budgets.fromTotal} {formatCurrency(summary.totalBudget)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Budget */}
        <div className="p-5 rounded-3xl bg-background border border-border/50 shadow-xs flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.budgets.totalBudget}</span>
          <span className="text-2xl font-extrabold text-foreground tabular-nums">
            {formatCurrency(summary.totalBudget)}
          </span>
        </div>

        {/* Total Spent */}
        <div className="p-5 rounded-3xl bg-background border border-border/50 shadow-xs flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.budgets.usedThisMonth}</span>
          <span className="text-2xl font-extrabold text-foreground tabular-nums">
            {formatCurrency(summary.totalSpent)}
          </span>
        </div>

        {/* Remaining Budget */}
        <div className="p-5 rounded-3xl bg-background border border-border/50 shadow-xs flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.budgets.totalRemaining}</span>
          <span className={`text-2xl font-extrabold tabular-nums ${summary.totalRemaining >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {formatCurrency(summary.totalRemaining)}
          </span>
        </div>
      </div>

      {/* TOOLBAR / CTA */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <PieChart className="size-5 text-primary" />
          <span>{t.budgets.categoryBudgetList} ({summary.budgets.length})</span>
        </h2>

        <Button 
          onClick={() => {
            setBudgetToEdit(null);
            setIsModalOpen(true);
          }}
          className="rounded-2xl gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="size-4.5" />
          <span>{t.budgets.setNewBudget}</span>
        </Button>
      </div>

      {/* GRID KARTU ANGGARAN KATEGORI */}
      {summary.budgets.length === 0 ? (
        <div className="neu-raised-lg rounded-3xl p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-border/50 bg-background">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
            <PiggyBank className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">{t.budgets.noBudgetsYet}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {t.budgets.noBudgetsDesc}
          </p>
          <Button 
            onClick={() => {
              setBudgetToEdit(null);
              setIsModalOpen(true);
            }}
            className="rounded-2xl"
          >
            {t.budgets.setFirstBudget}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summary.budgets.map((item) => {
            const isExceeded = item.status === "EXCEEDED";
            const isWarning = item.status === "WARNING";

            let badgeConfig = {
              label: "AMAN",
              class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
              progressClass: "[&>div]:bg-emerald-500",
              icon: CheckCircle2,
            };

            if (isExceeded) {
              badgeConfig = {
                label: "MELEBIHI BATAS",
                class: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
                progressClass: "[&>div]:bg-red-500",
                icon: AlertTriangle,
              };
            } else if (isWarning) {
              badgeConfig = {
                label: "WASPADA",
                class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                progressClass: "[&>div]:bg-amber-500",
                icon: Flame,
              };
            }

            const StatusIcon = badgeConfig.icon;

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`relative overflow-hidden rounded-3xl border border-border/40 p-6 bg-background shadow-xs flex flex-col justify-between gap-5 ${
                  isExceeded ? "border-red-500/40 bg-red-500/5" : ""
                }`}
              >
                {/* Accent Color Line */}
                <div 
                  className="absolute left-0 top-0 right-0 h-2 pointer-events-none" 
                  style={{ backgroundColor: item.color }}
                />

                <div className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="size-3.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: item.color }} />
                      <div className="flex flex-col">
                        <h3 className="text-base font-bold text-foreground leading-tight">{item.category}</h3>
                        <span className="text-xs text-muted-foreground">Batas: {formatCurrency(item.amount)}</span>
                      </div>
                    </div>

                    <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase gap-1 shrink-0 ${badgeConfig.class}`}>
                      <StatusIcon className="size-3" />
                      <span>{badgeConfig.label}</span>
                    </Badge>
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Terpakai: <strong className="text-foreground">{formatCurrency(item.spent)}</strong></span>
                      <span className="tabular-nums font-bold text-foreground">{item.percentage}%</span>
                    </div>
                    <Progress 
                      value={Math.min(100, item.percentage)} 
                      className={`h-2.5 rounded-full ${badgeConfig.progressClass}`} 
                    />
                  </div>

                  {/* Sisa / Kelebihan Anggaran */}
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-border/30">
                    <span className="text-muted-foreground">
                      {isExceeded ? "Kelebihan:" : "Sisa Anggaran:"}
                    </span>
                    <span className={`font-extrabold tabular-nums ${isExceeded ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {isExceeded ? `+ ${formatCurrency(Math.abs(item.remaining))}` : formatCurrency(item.remaining)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(item)}
                    className="rounded-xl h-8 text-xs gap-1.5 hover:bg-muted"
                  >
                    <Edit2 className="size-3.5" />
                    <span>Ubah</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setBudgetToDelete(item)}
                    className="rounded-xl h-8 text-xs gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50/10"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Hapus</span>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* BUDGET FORM MODAL */}
      <BudgetModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        budgetToEdit={budgetToEdit}
        onSuccess={refreshBudgets}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        open={!!budgetToDelete}
        onOpenChange={(open) => { if (!open) setBudgetToDelete(null); }}
        title="Hapus Batas Anggaran Kategori"
        description={`Apakah Anda yakin ingin menghapus batas anggaran untuk kategori "${budgetToDelete?.category}"?`}
        confirmText="Ya, Hapus Anggaran"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
