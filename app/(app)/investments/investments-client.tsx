"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  Plus, 
  Trash2, 
  ChevronRight, 
  DollarSign, 
  Briefcase, 
  BarChart3,
  Percent,
  CheckCircle,
  X
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
import { getInvestments, recordBuy, recordSell, deleteInvestment } from "@/lib/investments/actions";
import { toast } from "sonner";
import type { Account, Investment } from "@/types";

const INVESTMENT_TYPES = [
  { value: "gold", label: "Emas" },
  { value: "stock", label: "Saham" },
  { value: "crypto", label: "Crypto" },
  { value: "mutual_fund", label: "Reksa Dana" },
  { value: "other", label: "Instrumen Lain" },
];

interface InvestmentsClientPageProps {
  initialInvestments: Investment[];
  accounts: Account[];
}

export function InvestmentsClientPage({
  initialInvestments,
  accounts,
}: InvestmentsClientPageProps) {
  const [investments, setInvestments] = useState<Investment[]>(initialInvestments);

  // States untuk harga saat ini (untuk dinamis gain/loss)
  // key: investment.id, value: currentPrice
  const [currentPrices, setCurrentPrices] = useState<Record<string, string>>({});
  
  // Dialog States
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [buyType, setBuyType] = useState<Investment["type"]>("stock");
  const [buyName, setBuyName] = useState("");
  const [buyTicker, setBuyTicker] = useState("");
  const [buyPlatform, setBuyPlatform] = useState("");
  const [buyQuantity, setBuyQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split("T")[0]);
  const [buyNotes, setBuyNotes] = useState("");
  const [buyAccountId, setBuyAccountId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sell States
  const [sellingAsset, setSellingAsset] = useState<Investment | null>(null);
  const [sellQuantity, setSellQuantity] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [sellDate, setSellDate] = useState(new Date().toISOString().split("T")[0]);
  const [sellAccountId, setSellAccountId] = useState("");

  async function refreshInvestments() {
    const data = await getInvestments();
    setInvestments(data);
  }

  // Handle Catat Pembelian
  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    if (!buyName.trim()) return toast.error("Nama aset investasi harus diisi");
    if (!buyQuantity || Number(buyQuantity) <= 0) return toast.error("Jumlah unit harus lebih dari 0");
    if (!buyPrice || Number(buyPrice) <= 0) return toast.error("Harga beli unit harus lebih dari 0");

    setSubmitting(true);
    const res = await recordBuy({
      type: buyType,
      name: buyName.trim(),
      ticker: buyTicker.trim().toUpperCase() || null,
      platform: buyPlatform.trim() || null,
      quantity: Number(buyQuantity),
      buy_price: Number(buyPrice),
      buy_date: buyDate,
      notes: buyNotes.trim() || null,
    }, buyAccountId || undefined);
    setSubmitting(false);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Pembelian aset berhasil dicatat!");
      setIsBuyOpen(false);

      // Reset Form
      setBuyName("");
      setBuyTicker("");
      setBuyPlatform("");
      setBuyQuantity("");
      setBuyPrice("");
      setBuyNotes("");
      setBuyAccountId("");

      refreshInvestments();
    }
  }

  // Handle Catat Penjualan
  async function handleSell() {
    if (!sellingAsset) return;
    if (!sellQuantity || Number(sellQuantity) <= 0) return toast.error("Jumlah unit harus lebih dari 0");
    if (!sellPrice || Number(sellPrice) <= 0) return toast.error("Harga jual unit harus lebih dari 0");

    setSubmitting(true);
    const res = await recordSell(
      sellingAsset.id,
      Number(sellQuantity),
      Number(sellPrice),
      sellDate,
      sellAccountId || undefined
    );
    setSubmitting(false);

    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Penjualan aset berhasil dicatat!");
      setSellingAsset(null);
      setSellQuantity("");
      setSellPrice("");
      setSellAccountId("");
      refreshInvestments();
    }
  }

  // Handle Hapus Aset
  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus investasi ini dari portofolio?")) return;
    const res = await deleteInvestment(id);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Aset berhasil dihapus.");
      refreshInvestments();
    }
  }

  // Input harga terkini dinamis
  function handlePriceChange(id: string, value: string) {
    setCurrentPrices(prev => ({
      ...prev,
      [id]: value
    }));
  }

  // Hitung overview data
  // Aktif (yang belum lunas terjual)
  const activeAssets = investments.filter((i) => !i.is_sold);

  let totalBuyValue = 0;
  let totalCurrentValue = 0;

  activeAssets.forEach((asset) => {
    const qty = Number(asset.quantity);
    const buyPriceVal = Number(asset.buy_price);
    const currentPriceInput = currentPrices[asset.id];
    
    // Gunakan harga terkini input manual jika ada, jika tidak, default ke buy_price (0% gain/loss)
    const curPriceVal = currentPriceInput && Number(currentPriceInput) > 0
      ? Number(currentPriceInput)
      : buyPriceVal;

    totalBuyValue += qty * buyPriceVal;
    totalCurrentValue += qty * curPriceVal;
  });

  const totalGainLoss = totalCurrentValue - totalBuyValue;
  const totalGainLossPercent = totalBuyValue > 0 ? (totalGainLoss / totalBuyValue) * 100 : 0;

  // Hitung alokasi asset per tipe
  const allocationMap: Record<string, number> = {};
  activeAssets.forEach((asset) => {
    const value = Number(asset.quantity) * (Number(currentPrices[asset.id]) || Number(asset.buy_price));
    allocationMap[asset.type] = (allocationMap[asset.type] || 0) + value;
  });

  return (
    <div className="flex flex-col gap-6 pt-2 font-sans">
      {/* PORTFOLIO OVERVIEW BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TOTAL VALUE */}
        <div className="neu-raised-sm rounded-3xl p-5 bg-background text-left flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-primary">
              <Briefcase className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nilai Portofolio</span>
              <span className="text-2xl font-extrabold text-foreground tabular-nums mt-0.5">
                {formatCurrency(totalCurrentValue)}
              </span>
            </div>
          </div>
        </div>

        {/* GAIN LOSS NOMINAL */}
        <div className="neu-raised-sm rounded-3xl p-5 bg-background text-left flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center ${
              totalGainLoss >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            }`}>
              <TrendingUp className={`size-5 ${totalGainLoss < 0 && "rotate-90"}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Keuntungan / Kerugian</span>
              <span className={`text-2xl font-extrabold tabular-nums mt-0.5 ${
                totalGainLoss >= 0 ? "text-emerald-500" : "text-red-500"
              }`}>
                {totalGainLoss >= 0 ? "+" : ""}{formatCurrency(totalGainLoss)}
              </span>
            </div>
          </div>
        </div>

        {/* GAIN LOSS PERSEN */}
        <div className="neu-raised-sm rounded-3xl p-5 bg-background text-left flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center ${
              totalGainLossPercent >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            }`}>
              <Percent className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gain / Loss (%)</span>
              <span className={`text-2xl font-extrabold tabular-nums mt-0.5 ${
                totalGainLossPercent >= 0 ? "text-emerald-500" : "text-red-500"
              }`}>
                {totalGainLossPercent >= 0 ? "+" : ""}{totalGainLossPercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ALLOCATION LIST */}
      {activeAssets.length > 0 && (
        <div className="neu-raised-lg rounded-3xl p-6 bg-background">
          <h3 className="font-heading mb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-left">
            Alokasi Aset Investasi
          </h3>
          <div className="flex flex-wrap gap-6 items-center">
            {Object.keys(allocationMap).map((typeKey) => {
              const val = allocationMap[typeKey];
              const pct = totalCurrentValue > 0 ? (val / totalCurrentValue) * 100 : 0;
              const typeLabel = INVESTMENT_TYPES.find(t => t.value === typeKey)?.label || typeKey;

              return (
                <div key={typeKey} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-foreground">
                    {typeLabel}: {pct.toFixed(1)}% <span className="text-muted-foreground">({formatCurrency(val)})</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTION BAR */}
      <div className="flex items-center justify-end">
        <Button onClick={() => setIsBuyOpen(true)} className="rounded-2xl gap-2 cursor-pointer">
          <Plus className="size-4.5" />
          <span>Catat Pembelian Aset</span>
        </Button>
      </div>

      {/* INVESTMENTS LIST */}
      {activeAssets.length === 0 ? (
        <div className="neu-raised-lg rounded-3xl p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-border/50 bg-background">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
            <BarChart3 className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Belum Ada Kepemilikan Investasi</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Mulai pantau kekayaan jangka panjang Anda. Catat portofolio emas, reksa dana, atau crypto Anda sekarang.
          </p>
          <Button onClick={() => setIsBuyOpen(true)} className="rounded-2xl">
            Catat Aset Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeAssets.map((asset) => {
            const qty = Number(asset.quantity);
            const buyPriceVal = Number(asset.buy_price);
            const currentPriceInput = currentPrices[asset.id];
            
            const curPriceVal = currentPriceInput && Number(currentPriceInput) > 0
              ? Number(currentPriceInput)
              : buyPriceVal;

            const totalCost = qty * buyPriceVal;
            const totalVal = qty * curPriceVal;
            const assetGainLoss = totalVal - totalCost;
            const assetGainLossPct = totalCost > 0 ? (assetGainLoss / totalCost) * 100 : 0;

            const typeLabel = INVESTMENT_TYPES.find(t => t.value === asset.type)?.label || asset.type;

            return (
              <div 
                key={asset.id}
                className="neu-raised-sm bg-background border border-border/40 rounded-3xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground truncate">{asset.name}</span>
                      {asset.ticker && (
                        <Badge className="bg-indigo-500 hover:bg-indigo-600 rounded-full text-[9px] font-mono font-bold px-2 py-0.5">
                          {asset.ticker}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      Instrumen: {typeLabel} {asset.platform && `• Platform: ${asset.platform}`}
                    </span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(asset.id)}
                    className="size-9 p-0 rounded-xl hover:bg-red-50/10 text-muted-foreground hover:text-red-500 cursor-pointer shrink-0"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {/* QUANTITY & AVG PRICE */}
                <div className="grid grid-cols-3 gap-3 bg-muted/20 border border-border/30 rounded-2xl p-3 text-xs">
                  <div className="flex flex-col text-left">
                    <span className="text-muted-foreground font-semibold">Dimiliki</span>
                    <span className="text-sm font-bold text-foreground mt-0.5">{qty} Unit</span>
                  </div>
                  <div className="flex flex-col text-left border-l border-border/50 pl-3">
                    <span className="text-muted-foreground font-semibold">Harga Rata-rata</span>
                    <span className="text-sm font-bold text-foreground mt-0.5">{formatCurrency(buyPriceVal)}</span>
                  </div>
                  <div className="flex flex-col text-left border-l border-border/50 pl-3">
                    <span className="text-muted-foreground font-semibold">Harga Terkini</span>
                    <input 
                      type="number"
                      placeholder={buyPriceVal.toString()}
                      value={currentPriceInput || ""}
                      onChange={(e) => handlePriceChange(asset.id, e.target.value)}
                      className="text-sm font-bold text-primary bg-transparent outline-none w-full border-b border-primary/20 focus:border-primary mt-0.5"
                    />
                  </div>
                </div>

                {/* DYNAMIC PROFIT CALCULATION */}
                <div className="flex items-baseline justify-between pt-2 border-t border-border/50">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Performa Keuntungan</span>
                    <span className={`text-base font-extrabold mt-0.5 tabular-nums ${
                      assetGainLoss >= 0 ? "text-emerald-500" : "text-red-500"
                    }`}>
                      {assetGainLoss >= 0 ? "+" : ""}{formatCurrency(assetGainLoss)} ({assetGainLossPct.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => setSellingAsset(asset)}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer h-9 px-3.5 text-xs font-bold"
                    >
                      Jual Unit
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DIALOG CATAT PEMBELIAN */}
      <Dialog open={isBuyOpen} onOpenChange={setIsBuyOpen}>
        <DialogContent className="sm:max-w-[440px] font-sans rounded-3xl border border-border bg-background p-6 shadow-2xl transition-all">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-foreground">
              Catat Pembelian Investasi
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleBuy} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipe Aset</Label>
                <Select value={buyType} onValueChange={(val: any) => setBuyType(val)}>
                  <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {INVESTMENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ticker / Kode Saham</Label>
                <Input
                  placeholder="Contoh: BBCA, BTC, ANTAM"
                  value={buyTicker}
                  onChange={(e) => setBuyTicker(e.target.value)}
                  className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama Aset Investasi</Label>
              <Input
                placeholder="Contoh: Bank Central Asia, Emas Logam Mulia"
                value={buyName}
                onChange={(e) => setBuyName(e.target.value)}
                className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platform Pialang/Broker</Label>
                <Input
                  placeholder="Contoh: Bibit, Ajaib, Indodax"
                  value={buyPlatform}
                  onChange={(e) => setBuyPlatform(e.target.value)}
                  className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tanggal Pembelian</Label>
                <Input
                  type="date"
                  value={buyDate}
                  onChange={(e) => setBuyDate(e.target.value)}
                  className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jumlah Unit</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="0.0"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(e.target.value)}
                  className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Harga per Unit</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">IDR</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="pl-12 rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Potong Dana Rekening (Opsional)
              </Label>
              <Select value={buyAccountId} onValueChange={(val) => setBuyAccountId(val ?? "")}>
                <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
                  <SelectValue placeholder="Pilih Rekening" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="">Jangan Potong Saldo</SelectItem>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name} (Saldo: {formatCurrency(acc.balance)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsBuyOpen(false)} className="rounded-2xl">
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-2xl">
                {submitting ? "Memproses..." : "Catat Beli"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG CATAT PENJUALAN */}
      <Dialog open={!!sellingAsset} onOpenChange={(open) => { if (!open) setSellingAsset(null); }}>
        <DialogContent className="sm:max-w-[420px] font-sans rounded-3xl border border-border bg-background p-6 shadow-2xl transition-all">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-foreground">
              Catat Penjualan Investasi
            </DialogTitle>
          </DialogHeader>

          {sellingAsset && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-muted/40 border border-border/50 rounded-2xl text-sm text-left">
                <p className="text-muted-foreground">Aset yang akan dijual:</p>
                <p className="font-bold text-foreground text-base mt-1.5">{sellingAsset.name}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Jumlah dimiliki: <strong>{sellingAsset.quantity} unit</strong> (Harga rata-rata: {formatCurrency(Number(sellingAsset.buy_price))})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit Dijual</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.0"
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(e.target.value)}
                    className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Harga Jual per Unit</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">IDR</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      className="pl-12 rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tanggal Penjualan</Label>
                <Input
                  type="date"
                  value={sellDate}
                  onChange={(e) => setSellDate(e.target.value)}
                  className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Masukkan Dana ke Rekening (Opsional)
                </Label>
                <Select value={sellAccountId} onValueChange={(val) => setSellAccountId(val ?? "")}>
                  <SelectTrigger className="rounded-2xl border-2 border-border focus:ring-0">
                    <SelectValue placeholder="Pilih Rekening" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="">Jangan Masukkan ke Rekening</SelectItem>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name} (Saldo: {formatCurrency(acc.balance)})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" onClick={() => setSellingAsset(null)} className="rounded-2xl">
                  Batal
                </Button>
                <Button type="button" onClick={handleSell} disabled={submitting} className="rounded-2xl">
                  {submitting ? "Memproses..." : "Konfirmasi Jual"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
