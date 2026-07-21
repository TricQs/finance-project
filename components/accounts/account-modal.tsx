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
import { toast } from "sonner";
import { 
  Wallet, 
  CreditCard, 
  Banknote, 
  PiggyBank, 
  Briefcase, 
  Coins, 
  Building2, 
  Check 
} from "lucide-react";
import { createAccount, updateAccount } from "@/lib/accounts/actions";
import type { Account } from "@/types";

const ACCOUNT_ICONS = [
  { name: "Wallet", icon: Wallet },
  { name: "CreditCard", icon: CreditCard },
  { name: "Banknote", icon: Banknote },
  { name: "PiggyBank", icon: PiggyBank },
  { name: "Briefcase", icon: Briefcase },
  { name: "Coins", icon: Coins },
  { name: "Building2", icon: Building2 },
];

const ACCOUNT_COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#64748b", // Slate
];

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountToEdit?: Account | null;
  onSuccess?: () => void;
}

export function AccountModal({
  open,
  onOpenChange,
  accountToEdit = null,
  onSuccess,
}: AccountModalProps) {
  const isEdit = !!accountToEdit;

  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("bank");
  const [institution, setInstitution] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [icon, setIcon] = useState("Wallet");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setType(accountToEdit.type);
      setInstitution(accountToEdit.institution || "");
      setAccountNumber(accountToEdit.account_number || "");
      setBalance(accountToEdit.balance.toString());
      setCurrency(accountToEdit.currency);
      setColor(accountToEdit.color);
      setIcon(accountToEdit.icon);
    } else {
      setName("");
      setType("bank");
      setInstitution("");
      setAccountNumber("");
      setBalance("");
      setCurrency("IDR");
      setColor(ACCOUNT_COLORS[0]);
      setIcon("Wallet");
    }
  }, [accountToEdit, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama akun harus diisi");
      return;
    }

    setLoading(true);
    const payload = {
      name: name.trim(),
      type,
      institution: institution.trim() || null,
      account_number: accountNumber.trim() || null,
      balance: isEdit ? Number(balance) : Number(balance) || 0,
      currency,
      color,
      icon,
    };

    let result;
    if (isEdit && accountToEdit) {
      result = await updateAccount(accountToEdit.id, payload);
    } else {
      result = await createAccount(payload);
    }

    setLoading(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(isEdit ? "Informasi akun berhasil diubah!" : "Akun baru berhasil dibuat!");
      onSuccess?.();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] font-sans rounded-3xl border border-border bg-background p-6 shadow-2xl transition-all">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold text-foreground">
            {isEdit ? "Edit Rekening / Akun" : "Tambah Rekening Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* NAMA AKUN */}
          <div className="space-y-1.5">
            <Label htmlFor="account-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nama Akun / Rekening
            </Label>
            <Input
              id="account-name"
              placeholder="Contoh: BCA Personal, Gopay Utama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
              disabled={loading}
            />
          </div>

          {/* TIPE AKUN & MATA UANG */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="account-type" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tipe
              </Label>
              <Select
                value={type}
                onValueChange={(val) => setType(val as Account["type"])}
                disabled={loading}
              >
                <SelectTrigger id="account-type" className="rounded-2xl border-2 border-border focus:ring-0">
                  <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="bank">Bank / Rekening</SelectItem>
                  <SelectItem value="ewallet">E-Wallet / Dompet Digital</SelectItem>
                  <SelectItem value="cash">Uang Tunai</SelectItem>
                  <SelectItem value="investment">Investasi</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account-currency" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Mata Uang
              </Label>
              <Select
                value={currency}
                onValueChange={(val) => setCurrency(val ?? "IDR")}
                disabled={loading}
              >
                <SelectTrigger id="account-currency" className="rounded-2xl border-2 border-border focus:ring-0">
                  <SelectValue placeholder="Pilih Mata Uang" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="IDR">Rupiah (IDR)</SelectItem>
                  <SelectItem value="USD">Dollar (USD)</SelectItem>
                  <SelectItem value="SGD">Singapore Dollar (SGD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* INSTITUSI & NOMOR REKENING */}
          {type !== "cash" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="account-institution" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nama Institusi
                </Label>
                <Input
                  id="account-institution"
                  placeholder="Contoh: BCA, Bank Mandiri, Gojek"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="account-number" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nomor Rekening / ID
                </Label>
                <Input
                  id="account-number"
                  placeholder="Opsional"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* SALDO AWAL (Hanya saat pembuatan baru) */}
          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="account-balance" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Saldo Awal
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  {currency}
                </span>
                <Input
                  id="account-balance"
                  type="number"
                  placeholder="0"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="pl-14 rounded-2xl border-2 border-border focus-visible:border-primary focus-visible:ring-0"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* PILIHAN WARNA KARTU */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Warna Kartu Rekening
            </Label>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {ACCOUNT_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColor(col)}
                  className="size-7 rounded-full cursor-pointer border border-black/10 dark:border-white/10 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                  style={{ backgroundColor: col }}
                >
                  {color === col && <Check className="size-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* PILIHAN IKON */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ikon Rekening
            </Label>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {ACCOUNT_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`size-10 rounded-2xl cursor-pointer border-2 transition-all flex items-center justify-center ${
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-2xl"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="rounded-2xl"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Akun"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
