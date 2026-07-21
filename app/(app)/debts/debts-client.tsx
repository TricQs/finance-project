"use client";

import { useState } from "react";
import { 
  HandCoins, 
  Plus, 
  Trash2, 
  Check, 
  User, 
  Calendar, 
  DollarSign,
  TrendingDown,
  TrendingUp,
  CreditCard
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDebts, createDebt, addDebtPayment, settleDebt, deleteDebt } from "@/lib/debts/actions";
import { toast } from "sonner";
import type { Debt } from "@/types";

interface DebtsClientPageProps {
  initialDebts: Debt[];
}

export function DebtsClientPage({ initialDebts }: DebtsClientPageProps) {
  const [debts, setDebts] = useState<Debt[]>(initialDebts);
  const [activeTab, setActiveTab] = useState<"debt" | "receivable">("debt");
  const [showSettled, setShowSettled] = useState(false);

  // Form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Installment states
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState("");

  async function refreshDebts() {
    const data = await getDebts();
    setDebts(data);
  }

  async function handleAddDebt(e: React.FormEvent) {
    e.preventDefault();
    if (!contactName.trim()) return toast.error("Nama kontak harus diisi");
    if (!amount || Number(amount) <= 0) return toast.error("Nominal harus lebih dari 0");

    setSubmitting(true);
    const res = await createDebt({
      type: activeTab,
      contact_name: contactName.trim(),
      original_amount: Number(amount),
      due_date: dueDate || null,
      description: description.trim() || null,
    });
    setSubmitting(false);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Catatan utang-piutang berhasil dibuat!");
      setIsAddOpen(false);
      
      // Reset form
      setContactName("");
      setAmount("");
      setDueDate("");
      setDescription("");

      refreshDebts();
    }
  }

  async function handleAddInstallment() {
    if (!payingDebt) return;
    if (!payAmount || Number(payAmount) <= 0) return toast.error("Nominal harus lebih dari 0");

    setSubmitting(true);
    const res = await addDebtPayment(payingDebt.id, Number(payAmount));
    setSubmitting(false);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Pembayaran cicilan berhasil dicatat!");
      setPayingDebt(null);
      setPayAmount("");
      refreshDebts();
    }
  }

  async function handleSettle(id: string) {
    if (!confirm("Tandai lunas utang/piutang ini seketika?")) return;
    const res = await settleDebt(id);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Lunas!");
      refreshDebts();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus catatan ini?")) return;
    const res = await deleteDebt(id);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Catatan dihapus.");
      refreshDebts();
    }
  }

  // Hitung posisi bersih
  const totalDebts = debts
    .filter((d) => d.type === "debt" && !d.is_settled)
    .reduce((sum, d) => sum + Number(d.remaining_amount), 0);

  const totalReceivables = debts
    .filter((d) => d.type === "receivable" && !d.is_settled)
    .reduce((sum, d) => sum + Number(d.remaining_amount), 0);

  const netPosition = totalReceivables - totalDebts;

  // Filter list
  const displayedDebts = debts.filter((d) => {
    const matchesTab = d.type === activeTab;
    const matchesSettle = showSettled ? true : !d.is_settled;
    return matchesTab && matchesSettle;
  });

  return (
    <div className="flex flex-col gap-6 pt-2 font-sans">
      {/* NET POSITION BANNER */}
      <div 
        className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg"
        style={{
          background: netPosition >= 0 
            ? "linear-gradient(135deg, #10b981, #059669)" // Green for net positive
            : "linear-gradient(135deg, #f43f5e, #e11d48)" // Red for net negative
        }}
      >
        <div className="relative z-10 flex flex-col gap-1">
          <span className="text-sm font-medium text-white/80 uppercase tracking-wider">Posisi Bersih Utang-Piutang</span>
          <h2 className="text-4xl font-extrabold tracking-tight tabular-nums">
            {netPosition >= 0 ? "+" : ""}{formatCurrency(netPosition)}
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Piutang Aktif ({formatCurrency(totalReceivables)}) dikurangi Utang Aktif ({formatCurrency(totalDebts)})
          </p>
        </div>
      </div>

      {/* FILTER BAR / ADD BUTTON */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setShowSettled(!showSettled)}
          className={`rounded-2xl border-2 cursor-pointer transition-all ${
            showSettled 
              ? "bg-primary/10 border-primary text-primary" 
              : "border-border"
          }`}
        >
          {showSettled ? "Sembunyikan Lunas" : "Tampilkan Lunas"}
        </Button>

        <Button onClick={() => setIsAddOpen(true)} className="rounded-2xl gap-2 cursor-pointer">
          <Plus className="size-4.5" />
          <span>Buat Catatan</span>
        </Button>
      </div>

      {/* TABS UTANG / PIUTANG */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted p-1 max-w-sm mb-4">
          <TabsTrigger value="debt" className="rounded-xl gap-1.5 cursor-pointer text-xs font-semibold py-2">
            <TrendingDown className="size-3.5 text-red-500" />
            Utang Saya
          </TabsTrigger>
          <TabsTrigger value="receivable" className="rounded-xl gap-1.5 cursor-pointer text-xs font-semibold py-2">
            <TrendingUp className="size-3.5 text-emerald-500" />
            Piutang Saya
          </TabsTrigger>
        </TabsList>

        <TabsContent value="debt" className="space-y-4 outline-none">
          <DebtList 
            items={displayedDebts} 
            onSettle={handleSettle} 
            onInstallment={setPayingDebt} 
            onDelete={handleDelete} 
          />
        </TabsContent>

        <TabsContent value="receivable" className="space-y-4 outline-none">
          <DebtList 
            items={displayedDebts} 
            onSettle={handleSettle} 
            onInstallment={setPayingDebt} 
            onDelete={handleDelete} 
          />
        </TabsContent>
      </Tabs>

      {/* DIALOG ADD CATATAN */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[420px] font-sans rounded-3xl border border-border bg-background p-6 shadow-2xl transition-all">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-foreground">
              Catat {activeTab === "debt" ? "Utang Baru (Pinjam Uang)" : "Piutang Baru (Pinjamkan Uang)"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddDebt} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama Kontak</Label>
              <Input
                placeholder="Contoh: Budi, Kakak, Bank Mandiri"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jumlah Nominal</Label>
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

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jatuh Tempo (Opsional)</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Keterangan / Deskripsi</Label>
              <Input
                placeholder="Opsional"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-2xl">
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-2xl">
                {submitting ? "Memproses..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG PEMBAYARAN CICILAN */}
      <Dialog open={!!payingDebt} onOpenChange={(open) => { if (!open) setPayingDebt(null); }}>
        <DialogContent className="sm:max-w-[420px] font-sans rounded-3xl border border-border bg-background p-6 shadow-2xl transition-all">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-foreground">
              Catat Pembayaran Cicilan
            </DialogTitle>
          </DialogHeader>

          {payingDebt && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-muted/40 border border-border/50 rounded-2xl text-sm text-left">
                <p className="text-muted-foreground">Pembayaran kepada/dari:</p>
                <p className="font-bold text-foreground text-base mt-1.5">{payingDebt.contact_name}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Sisa tagihan aktif: <strong>{formatCurrency(Number(payingDebt.remaining_amount))}</strong> / {formatCurrency(Number(payingDebt.original_amount))}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nominal Pembayaran</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">IDR</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="pl-14 rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                  />
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" onClick={() => setPayingDebt(null)} className="rounded-2xl">
                  Batal
                </Button>
                <Button type="button" onClick={handleAddInstallment} disabled={submitting} className="rounded-2xl">
                  {submitting ? "Memproses..." : "Konfirmasi Bayar"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub list component
function DebtList({
  items,
  onSettle,
  onInstallment,
  onDelete,
}: {
  items: Debt[];
  onSettle: (id: string) => void;
  onInstallment: (dt: Debt) => void;
  onDelete: (id: string) => void;
}) {
  return items.length === 0 ? (
    <div className="neu-raised-lg rounded-3xl p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-border/50 bg-background">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
        <HandCoins className="size-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">Catatan Bersih</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Tidak ada catatan utang/piutang aktif dalam kategori ini.
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => {
        const isPartiallyPaid = Number(item.remaining_amount) < Number(item.original_amount) && !item.is_settled;

        return (
          <div 
            key={item.id}
            className={`neu-raised-sm bg-background border border-border/40 rounded-3xl p-5 flex items-start justify-between gap-4 ${
              item.is_settled ? "opacity-60 bg-muted/20" : ""
            }`}
          >
            <div className="flex items-start gap-4 min-w-0">
              <div className={`size-11 rounded-2xl flex items-center justify-center shrink-0 ${
                item.is_settled 
                  ? "bg-emerald-500/10 text-emerald-500" 
                  : item.type === "debt" 
                    ? "bg-red-500/10 text-red-500" 
                    : "bg-emerald-500/10 text-emerald-500"
              }`}>
                <User className="size-5" />
              </div>

              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-foreground truncate">{item.contact_name}</span>
                  {item.is_settled ? (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 rounded-full text-[9px] uppercase font-bold px-2 py-0.5">
                      LUNAS
                    </Badge>
                  ) : isPartiallyPaid ? (
                    <Badge variant="outline" className="border-amber-500 text-amber-500 rounded-full text-[9px] uppercase font-bold px-2 py-0.5">
                      DICICIL
                    </Badge>
                  ) : null}
                </div>

                {item.due_date && (
                  <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    Jatuh Tempo: {item.due_date}
                  </span>
                )}

                {item.description && (
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </span>
                )}

                <div className="flex flex-col mt-4">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Sisa Hutang</span>
                  <span className="text-lg font-extrabold text-foreground tabular-nums mt-0.5">
                    {formatCurrency(Number(item.remaining_amount))}
                  </span>
                  {isPartiallyPaid && (
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      (Dari awal: {formatCurrency(Number(item.original_amount))})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 items-end">
              {!item.is_settled && (
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => onInstallment(item)}
                    className="rounded-xl border-2 bg-transparent text-foreground hover:bg-muted border-border cursor-pointer h-9 px-3 text-xs font-bold"
                  >
                    Cicil
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => onSettle(item.id)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer h-9 px-3"
                  >
                    <Check className="size-4" />
                    <span className="text-xs">Lunas</span>
                  </Button>
                </div>
              )}
              <Button 
                size="sm"
                variant="ghost"
                onClick={() => onDelete(item.id)}
                className="size-9 p-0 rounded-xl hover:bg-red-50/10 text-muted-foreground hover:text-red-500 cursor-pointer"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
