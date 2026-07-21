"use client";

import { useState } from "react";
import { 
  Target, 
  Plus, 
  Trash2, 
  PiggyBank, 
  Calendar, 
  TrendingUp, 
  Heart,
  Car,
  Home,
  Laptop,
  Plane,
  CheckCircle,
  Gift
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
import { Badge } from "@/components/ui/badge";
import { getGoals, createGoal, addGoalFunds, deleteGoal } from "@/lib/goals/actions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { Account, Goal } from "@/types";

const GOAL_ICONS = [
  { name: "Target", icon: Target },
  { name: "PiggyBank", icon: PiggyBank },
  { name: "Home", icon: Home },
  { name: "Car", icon: Car },
  { name: "Laptop", icon: Laptop },
  { name: "Plane", icon: Plane },
  { name: "Heart", icon: Heart },
  { name: "Gift", icon: Gift },
];

const GOAL_COLORS = [
  "#10b981", // Emerald (default)
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#f43f5e", // Rose
];

const ICON_MAP: Record<string, any> = {
  Target,
  PiggyBank,
  Home,
  Car,
  Laptop,
  Plane,
  Heart,
  Gift,
};

interface GoalsClientPageProps {
  initialGoals: Goal[];
  accounts: Account[];
}

export function GoalsClientPage({
  initialGoals,
  accounts,
}: GoalsClientPageProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);

  // Form add states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [icon, setIcon] = useState("Target");
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  // Form add funds states
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [fundAccountId, setFundAccountId] = useState("");

  // Celebratory completed goal animation trigger
  const [celebrateGoalName, setCelebrateGoalName] = useState<string | null>(null);

  async function refreshGoals() {
    const data = await getGoals();
    setGoals(data);
  }

  async function handleAddGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nama target tabungan harus diisi");
    if (!targetAmount || Number(targetAmount) <= 0) return toast.error("Nominal target harus lebih dari 0");

    setSubmitting(true);
    const res = await createGoal({
      name: name.trim(),
      target_amount: Number(targetAmount),
      target_date: targetDate || null,
      icon,
      color,
    });
    setSubmitting(false);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Target tabungan baru berhasil dibuat!");
      setIsAddOpen(false);
      refreshGoals();
    }
  }

  async function handleAddFunds() {
    if (!activeGoal) return;
    if (!fundAmount || Number(fundAmount) <= 0) return toast.error("Nominal alokasi dana harus lebih dari 0");
    if (!fundAccountId) return toast.error("Pilih rekening asal pemotongan dana.");

    setSubmitting(true);
    const res = await addGoalFunds(activeGoal.id, Number(fundAmount), fundAccountId);
    setSubmitting(false);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Dana berhasil ditambahkan!");
      
      // Jika goal baru saja tercapai, aktifkan overlay perayaan
      if (res.success.is_completed && !activeGoal.is_completed) {
        setCelebrateGoalName(res.success.name);
      }

      setActiveGoal(null);
      setFundAmount("");
      setFundAccountId("");
      refreshGoals();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus target tabungan ini?")) return;
    const res = await deleteGoal(id);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Target tabungan berhasil dihapus.");
      refreshGoals();
    }
  }

  // Hitung sisa bulan dan target bulanan yang diperlukan
  function getGoalCalculations(g: Goal) {
    if (!g.target_date) return { monthsLeft: null, monthlyTarget: null };

    const today = new Date();
    const target = new Date(g.target_date);
    const timeDiff = target.getTime() - today.getTime();
    
    if (timeDiff <= 0) return { monthsLeft: 0, monthlyTarget: null };

    const monthsLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 30.4)); // estimasi bulan
    const remainingAmount = Number(g.target_amount) - Number(g.current_amount);
    
    if (remainingAmount <= 0) return { monthsLeft, monthlyTarget: 0 };
    
    const monthlyTarget = Number((remainingAmount / Math.max(monthsLeft, 1)).toFixed(0));

    return { monthsLeft, monthlyTarget };
  }

  return (
    <div className="flex flex-col gap-6 pt-2 font-sans relative">
      {/* OVERLAY SELEBRASI GOAL SELESAI */}
      <AnimatePresence>
        {celebrateGoalName && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCelebrateGoalName(null)}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: [0.8, 1.1, 1], y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center p-8 max-w-sm flex flex-col items-center"
            >
              <div className="size-24 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-2xl animate-bounce mb-6">
                <CheckCircle className="size-14" />
              </div>
              <h2 className="text-3xl font-extrabold text-white">Luar Biasa! 🎉</h2>
              <p className="text-base text-gray-300 mt-3 leading-relaxed">
                Target tabungan <strong>"{celebrateGoalName}"</strong> Anda telah tercapai 100%! Anda telah berhasil menabung dengan cerdas.
              </p>
              <span className="text-xs text-white/50 mt-8 uppercase tracking-widest font-bold">Klik di mana saja untuk menutup</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER ACTION BAR */}
      <div className="flex items-center justify-end">
        <Button onClick={() => setIsAddOpen(true)} className="rounded-2xl gap-2 cursor-pointer">
          <Plus className="size-4.5" />
          <span>Buat Target</span>
        </Button>
      </div>

      {/* GOALS GRID */}
      {goals.length === 0 ? (
        <div className="neu-raised-lg rounded-3xl p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-border/50 bg-background">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
            <Target className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Belum Ada Target Menabung</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Beli gadget baru, rencana liburan, atau dana darurat? Buat target menabung Anda sekarang.
          </p>
          <Button onClick={() => setIsAddOpen(true)} className="rounded-2xl">
            Buat Target Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((g) => {
            const percent = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
            const IconComp = ICON_MAP[g.icon] || Target;
            const calcs = getGoalCalculations(g);

            return (
              <div 
                key={g.id}
                className="neu-raised-sm bg-background border border-border/40 rounded-3xl p-5 flex flex-col justify-between gap-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div 
                      className="size-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: g.color }}
                    >
                      <IconComp className="size-6" />
                    </div>

                    <div className="flex flex-col text-left min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-foreground truncate">{g.name}</span>
                        {g.is_completed && (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 rounded-full text-[9px] uppercase font-bold px-2 py-0.5">
                            TERCAPAI
                          </Badge>
                        )}
                      </div>
                      
                      {g.target_date ? (
                        <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          Target: {g.target_date} {calcs.monthsLeft !== null && `(Sisa ${calcs.monthsLeft} bln)`}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground mt-0.5">Tanpa batas waktu</span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(g.id)}
                    className="size-9 p-0 rounded-xl hover:bg-red-50/10 text-muted-foreground hover:text-red-500 cursor-pointer shrink-0"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {/* TARGET VALUE COMPARISON */}
                <div className="grid grid-cols-2 gap-4 bg-muted/20 border border-border/30 rounded-2xl p-3 text-xs">
                  <div className="flex flex-col text-left">
                    <span className="text-muted-foreground font-semibold">Terkumpul</span>
                    <span className="text-base font-bold text-foreground mt-0.5 tabular-nums">
                      {formatCurrency(Number(g.current_amount))}
                    </span>
                  </div>
                  <div className="flex flex-col text-left border-l border-border/50 pl-4">
                    <span className="text-muted-foreground font-semibold">Target</span>
                    <span className="text-base font-bold text-foreground mt-0.5 tabular-nums">
                      {formatCurrency(Number(g.target_amount))}
                    </span>
                  </div>
                </div>

                {/* PROGRESS BAR & SMART MONTHLY SUGGESTION */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground">
                    <span>Kemajuan</span>
                    <span style={{ color: g.color }}>{percent.toFixed(0)}%</span>
                  </div>
                  
                  <div className="relative w-full h-2.5 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.min(percent, 100)}%`,
                        backgroundColor: g.color
                      }}
                    />
                  </div>

                  {!g.is_completed && calcs.monthlyTarget !== null && calcs.monthlyTarget > 0 && (
                    <div className="text-[10px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider pt-1 bg-primary/2 rounded-xl p-2.5">
                      <TrendingUp className="size-3.5" />
                      <span>Butuh menabung {formatCurrency(calcs.monthlyTarget)} / bulan</span>
                    </div>
                  )}
                </div>

                {/* TAMBAH DANA BUTTON */}
                {!g.is_completed && (
                  <Button 
                    variant="outline"
                    onClick={() => setActiveGoal(g)}
                    className="rounded-2xl border-2 w-full mt-2 cursor-pointer text-xs font-bold h-10"
                  >
                    Tambah Dana Tabungan
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DIALOG ADD NEW GOAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[440px] font-sans rounded-3xl border border-border bg-background p-6 shadow-2xl transition-all">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-foreground">
              Buat Target Tabungan Impian
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddGoal} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama Target</Label>
              <Input
                placeholder="Contoh: Beli Laptop Baru, Liburan Jepang"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Nominal</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">IDR</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="pl-14 rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Tanggal</Label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                />
              </div>
            </div>

            {/* PILIHAN WARNA */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pilih Warna Aksen</Label>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {GOAL_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    className="size-7 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: col }}
                  >
                    {color === col && <CheckCircle className="size-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* PILIHAN IKON */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ikon Target</Label>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {GOAL_ICONS.map((item) => {
                  const IconComponent = item.icon;
                  const isSelected = icon === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setIcon(item.name)}
                      className={`size-10 rounded-2xl border-2 transition-all flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border hover:border-muted-foreground text-muted-foreground"
                      }`}
                    >
                      <IconComponent className="size-4.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-2xl">
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-2xl">
                {submitting ? "Memproses..." : "Buat Target"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG ALOKASI DANA TABUNGAN */}
      <Dialog open={!!activeGoal} onOpenChange={(open) => { if (!open) setActiveGoal(null); }}>
        <DialogContent className="sm:max-w-[420px] font-sans rounded-3xl border border-border bg-background p-6 shadow-2xl transition-all">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-foreground">
              Alokasikan Dana Tabungan
            </DialogTitle>
          </DialogHeader>

          {activeGoal && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-muted/40 border border-border/50 rounded-2xl text-sm flex items-center gap-3">
                <div 
                  className="size-11 rounded-2xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: activeGoal.color }}
                >
                  {(() => {
                    const IconComp = ICON_MAP[activeGoal.icon] || Target;
                    return <IconComp className="size-5.5" />;
                  })()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-foreground text-base leading-tight">{activeGoal.name}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    Terkumpul: {formatCurrency(Number(activeGoal.current_amount))} / {formatCurrency(Number(activeGoal.target_amount))}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Potong Saldo Rekening</Label>
                <Select value={fundAccountId} onValueChange={(val) => setFundAccountId(val ?? "")}>
                  <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
                    <SelectValue placeholder="Pilih Rekening" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name} (Saldo: {formatCurrency(acc.balance)})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nominal Dana Ditabung</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">IDR</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="pl-14 rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                  />
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" onClick={() => setActiveGoal(null)} className="rounded-2xl">
                  Batal
                </Button>
                <Button type="button" onClick={handleAddFunds} disabled={submitting} className="rounded-2xl">
                  {submitting ? "Memproses..." : "Konfirmasi Tabung"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
