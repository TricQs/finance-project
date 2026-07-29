import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Download,
  CreditCard,
  PiggyBank,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 1. Query Profile / User Name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const userName = profile?.full_name || user.email?.split("@")[0] || "Al Razi";

  // 2. Query Balances
  const { data: accounts } = await supabase
    .from("accounts")
    .select("balance")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .is("deleted_at", null);

  const totalBalance =
    accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 10340;

  // 3. Query Transactions This Month
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const { data: thisMonthTx } = await supabase
    .from("transactions")
    .select("id, amount, type, category, date, description")
    .eq("user_id", user.id)
    .gte("date", startOfThisMonth)
    .is("deleted_at", null)
    .order("date", { ascending: false });

  let totalIncomeThisMonth = 0;
  let totalExpenseThisMonth = 0;

  thisMonthTx?.forEach((tx) => {
    if (tx.type === "income") totalIncomeThisMonth += Number(tx.amount);
    else if (tx.type === "expense") totalExpenseThisMonth += Number(tx.amount);
  });

  // Fallbacks if user is new
  const incomeDisplay = totalIncomeThisMonth || 5200;
  const expenseDisplay = totalExpenseThisMonth || 1475;
  const savingsDisplay = incomeDisplay - expenseDisplay || 620;

  return (
    <div className="flex flex-col gap-6 pt-2 pb-10 font-sans text-zinc-900 dark:text-zinc-100">
      {/* ── TOP HERO BANNER: Good Morning, [User Name] ✨ ── */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 font-heading">
              Good Morning, {userName} <Sparkles size={22} className="text-amber-300" />
            </h1>
            <p className="text-sm text-indigo-100 mt-1">
              Get a clear snapshot of your financial performance and recent transactions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md text-xs font-semibold flex items-center gap-2 transition cursor-pointer">
              This Month <ChevronDown size={14} />
            </button>
            <button className="px-4 py-2 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold flex items-center gap-2 transition shadow-md cursor-pointer">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* 4 Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {/* Card 1: Total Balance */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Wallet size={18} />
              </div>
              <span className="text-xs text-zinc-400 font-bold">...</span>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-bold font-heading tracking-tight">
                {formatCurrency(totalBalance)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                Total Balance · Net worth
              </p>
            </div>
          </div>

          {/* Card 2: Monthly Income */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={18} />
              </div>
              <span className="text-xs text-zinc-400 font-bold">...</span>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatCurrency(incomeDisplay)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                Monthly Income
              </p>
            </div>
          </div>

          {/* Card 3: Monthly Expenses */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <CreditCard size={18} />
              </div>
              <span className="text-xs text-zinc-400 font-bold">...</span>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-rose-600 dark:text-rose-400">
                {formatCurrency(expenseDisplay)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                Monthly Expenses
              </p>
            </div>
          </div>

          {/* Card 4: Savings */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <PiggyBank size={18} />
              </div>
              <span className="text-xs text-zinc-400 font-bold">...</span>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-blue-600 dark:text-blue-400">
                {formatCurrency(savingsDisplay)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                Savings · This month
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Transactions Overview + Sales Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions Overview Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Transactions Overview
              </h2>
              <p className="text-3xl font-extrabold text-zinc-900 dark:text-white font-heading mt-1">
                Rp 8.435.000<span className="text-xl text-zinc-400 font-normal">.00</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" /> Total Sales
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block" /> Earning
                </span>
              </div>
              <button className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                This Year <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Bar Chart Visual Mock */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2">
            {[
              { month: "Jan", height: "40%", highlight: false },
              { month: "Feb", height: "55%", highlight: false },
              { month: "Mar", height: "35%", highlight: false },
              { month: "Apr", height: "70%", highlight: false },
              { month: "May", height: "60%", highlight: false },
              { month: "Jun", height: "85%", highlight: false },
              { month: "Jul", height: "100%", highlight: true, amount: "Rp 22,430k" },
              { month: "Aug", height: "50%", highlight: false },
              { month: "Sep", height: "65%", highlight: false },
              { month: "Oct", height: "75%", highlight: false },
              { month: "Nov", height: "45%", highlight: false },
              { month: "Dec", height: "60%", highlight: false },
            ].map((bar) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                {bar.highlight && (
                  <span className="absolute -top-7 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                    {bar.amount}
                  </span>
                )}
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    bar.highlight
                      ? "bg-indigo-600 shadow-lg shadow-indigo-500/30"
                      : "bg-zinc-200 dark:bg-zinc-800 group-hover:bg-indigo-400"
                  }`}
                  style={{ height: bar.height }}
                />
                <span className="text-[11px] font-semibold text-zinc-400">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category / Sales Overview (1 col) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-indigo-600" /> Sales Overview
              </h2>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-white font-heading">
                8379
              </span>
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                ↑ 4.9%
              </span>
            </div>

            {/* Category Progress Bars */}
            <div className="space-y-3.5">
              {[
                { name: "Makanan & Minuman", pct: 81 },
                { name: "Belanja Harian", pct: 73 },
                { name: "Transportasi", pct: 54 },
                { name: "Tagihan & Utilitas", pct: 32 },
                { name: "Hiburan & Gaya Hidup", pct: 20 },
              ].map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-600 dark:text-zinc-300">{item.name}</span>
                    <span className="text-zinc-400 font-mono">{item.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Recent Orders / Transactions Table ── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Recent Orders &amp; Transactions
          </h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
            <button className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <SlidersHorizontal size={13} /> Sort by <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Product Info</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer / Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {(thisMonthTx && thisMonthTx.length > 0
                ? thisMonthTx.slice(0, 5)
                : [
                    {
                      id: "1",
                      description: "Men's Genuine Leather Shoes",
                      orderId: "#878910",
                      date: "2 Dec 2026",
                      customer: "Oliver John Brown",
                      category: "Shoes, Sneakers",
                      status: "Pending",
                      amount: 789000,
                    },
                    {
                      id: "2",
                      description: "Gaji Bulanan / Income",
                      orderId: "#878911",
                      date: "1 Dec 2026",
                      customer: "Perusahaan Utama",
                      category: "Gaji & Bonus",
                      status: "Completed",
                      amount: 8500000,
                    },
                    {
                      id: "3",
                      description: "Belanja Supermarket",
                      orderId: "#878912",
                      date: "28 Nov 2026",
                      customer: "Indomaret / Alfamart",
                      category: "Kebutuhan Rumah",
                      status: "Completed",
                      amount: 450000,
                    },
                  ]
              ).map((row: any) => (
                <tr key={row.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">
                    {row.description || "Transaksi Baru"}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-400">
                    {row.orderId || `#${row.id.slice(0, 6)}`}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-500">
                    {row.date}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-500">
                    {row.customer || row.category}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        row.status === "Pending"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      }`}
                    >
                      {row.status || "Completed"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-zinc-900 dark:text-white">
                    {formatCurrency(Number(row.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}