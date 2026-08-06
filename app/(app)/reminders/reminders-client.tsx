"use client";

import { useState } from "react";
import { 
  BellRing, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Clock, 
  CheckCircle,
  HelpCircle,
  Calendar
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
import { Badge } from "@/components/ui/badge";
import { getReminders, createReminder, payReminder, deleteReminder } from "@/lib/reminders/actions";
import { toast } from "sonner";
import { IndonesianDatePicker } from "@/components/ui/indonesian-date-picker";
import type { Account, Reminder } from "@/types";

interface RemindersClientPageProps {
  initialReminders: Reminder[];
  accounts: Account[];
}

export function RemindersClientPage({
  initialReminders,
  accounts,
}: RemindersClientPageProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [showPaid, setShowPaid] = useState(false);

  // Form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [repeatInterval, setRepeatInterval] = useState<Reminder["repeat_interval"]>("once");
  const [submitting, setSubmitting] = useState(false);

  // Pay dialog states
  const [payingReminder, setPayingReminder] = useState<Reminder | null>(null);
  const [payAccountId, setPayAccountId] = useState("");

  async function refreshReminders() {
    const data = await getReminders();
    setReminders(data);
  }

  async function handleAddReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("Judul tagihan harus diisi");
    if (!dueDate) return toast.error("Tanggal jatuh tempo harus diisi");

    setSubmitting(true);
    const res = await createReminder({
      title: title.trim(),
      amount: amount ? Number(amount) : null,
      due_date: dueDate,
      repeat_interval: repeatInterval,
    });
    setSubmitting(false);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Pengingat tagihan berhasil dibuat!");
      setIsAddOpen(false);
      refreshReminders();
    }
  }

  async function handlePayReminder() {
    if (!payingReminder) return;
    if (payingReminder.amount && Number(payingReminder.amount) > 0 && !payAccountId) {
      return toast.error("Pilih rekening untuk memotong saldo pengeluaran.");
    }

    setSubmitting(true);
    const res = await payReminder(payingReminder.id, payAccountId);
    setSubmitting(false);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Tagihan ditandai lunas & pengeluaran dicatat.");
      setPayingReminder(null);
      setPayAccountId("");
      refreshReminders();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus pengingat ini?")) return;
    const res = await deleteReminder(id);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Pengingat dihapus.");
      refreshReminders();
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const displayedReminders = reminders.filter((r) => r.is_done === showPaid);

  return (
    <div className="flex flex-col gap-6 pt-2 font-sans">
      {/* SUMMARY BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          onClick={() => setShowPaid(false)}
          className={`cursor-pointer rounded-3xl p-5 border transition-all ${
            !showPaid 
              ? "neu-pressed-sm border-primary/40 bg-background" 
              : "neu-raised-sm border-border/40 hover:bg-muted/10 bg-background"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <Clock className="size-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-2xl font-extrabold text-foreground tabular-nums">
                {reminders.filter((r) => !r.is_done).length}
              </span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tagihan Aktif</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setShowPaid(true)}
          className={`cursor-pointer rounded-3xl p-5 border transition-all ${
            showPaid 
              ? "neu-pressed-sm border-primary/40 bg-background" 
              : "neu-raised-sm border-border/40 hover:bg-muted/10 bg-background"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle className="size-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-2xl font-extrabold text-foreground tabular-nums">
                {reminders.filter((r) => r.is_done).length}
              </span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sudah Dibayar</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex items-center justify-end">
        <Button onClick={() => setIsAddOpen(true)} className="rounded-2xl gap-2 cursor-pointer">
          <Plus className="size-4.5" />
          <span>Buat Pengingat</span>
        </Button>
      </div>

      {/* REMINDERS LIST */}
      {displayedReminders.length === 0 ? (
        <div className="neu-raised-lg rounded-3xl p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-border/50 bg-background">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
            <BellRing className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Tidak Ada Tagihan</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Semua rapi! Tidak ada tagihan {showPaid ? "yang sudah dibayar" : "aktif saat ini"}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedReminders.map((rmd) => {
            const isOverdue = !rmd.is_done && rmd.due_date < todayStr;

            return (
              <div 
                key={rmd.id}
                className="neu-raised-sm bg-background border border-border/40 rounded-3xl p-5 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className={`size-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    rmd.is_done 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : isOverdue 
                        ? "bg-red-500/10 text-red-500 animate-pulse" 
                        : "bg-indigo-500/10 text-indigo-500"
                  }`}>
                    <BellRing className="size-5" />
                  </div>

                  <div className="flex flex-col text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-foreground truncate">{rmd.title}</span>
                      {isOverdue && (
                        <Badge variant="destructive" className="text-[9px] font-bold uppercase rounded-full px-2">
                          TERLAMBAT
                        </Badge>
                      )}
                      {rmd.repeat_interval !== "once" && (
                        <Badge variant="outline" className="text-[9px] font-bold uppercase rounded-full px-2">
                          {rmd.repeat_interval}
                        </Badge>
                      )}
                    </div>
                    
                    <span className="text-xs text-muted-foreground mt-1">
                      Jatuh tempo: <strong className="text-foreground">{rmd.due_date}</strong>
                    </span>

                    {rmd.amount && (
                      <span className="text-lg font-extrabold text-foreground tabular-nums mt-3">
                        {formatCurrency(Number(rmd.amount))}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 items-end">
                  {!rmd.is_done && (
                    <Button 
                      size="sm"
                      onClick={() => setPayingReminder(rmd)}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer h-9 px-3"
                    >
                      <Check className="size-4" />
                      <span className="text-xs">Lunas</span>
                    </Button>
                  )}
                  <Button 
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(rmd.id)}
                    className="size-9 p-0 rounded-xl hover:bg-red-50/10 text-muted-foreground hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DIALOG ADD REMINDER */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[420px] font-sans rounded-3xl border border-border bg-background p-6 shadow-2xl transition-all">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-foreground">
              Buat Pengingat Tagihan Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddReminder} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Judul Tagihan</Label>
              <Input
                placeholder="Contoh: Tagihan Listrik, Internet Wifi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jumlah Nominal (Opsional)</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jatuh Tempo</Label>
                <IndonesianDatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  placeholder="dd/mm/yyyy"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pengulangan</Label>
                <Select value={repeatInterval} onValueChange={(val: any) => setRepeatInterval(val)}>
                  <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
                    <SelectValue placeholder="Interval" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="once">Sekali Saja</SelectItem>
                    <SelectItem value="weekly">Mingguan</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                    <SelectItem value="yearly">Tahunan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-2xl">
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-2xl">
                {submitting ? "Mengeksekusi..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG MELUNASI TAGIHAN (PILIH REKENING) */}
      <Dialog open={!!payingReminder} onOpenChange={(open) => { if (!open) setPayingReminder(null); }}>
        <DialogContent className="sm:max-w-[420px] font-sans rounded-3xl border border-border bg-background p-6 shadow-2xl transition-all">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-foreground">
              Konfirmasi Pelunasan Tagihan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="p-4 bg-muted/40 rounded-2xl border border-border/50 text-sm">
              <p className="text-muted-foreground">Anda akan menandai lunas tagihan berikut:</p>
              <p className="font-bold text-foreground text-base mt-1.5">{payingReminder?.title}</p>
              {payingReminder?.amount && (
                <p className="text-lg font-extrabold text-foreground tabular-nums mt-1">
                  {formatCurrency(Number(payingReminder.amount))}
                </p>
              )}
            </div>

            {payingReminder?.amount && Number(payingReminder.amount) > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Potong Saldo Rekening
                </Label>
                <Select value={payAccountId} onValueChange={(val) => setPayAccountId(val ?? "")}>
                  <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
                    <SelectValue placeholder="Pilih Rekening" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name} (Saldo: {formatCurrency(acc.balance)})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-muted-foreground">
                  * Tindakan ini otomatis akan menambahkan catatan transaksi pengeluaran baru di rekening Anda.
                </span>
              </div>
            )}

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setPayingReminder(null)} className="rounded-2xl">
                Batal
              </Button>
              <Button type="button" onClick={handlePayReminder} disabled={submitting} className="rounded-2xl">
                {submitting ? "Memproses..." : "Tandai Lunas"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
