"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Clock,
  SlidersHorizontal,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeft,
  Search,
  ArrowRightLeft,
  Wallet,
  PiggyBank,
  BellRing,
  HelpCircle
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Community & Official Style Brand Logo Badges untuk E-Commerce Indonesia (Shopee, Tokopedia, Blibli, Lazada)
function ShopeeIcon({ className }: { className?: string }) {
  return (
    <div className={cn("w-6 h-6 rounded-full bg-gradient-to-br from-[#ff5722] to-[#ee4d2d] text-white flex items-center justify-center shrink-0 shadow-sm select-none p-1", className)}>
      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white">
        <path d="M19 8H16V6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6V8H5C3.89543 8 3 8.89543 3 10V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V10C21 8.89543 20.1046 8 19 8ZM10 6C10 4.89543 10.8954 4 12 4C13.1046 4 14 4.89543 14 6V8H10V6ZM13.8 17.5C12.5 18.2 10.8 17.8 10.2 16.8C10 16.5 10 16.1 10.2 15.8C10.5 15.3 11.2 15.1 11.7 15.3L12.5 15.6C13.2 15.9 13.8 15.4 13.7 14.6C13.6 14.1 13.1 13.8 12.6 13.8H11.5C11 13.8 10.5 13.5 10.3 13.1C10.1 12.7 10.2 12.1 10.6 11.8C11.6 11 13.2 11.1 14 12.1C14.2 12.4 14.2 12.8 14 13.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function TokopediaIcon({ className }: { className?: string }) {
  return (
    <div className={cn("w-6 h-6 rounded-full bg-gradient-to-br from-[#03be0f] to-[#03ac0e] text-white flex items-center justify-center shrink-0 shadow-sm select-none p-1", className)}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
        <path d="M19 6h-3c0-2.21-1.79-4-4-4S8 3.79 8 6H5C3.9 6 3 6.9 3 8v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm-3.5 8c.83 0 1.5.67 1.5 1.5S9.33 15 8.5 15 7 14.33 7 13.5 7.67 12 8.5 12zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM12 18l-1.5-1.5h3L12 18z"/>
      </svg>
    </div>
  );
}

function BlibliIcon({ className }: { className?: string }) {
  return (
    <div className={cn("w-6 h-6 rounded-full bg-gradient-to-br from-[#00a8f7] to-[#0095da] text-white flex items-center justify-center shrink-0 shadow-sm select-none p-1", className)}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
        <path d="M19 7h-3V6c0-2.21-1.79-4-4-4S8 3.79 8 6v1H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-9-1c0-1.1.9-2 2-2s2 .9 2 2v1h-4V6zm.8 11.5c-1.3 0-2.3-1-2.3-2.3 0-1.2.9-2.1 2.1-2.2v-3.5h2.2v8h-2zm0-5.3c-.5 0-.9.4-.9.9s.4.9.9.9.9-.4.9-.9-.4-.9-.9-.9z"/>
      </svg>
    </div>
  );
}

function LazadaIcon({ className }: { className?: string }) {
  return (
    <div className={cn("w-6 h-6 rounded-full bg-gradient-to-tr from-[#1a1c6e] via-[#8d1679] to-[#f41168] text-white flex items-center justify-center shrink-0 shadow-sm select-none p-1", className)}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </div>
  );
}

type MenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

// Menu Items (Sesuai 21st.dev: Dashboard = LayoutGrid, Updates = Clock, Insights = SlidersHorizontal, Message = MessageSquare, Customers = Users)
const MENU_ITEMS: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { label: "Insights", href: "/insights", icon: SlidersHorizontal },
  { label: "Budgets", href: "/budgets", icon: PiggyBank },
];

const STORE_ITEMS: MenuItem[] = [
  { label: "Shopee", href: "/store/shopee", icon: ShopeeIcon },
  { label: "Tokopedia", href: "/store/tokopedia", icon: TokopediaIcon },
  { label: "Blibli", href: "/store/blibli", icon: BlibliIcon },
  { label: "Lazada", href: "/store/lazada", icon: LazadaIcon },
];

const MOBILE_PRIMARY_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { label: "Insights", href: "/insights", icon: SlidersHorizontal },
] as const;

const MOBILE_SECONDARY_NAV = [
  { label: "Budgets", href: "/budgets", icon: PiggyBank },
  { label: "Shopee", href: "/store/shopee", icon: ShopeeIcon },
  { label: "Tokopedia", href: "/store/tokopedia", icon: TokopediaIcon },
  { label: "Blibli", href: "/store/blibli", icon: BlibliIcon },
  { label: "Lazada", href: "/store/lazada", icon: LazadaIcon },
  { label: "Pengaturan", href: "/settings", icon: Settings },
] as const;

type AppSidebarProps = {
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  isCollapsed?: boolean;
  onToggleSidebar?: () => void;
};

import { useLanguage } from "@/lib/i18n/context";

import { ActionSearchBar, Action } from "@/components/ui/action-search-bar";
import { useTheme } from "next-themes";

export function AppSidebar({
  userName = "Pengguna",
  userEmail = "",
  avatarUrl,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Automatically expand sidebar when hovered or searching, collapse when idle
  const isCollapsed = !isHovered && !isSearchFocused;

  const MENU_ITEMS: MenuItem[] = [
    { label: t.nav.dashboard, href: "/dashboard", icon: LayoutGrid },
    { label: t.nav.accounts, href: "/accounts", icon: Wallet },
    { label: t.nav.transactions, href: "/transactions", icon: ArrowRightLeft },
    { label: t.nav.insights, href: "/insights", icon: SlidersHorizontal },
    { label: t.nav.budgets, href: "/budgets", icon: PiggyBank },
  ];

  const appSearchActions: Action[] = [
    {
      id: "nav-dashboard",
      label: t.nav.dashboard,
      icon: <LayoutGrid className="h-4 w-4 text-indigo-500" />,
      description: language === "ja" ? "ダッシュボード" : language === "id" ? "Ringkasan Arus Kas" : "Cashflow Summary",
      end: "Nav",
      onSelect: () => router.push("/dashboard")
    },
    {
      id: "nav-accounts",
      label: t.nav.accounts,
      icon: <Wallet className="h-4 w-4 text-emerald-500" />,
      description: language === "ja" ? "口座・残高" : language === "id" ? "Kelola Saldo Dompet" : "Wallet Balances",
      end: "Nav",
      onSelect: () => router.push("/accounts")
    },
    {
      id: "nav-transactions",
      label: t.nav.transactions,
      icon: <ArrowRightLeft className="h-4 w-4 text-blue-500" />,
      description: language === "ja" ? "取引履歴" : language === "id" ? "Riwayat Transaksi" : "Transaction History",
      end: "Nav",
      onSelect: () => router.push("/transactions")
    },
    {
      id: "nav-insights",
      label: t.nav.insights,
      icon: <SlidersHorizontal className="h-4 w-4 text-purple-500" />,
      description: language === "ja" ? "財務分析" : language === "id" ? "Analisis Skor Keuangan" : "Financial Health Score",
      end: "Nav",
      onSelect: () => router.push("/insights")
    },
    {
      id: "nav-budgets",
      label: t.nav.budgets,
      icon: <PiggyBank className="h-4 w-4 text-amber-500" />,
      description: language === "ja" ? "予算管理" : language === "id" ? "Batas Anggaran Bulanan" : "Monthly Budget Limits",
      end: "Nav",
      onSelect: () => router.push("/budgets")
    },
    {
      id: "nav-reminders",
      label: language === "ja" ? "請求書リマインダー" : language === "id" ? "Pengingat Tagihan" : "Bill Reminders",
      icon: <BellRing className="h-4 w-4 text-rose-500" />,
      description: language === "id" ? "Jadwal Tagihan Rutin" : "Recurring Bills",
      end: "Nav",
      onSelect: () => router.push("/reminders")
    },
    {
      id: "nav-settings",
      label: t.nav.settings,
      icon: <Settings className="h-4 w-4 text-slate-500" />,
      description: language === "ja" ? "設定" : language === "id" ? "Profil & Pengaturan" : "Profile & Preferences",
      end: "Nav",
      onSelect: () => router.push("/settings")
    },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR - Stationary Left Icons & Inline Action Search Bar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "hidden md:flex h-screen shrink-0 flex-col justify-between border-r border-slate-200/60 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transform-gpu p-3.5 transition-[width] duration-300 cubic-bezier(0.22,1,0.36,1) select-none z-40 sticky top-0 left-0 font-sans",
          isCollapsed ? "w-[76px]" : "w-[280px]"
        )}
      >
        {/* Top Section */}
        <div className="flex flex-col gap-2 overflow-y-auto scrollbar-none flex-1 pr-0.5">
          {/* Row 1: Logo (Image Fixed on Left, Text Fades In/Out) */}
          <div className="flex items-center h-11 px-2 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <Logo size="sm" showText={false} />
              </div>
              <span
                className={cn(
                  "font-heading font-extrabold text-base text-foreground tracking-tight whitespace-nowrap transition-all duration-300 ease-in-out flex items-center gap-1",
                  isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
                )}
              >
                Uangku
                <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
              </span>
            </div>
          </div>

          {/* Row 2: Search Bar (ActionSearchBar with Left Stationary Animated Icon & Smooth Expansion) */}
          <div className="h-10 flex items-center my-0.5 px-0.5">
            <ActionSearchBar
              actions={appSearchActions}
              isCollapsed={isCollapsed}
              onFocusChange={setIsSearchFocused}
              placeholder={language === "ja" ? "検索..." : language === "id" ? "Cari fitur..." : "Search..."}
            />
          </div>

          {/* Row 3: Section Header "MENU" */}
          <div className="h-5 flex items-center my-1 px-3.5">
            <span
              className={cn(
                "text-[11px] font-semibold text-slate-400 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap transition-all duration-300 ease-in-out",
                isCollapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[220px]"
              )}
            >
              Menu
            </span>
          </div>

          {/* Row 4: MENU Nav Items */}
          <nav id="tour-sidebar-nav" className="flex flex-col gap-1">
            {MENU_ITEMS.map(({ label, href, icon: Icon, badge }) => {
              const isActive =
                pathname === href || pathname?.startsWith(`${href}/`);
              const isAccounts = href === "/accounts";
              const translatedLabel =
                href === "/dashboard"
                  ? t.nav.dashboard
                  : href === "/accounts"
                  ? t.nav.accounts
                  : href === "/transactions"
                  ? t.nav.transactions
                  : href === "/insights"
                  ? t.nav.insights
                  : href === "/budgets"
                  ? t.nav.budgets
                  : label;

              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={true}
                  id={isAccounts ? "tour-accounts-link" : undefined}
                  data-tour={label.toLowerCase()}
                  title={isCollapsed ? translatedLabel : undefined}
                  className={cn(
                    "group/navitem flex items-center justify-between px-3.5 pr-5 py-2.5 rounded-2xl text-sm font-medium transition-all cursor-pointer",
                    isActive
                      ? "bg-[#eef2ff] dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4.5 shrink-0 transition-transform duration-200 group-hover/navitem:scale-110" />
                    <span
                      className={cn(
                        "whitespace-nowrap text-sm font-medium transition-all duration-300 ease-in-out inline-block group-hover/navitem:translate-x-1.5 group-hover/navitem:text-indigo-600 dark:group-hover/navitem:text-indigo-400",
                        isCollapsed ? "max-w-0 opacity-0 pointer-events-none overflow-hidden" : "max-w-[220px] opacity-100"
                      )}
                    >
                      {translatedLabel}
                    </span>
                  </div>

                  {!isCollapsed && badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 shrink-0 ml-2">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Row 5: Section Header "STORE" */}
          <div className="h-6 flex items-center my-1 px-3.5 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <span
              className={cn(
                "text-[11px] font-semibold text-slate-400 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap transition-all duration-300 ease-in-out",
                isCollapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[220px]"
              )}
            >
              Store
            </span>
          </div>

          {/* Row 6: STORE Nav Items List */}
          <nav className="flex flex-col gap-1">
            {STORE_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname?.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  title={isCollapsed ? label : undefined}
                  className={cn(
                    "group/navitem flex items-center gap-3 px-3.5 pr-5 py-2.5 rounded-2xl text-sm font-medium transition-all cursor-pointer",
                    isActive
                      ? "bg-[#eef2ff] dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="size-5 shrink-0 transition-transform duration-200 group-hover/navitem:scale-110" />
                  <span
                    className={cn(
                      "whitespace-nowrap text-sm font-medium transition-all duration-300 ease-in-out inline-block group-hover/navitem:translate-x-1.5 group-hover/navitem:text-indigo-600 dark:group-hover/navitem:text-indigo-400",
                      isCollapsed ? "max-w-0 opacity-0 pointer-events-none overflow-hidden" : "max-w-[220px] opacity-100"
                    )}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Fixed Pengaturan & Profil Akun */}
        <div className="flex flex-col gap-2 pt-3 border-t-2 border-slate-200 dark:border-zinc-800 shrink-0">
          <Link
            href="/settings"
            prefetch={true}
            title={isCollapsed ? t.nav.settings : undefined}
            className={cn(
              "group/navitem flex items-center gap-3 px-3.5 pr-5 py-2.5 rounded-2xl text-sm font-medium transition-all cursor-pointer",
              pathname?.startsWith("/settings")
                ? "bg-[#eef2ff] dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400 font-semibold shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Settings className="size-4.5 shrink-0 transition-transform duration-200 group-hover/navitem:scale-110" />
            <span
              className={cn(
                "whitespace-nowrap text-sm font-medium transition-all duration-300 ease-in-out inline-block group-hover/navitem:translate-x-1.5 group-hover/navitem:text-indigo-600 dark:group-hover/navitem:text-indigo-400",
                isCollapsed ? "max-w-0 opacity-0 pointer-events-none overflow-hidden" : "max-w-[220px] opacity-100"
              )}
            >
              {t.nav.settings}
            </span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center rounded-2xl text-left outline-none transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-900 px-2.5 py-2 border border-slate-200/60 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 overflow-hidden gap-3"
              )}
            >
              <Avatar size="sm" className="shrink-0 border border-slate-200 dark:border-zinc-700">
                <AvatarImage src={avatarUrl} alt={userName} />
                <AvatarFallback className="font-semibold text-xs bg-slate-200 dark:bg-zinc-800">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "flex min-w-0 flex-col overflow-hidden transition-all duration-300 ease-in-out",
                  isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[160px] opacity-100"
                )}
              >
                <span className="truncate text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                  {userName}
                </span>
                <span className="truncate text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                  {userEmail}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isCollapsed ? "center" : "start"} side="top" className="w-56 rounded-2xl font-sans">
              <DropdownMenuItem
                className="cursor-pointer text-sm font-medium flex items-center"
                onClick={() => router.push("/settings")}
              >
                <Settings className="size-4 mr-2" />
                <span>{language === "ja" ? "プロフィール・設定" : language === "en" ? "Profile & Settings" : "Profil & Pengaturan"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer text-rose-500 hover:text-rose-600 focus:text-rose-600"
                onClick={async () => {
                  const { createClient } = await import("@/lib/supabase/client");
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
              >
                <LogOut className="size-4 mr-2" />
                {t.settings.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-slate-200/60 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 px-1 py-2 backdrop-blur-xl md:hidden font-sans">
        {MOBILE_PRIMARY_NAV.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(`${href}/`);
          const translatedLabel =
            href === "/dashboard"
              ? t.nav.dashboard
              : href === "/accounts"
              ? t.nav.accounts
              : href === "/transactions"
              ? t.nav.transactions
              : href === "/insights"
              ? t.nav.insights
              : label;

          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              id={href === "/accounts" ? "tour-accounts-link" : undefined}
              data-tour={label.toLowerCase()}
              className={cn(
                "w-1/5 shrink-0 flex flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-semibold transition-colors min-h-[44px] justify-center text-center",
                isActive
                  ? "text-[#4f46e5] font-bold"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon className={cn("size-5 shrink-0", isActive && "text-[#4f46e5]")} />
              <span className="truncate w-full px-0.5">{translatedLabel}</span>
            </Link>
          );
        })}

        {/* Menu "Lainnya" untuk item navigasi tersisa di HP */}
        <DropdownMenu>
          <DropdownMenuTrigger className="w-1/5 shrink-0 flex flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white outline-none min-h-[44px] justify-center cursor-pointer text-center">
            <MoreHorizontal className="size-5 shrink-0" />
            <span className="truncate w-full px-0.5">{language === "en" ? "More" : "Lainnya"}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-52 rounded-2xl p-1 mb-2 font-sans">
            {MOBILE_SECONDARY_NAV.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname?.startsWith(`${href}/`);
              const translatedLabel =
                href === "/budgets"
                  ? t.nav.budgets
                  : href === "/settings"
                  ? t.nav.settings
                  : label;
              return (
                <DropdownMenuItem key={href} className="p-0 rounded-xl cursor-pointer">
                  <Link href={href} className={cn("flex items-center gap-2.5 w-full px-3 py-2.5", isActive && "text-[#4f46e5] font-bold")}>
                    <Icon className="size-4.5" />
                    <span>{translatedLabel}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </>
  );
}
