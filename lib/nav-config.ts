import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Target,
  HandCoins,
  TrendingUp,
  BellRing,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  subtitle?: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    subtitle: "Ringkasan keuangan kamu",
  },
  {
    label: "Transaksi",
    href: "/transactions",
    icon: ArrowLeftRight,
    subtitle: "Semua pemasukan & pengeluaran",
  },
  {
    label: "Akun",
    href: "/accounts",
    icon: Wallet,
    subtitle: "Bank, e-wallet, dan kas kamu",
  },
  {
    label: "Anggaran",
    href: "/budgets",
    icon: PiggyBank,
    subtitle: "Pantau batas pengeluaran",
  },
  {
    label: "Tabungan",
    href: "/goals",
    icon: Target,
    subtitle: "Target dan progres tabungan",
  },
  {
    label: "Utang & Piutang",
    href: "/debts",
    icon: HandCoins,
    subtitle: "Catatan utang dan piutang",
  },
  {
    label: "Investasi",
    href: "/investments",
    icon: TrendingUp,
    subtitle: "Portofolio investasimu",
  },
  {
    label: "Pengingat",
    href: "/reminders",
    icon: BellRing,
    subtitle: "Tagihan dan jadwal penting",
  },
];

export function resolveNavTitle(pathname: string) {
  const match = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match ?? { label: "Dashboard", subtitle: undefined };
}
