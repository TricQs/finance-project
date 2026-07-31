"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

// Circular Authentic Brand Logo Badges untuk E-Commerce Indonesia (Shopee, Tokopedia, Blibli, Lazada)
function ShopeeIcon({ className }: { className?: string }) {
  return (
    <div className={cn("w-6 h-6 rounded-full bg-[#ee4d2d] text-white flex items-center justify-center shrink-0 shadow-xs select-none p-1", className)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    </div>
  );
}

function TokopediaIcon({ className }: { className?: string }) {
  return (
    <div className={cn("w-6 h-6 rounded-full bg-[#03ac0e] text-white flex items-center justify-center shrink-0 shadow-xs select-none p-1", className)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <circle cx="12" cy="13" r="2.5"/>
      </svg>
    </div>
  );
}

function BlibliIcon({ className }: { className?: string }) {
  return (
    <div className={cn("w-6 h-6 rounded-full bg-[#0095da] text-white flex items-center justify-center font-black text-[13px] leading-none shrink-0 shadow-xs select-none italic font-sans pl-0.5", className)}>
      b
    </div>
  );
}

function LazadaIcon({ className }: { className?: string }) {
  return (
    <div className={cn("w-6 h-6 rounded-full bg-gradient-to-tr from-[#6b1b7f] to-[#e61376] text-white flex items-center justify-center shrink-0 shadow-xs select-none p-1", className)}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
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
  { label: "Customers", href: "/customers", icon: Users },
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

export function AppSidebar({
  userName = "Pengguna",
  userEmail = "",
  avatarUrl,
  isCollapsed = false,
  onToggleSidebar,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [logoHovered, setLogoHovered] = useState(false);

  return (
    <>
      {/* DESKTOP SIDEBAR - 21st.dev UI Icons & Ultra 60FPS GPU Accelerated Smooth Pill Styling */}
      <aside
        className={cn(
          "hidden md:flex h-screen shrink-0 flex-col justify-between border-r border-slate-200/60 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transform-gpu p-3.5 transition-[width] duration-300 cubic-bezier(0.22,1,0.36,1) select-none z-40 sticky top-0 left-0 font-sans",
          isCollapsed ? "w-[76px]" : "w-64"
        )}
      >
        {/* Top Section */}
        <div className="flex flex-col gap-2 overflow-y-auto scrollbar-none flex-1 pr-0.5">
          {/* Row 1: Logo & Close Button (Tutup Sidebar di KANAN Logo Uangku; Pas Tutup, Logo di-hover jadi tombol BUKA) */}
          <div className="flex items-center justify-between h-11 px-1">
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-2 overflow-hidden">
                  <Logo size="sm" />
                </div>
                {onToggleSidebar && (
                  <button
                    type="button"
                    onClick={onToggleSidebar}
                    title="Tutup Sidebar"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                  >
                    <PanelLeftClose className="size-4.5" />
                  </button>
                )}
              </>
            ) : (
              /* Pas Sidebar Tutup: Logo Koin pas di-hover berubah jadi tombol Buka Sidebar */
              <div className="w-full flex justify-center">
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  onMouseEnter={() => setLogoHovered(true)}
                  onMouseLeave={() => setLogoHovered(false)}
                  title="Klik untuk Buka Sidebar"
                  className="relative group flex items-center justify-center p-1 rounded-full hover:scale-105 transition-all cursor-pointer"
                >
                  <div className="size-10 rounded-2xl flex items-center justify-center transition-all">
                    {logoHovered ? (
                      <PanelLeft className="size-5 text-emerald-500 animate-pulse" />
                    ) : (
                      <Logo size="sm" showText={false} />
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Row 2: Search Bar / Icon (Tinggi h-10 Presisi Tanpa Loncatan Y-axis) */}
          <div className="h-10 flex items-center my-0.5">
            {!isCollapsed ? (
              <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-xs font-medium text-slate-500 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Search className="size-3.5 text-slate-400" />
                  <span>Search</span>
                </div>
                <span className="text-[10px] bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md font-mono text-slate-500">⌘K</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onToggleSidebar}
                title="Buka Sidebar / Search (⌘K)"
                className="w-full h-10 flex items-center justify-center rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Search className="size-4" />
              </button>
            )}
          </div>

          {/* Row 3: Section Header "MENU" */}
          <div className="h-6 flex items-center my-1 px-2">
            {!isCollapsed ? (
              <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">
                Menu
              </span>
            ) : (
              <span className="w-10 border-t-2 border-slate-300 dark:border-zinc-700 mx-auto" />
            )}
          </div>

          {/* Row 4: MENU Nav Items List dengan Icon 21st.dev & Active Styling Soft Indigo Pill */}
          <nav id="tour-sidebar-nav" className="flex flex-col gap-1">
            {MENU_ITEMS.map(({ label, href, icon: Icon, badge }) => {
              const isActive =
                pathname === href || pathname?.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={true}
                  data-tour={label.toLowerCase()}
                  title={isCollapsed ? label : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-2xl text-sm font-medium transition-all cursor-pointer",
                    isCollapsed ? "justify-center px-0 py-2.5" : "px-3.5 py-2.5",
                    isActive
                      ? "bg-[#eef2ff] dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4.5 shrink-0" />
                    {!isCollapsed && <span className="truncate">{label}</span>}
                  </div>

                  {!isCollapsed && badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Row 5: Section Header "STORE" */}
          <div className="h-8 flex items-center my-1 px-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
            {!isCollapsed ? (
              <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">
                Store
              </span>
            ) : (
              <span className="w-10 border-t-2 border-slate-300 dark:border-zinc-700 mx-auto" />
            )}
          </div>

          {/* Row 6: STORE Nav Items List (Amazon, Shopee, Walmart) */}
          <nav className="flex flex-col gap-1">
            {STORE_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname?.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  title={isCollapsed ? label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl text-sm font-medium transition-all cursor-pointer",
                    isCollapsed ? "justify-center px-0 py-2.5" : "px-3.5 py-2.5",
                    isActive
                      ? "bg-[#eef2ff] dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{label}</span>}
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
            title={isCollapsed ? "Pengaturan" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-2xl text-sm font-medium transition-all cursor-pointer",
              isCollapsed ? "justify-center px-0 py-2.5" : "px-3.5 py-2.5",
              pathname?.startsWith("/settings")
                ? "bg-[#eef2ff] dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400 font-semibold shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Settings className="size-4.5 shrink-0" />
            {!isCollapsed && <span>Pengaturan</span>}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center rounded-2xl text-left outline-none transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-900",
                isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5 border border-slate-200/60 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60"
              )}
            >
              <Avatar size="sm" className="shrink-0 border border-slate-200 dark:border-zinc-700">
                <AvatarImage src={avatarUrl} alt={userName} />
                <AvatarFallback className="font-semibold text-xs bg-slate-200 dark:bg-zinc-800">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex min-w-0 flex-col overflow-hidden">
                  <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {userName}
                  </span>
                  <span className="truncate text-xs text-slate-500 dark:text-zinc-400">
                    {userEmail}
                  </span>
                </div>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isCollapsed ? "center" : "start"} side="top" className="w-56 rounded-2xl font-sans">
              <DropdownMenuItem className="p-0 rounded-xl cursor-pointer" asChild>
                <Link href="/settings" prefetch={true} className="flex items-center w-full px-2 py-1.5 text-sm font-medium">
                  <Settings className="size-4 mr-2" />
                  <span>Profil & Pengaturan</span>
                </Link>
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
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200/60 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 p-2 backdrop-blur-xl md:hidden font-sans">
        {MOBILE_PRIMARY_NAV.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              data-tour={label.toLowerCase()}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-semibold transition-all min-h-[44px] justify-center",
                isActive
                  ? "text-[#4f46e5] font-bold"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon className={cn("size-5", isActive && "text-[#4f46e5]")} />
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Menu "Lainnya" untuk item navigasi tersisa di HP */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white outline-none min-h-[44px] justify-center cursor-pointer">
            <MoreHorizontal className="size-5" />
            <span>Lainnya</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-52 rounded-2xl p-1 mb-2 font-sans">
            {MOBILE_SECONDARY_NAV.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname?.startsWith(`${href}/`);
              return (
                <DropdownMenuItem key={href} className="p-0 rounded-xl cursor-pointer">
                  <Link href={href} className={cn("flex items-center gap-2.5 w-full px-3 py-2.5", isActive && "text-[#4f46e5] font-bold")}>
                    <Icon className="size-4.5" />
                    <span>{label}</span>
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
