// TODO: ganti dengan query Supabase asli ke tabel `transactions`
// begitu halaman transaksi & data mulai keisi.

export const DUMMY_WEEKLY_DATA = [
  { day: "Sen", income: 450000, expense: 320000 },
  { day: "Sel", income: 200000, expense: 180000 },
  { day: "Rab", income: 600000, expense: 410000 },
  { day: "Kam", income: 350000, expense: 290000 },
  { day: "Jum", income: 800000, expense: 520000 },
  { day: "Sab", income: 150000, expense: 610000 },
  { day: "Min", income: 100000, expense: 240000 },
]

export const DUMMY_CATEGORY_BREAKDOWN = [
  { category: "Makanan & Minuman", amount: 1250000, color: "var(--chart-1)" },
  { category: "Transportasi", amount: 680000, color: "var(--chart-2)" },
  { category: "Belanja", amount: 540000, color: "var(--chart-4)" },
  { category: "Hiburan", amount: 320000, color: "var(--chart-5)" },
  { category: "Lainnya", amount: 210000, color: "var(--muted-foreground)" },
]

export const DUMMY_SUMMARY = {
  totalBalance: 12450000,
  balanceChangePercent: 8.4,
  totalIncomeThisMonth: 6800000,
  totalExpenseThisMonth: 4230000,
}