"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Target,
  HandCoins,
  TrendingUp,
  BellRing,
  Settings,
  LogOut,
  MoreHorizontal
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

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transaksi", href: "/transactions", icon: ArrowLeftRight },
  { label: "Akun", href: "/accounts", icon: Wallet },
  { label: "Anggaran", href: "/budgets", icon: PiggyBank },
  { label: "Tabungan", href: "/goals", icon: Target },
  { label: "Utang & Piutang", href: "/debts", icon: HandCoins },
  { label: "Investasi", href: "/investments", icon: TrendingUp },
  { label: "Pengingat", href: "/reminders", icon: BellRing },
] as const;

const MOBILE_PRIMARY_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transaksi", href: "/transactions", icon: ArrowLeftRight },
  { label: "Akun", href: "/accounts", icon: Wallet },
  { label: "Anggaran", href: "/budgets", icon: PiggyBank },
] as const;

const MOBILE_SECONDARY_NAV = [
  { label: "Tabungan", href: "/goals", icon: Target },
  { label: "Utang & Piutang", href: "/debts", icon: HandCoins },
  { label: "Investasi", href: "/investments", icon: TrendingUp },
  { label: "Pengingat", href: "/reminders", icon: BellRing },
  { label: "Pengaturan", href: "/settings", icon: Settings },
] as const;

type AppSidebarProps = {
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
};

export function AppSidebar({
  userName = "Pengguna",
  userEmail = "",
  avatarUrl,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="neu-flat hidden h-screen w-64 shrink-0 flex-col gap-6 p-4 md:flex">
        {/* Brand */}
        <div className="flex items-center px-2 pt-1">
          <Logo size="sm" />
        </div>
        
        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto scrollbar-none">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href || pathname?.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "neu-transition flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium",
                  isActive
                    ? "neu-pressed-sm text-primary"
                    : "text-muted-foreground hover:neu-raised-sm hover:text-foreground",
                )}
              >
                <Icon className="size-4.5 shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: settings + profile */}
        <div className="flex flex-col gap-1.5">
          <Link
            href="/settings"
            className={cn(
              "neu-transition flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium",
              pathname?.startsWith("/settings")
                ? "neu-pressed-sm text-primary"
                : "text-muted-foreground hover:neu-raised-sm hover:text-foreground",
            )}
          >
            <Settings className="size-4.5 shrink-0" />
            <span>Pengaturan</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "neu-raised-sm neu-transition flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left outline-none",
                "hover:neu-raised-lg",
              )}
            >
              <Avatar size="sm">
                <AvatarImage src={avatarUrl} alt={userName} />
                <AvatarFallback>
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {userName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {userEmail}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56 rounded-2xl">
              <DropdownMenuItem>
                <Settings />
                Profil & Pengaturan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <LogOut />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-background/90 p-2 backdrop-blur-xl md:hidden">
        {MOBILE_PRIMARY_NAV.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-semibold transition-all min-h-[44px] justify-center",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("size-5", isActive && "text-primary")} />
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Menu "Lainnya" untuk item navigasi tersisa di HP */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground outline-none min-h-[44px] justify-center cursor-pointer">
            <MoreHorizontal className="size-5" />
            <span>Lainnya</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-52 rounded-2xl p-1 mb-2 font-sans">
            {MOBILE_SECONDARY_NAV.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname?.startsWith(`${href}/`);
              return (
                <DropdownMenuItem key={href} className="p-0 rounded-xl cursor-pointer">
                  <Link href={href} className={cn("flex items-center gap-2.5 w-full px-3 py-2.5", isActive && "text-primary font-bold")}>
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
