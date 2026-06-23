// components/auth/auth-layout.tsx
// ─ FULL SCREEN adaptive layout ─
// Mobile  : < 768px  → stack vertikal penuh layar
// Tablet  : 768-1023px → split side-by-side penuh layar
// Desktop : ≥ 1024px  → split side-by-side penuh layar, lebih luas
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/auth/brand-logo";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLogin = pathname === "/login";

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;
  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <>
      <MobileLayout
        isDark={isDark}
        isLogin={isLogin}
        mounted={mounted}
        onToggle={toggle}
      >
        {children}
      </MobileLayout>
      <TabletLayout
        isDark={isDark}
        isLogin={isLogin}
        mounted={mounted}
        onToggle={toggle}
      >
        {children}
      </TabletLayout>
      <DesktopLayout
        isDark={isDark}
        isLogin={isLogin}
        mounted={mounted}
        onToggle={toggle}
      >
        {children}
      </DesktopLayout>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED TYPES
═══════════════════════════════════════════════════════════════ */
interface LayoutProps {
  isDark: boolean;
  isLogin: boolean;
  mounted: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE  (< 768px)
   Struktur:
     ┌──────────────────────┐
     │ Logo       Toggle ☀️ │  ← top bar
     ├──────────────────────┤
     │                      │
     │      🐼 Panda        │  ← flex-1, panda di bawah overlap card
     │                      │
     ├──────────────────────┤
     │  [Login] [Register]  │  ← bottom card, rounded-t-3xl
     │  Form fields         │
     └──────────────────────┘
═══════════════════════════════════════════════════════════════ */
function MobileLayout({
  isDark,
  isLogin,
  mounted,
  onToggle,
  children,
}: LayoutProps) {
  const pageBg = isDark ? "#0d1526" : "#dde3f0";
  const cardBg = isDark ? "#111d35" : "#ffffff";

  return (
    <div
      className="md:hidden flex flex-col min-h-svh"
      style={{ backgroundColor: pageBg }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-6 pb-0 shrink-0">
        <BrandLogo size="sm" />
        {mounted && (
          <button
            onClick={onToggle}
            aria-label="Toggle tema"
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
              isDark
                ? "bg-white/10 text-yellow-400"
                : "bg-black/10 text-gray-600",
            )}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Panda — mengisi sisa ruang, kaki panda overlap ke card */}
      <div className="flex-1 flex items-end justify-center overflow-hidden">
        <div
          className="relative w-[65vw] max-w-65"
          style={{ aspectRatio: "1/1.15", marginBottom: "-28%" }}
        >
          <Image
            src="/images/panda-mascot.png"
            alt="Maskot Uangku"
            fill
            sizes="65vw"
            className="object-contain object-bottom drop-shadow-2xl"
            priority
          />
        </div>
      </div>

      {/* Bottom card — rounded top, form di dalamnya */}
      <div
        className="relative rounded-t-[2.5rem] shadow-2xl shrink-0"
        style={{ backgroundColor: cardBg }}
      >
        {/* Ruang untuk panda yang overlap (28% dari max 260px ≈ 73px, pakai 80px biar longgar) */}
        <div className="pt-20 px-6 pb-8">
          <TabSwitcher isLogin={isLogin} isDark={isDark} />
          {/* min-height supaya Login dan Register selalu sama tinggi */}
          <div className="min-h-75">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TABLET  (768px – 1023px)
   Struktur FULL SCREEN split:
     ┌────────────────────┬──────────────────────┐
     │ Logo               │              Toggle  │
     │                    │  [Login] [Register]  │
     │   🐼 Panda         │  Email               │
     │   (full height,    │  Password            │
     │   bottom-pinned)   │  [Button]            │
     └────────────────────┴──────────────────────┘
═══════════════════════════════════════════════════════════════ */
function TabletLayout({
  isDark,
  isLogin,
  mounted,
  onToggle,
  children,
}: LayoutProps) {
  const leftBg = isDark ? "#0d1526" : "#dde3f0";
  const rightBg = isDark ? "#111d35" : "#ffffff";
  const divider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";

  return (
    <div
      className="hidden md:flex lg:hidden min-h-svh"
      style={{ backgroundColor: leftBg }}
    >
      {/* Panel kiri — Logo atas, panda pinned ke bawah */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{ backgroundColor: leftBg }}
      >
        {/* Logo di pojok kiri atas */}
        <div className="p-7 shrink-0">
          <BrandLogo size="sm" />
        </div>

        {/* Panda — flex-1 supaya isi sisa, object-bottom pinned ke dasar */}
        <div className="flex-1 relative min-h-0">
          <Image
            src="/images/panda-mascot.png"
            alt="Maskot Uangku"
            fill
            sizes="50vw"
            className="object-contain object-bottom drop-shadow-xl"
            priority
          />
        </div>
      </div>

      {/* Divider vertikal */}
      <div
        className="w-px self-stretch shrink-0"
        style={{ backgroundColor: divider }}
      />

      {/* Panel kanan — toggle atas, form tengah */}
      <div
        className="flex flex-col shrink-0 overflow-y-auto"
        style={{ width: "320px", backgroundColor: rightBg }}
      >
        {/* Theme toggle di pojok kanan atas */}
        <div className="flex justify-end p-5 shrink-0">
          {mounted && <ThemeToggle isDark={isDark} onToggle={onToggle} />}
        </div>

        {/* Form — flex-1 supaya selalu center vertikal → tidak ada lompat tinggi */}
        <div className="flex-1 flex flex-col justify-center px-8 pb-10">
          <TabSwitcher isLogin={isLogin} isDark={isDark} />
          {children}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DESKTOP  (≥ 1024px)
   Sama dengan tablet tapi lebih luas dan panda lebih besar
═══════════════════════════════════════════════════════════════ */
function DesktopLayout({
  isDark,
  isLogin,
  mounted,
  onToggle,
  children,
}: LayoutProps) {
  const leftBg = isDark ? "#0d1526" : "#dde3f0";
  const rightBg = isDark ? "#111d35" : "#ffffff";
  const divider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";

  return (
    <div
      className="hidden lg:flex min-h-svh"
      style={{ backgroundColor: leftBg }}
    >
      {/* Panel kiri */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{ backgroundColor: leftBg }}
      >
        {/* Logo + tagline */}
        <div className="p-10 shrink-0">
          <BrandLogo size="md" />
          <p
            className="mt-3 text-sm pl-1"
            style={{ color: isDark ? "#6b7280" : "#7c8fa6" }}
          >
            Kelola semua keuanganmu dalam satu tempat
          </p>
        </div>

        {/* Panda pinned ke bawah */}
        <div className="flex-1 relative min-h-0">
          <Image
            src="/images/panda-mascot.png"
            alt="Maskot Uangku"
            fill
            sizes="55vw"
            className="object-contain object-bottom drop-shadow-2xl"
            priority
          />
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-px self-stretch shrink-0"
        style={{ backgroundColor: divider }}
      />

      {/* Panel kanan */}
      <div
        className="flex flex-col shrink-0 overflow-y-auto"
        style={{ width: "420px", backgroundColor: rightBg }}
      >
        {/* Theme toggle */}
        <div className="flex justify-end p-7 shrink-0">
          {mounted && <ThemeToggle isDark={isDark} onToggle={onToggle} />}
        </div>

        {/* Form — selalu center vertikal, tidak naik-turun walau field beda */}
        <div className="flex-1 flex flex-col justify-center px-12 pb-12">
          <TabSwitcher isLogin={isLogin} isDark={isDark} />
          {children}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB SWITCHER
═══════════════════════════════════════════════════════════════ */
function TabSwitcher({
  isLogin,
  isDark,
}: {
  isLogin: boolean;
  isDark: boolean;
}) {
  const wrapBg = isDark ? "#0a1020" : "#e4e9f2";

  return (
    <div
      className="flex rounded-full p-1 mb-6"
      style={{ backgroundColor: wrapBg }}
    >
      {(["login", "register"] as const).map((tab) => {
        const active = tab === "login" ? isLogin : !isLogin;
        return (
          <Link
            key={tab}
            href={`/${tab}`}
            className="flex-1 text-center py-2 rounded-full text-sm font-semibold transition-all duration-200 capitalize"
            style={{
              backgroundColor: active ? "#ffffff" : "transparent",
              color: active ? "#111827" : isDark ? "#6b7280" : "#9ca3af",
              boxShadow: active ? "0 1px 4px rgba(0,0,0,0.18)" : "none",
            }}
          >
            {tab === "login" ? "Login" : "Register"}
          </Link>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THEME TOGGLE  (Sun ─ toggle ─ Moon)
═══════════════════════════════════════════════════════════════ */
function ThemeToggle({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle tema"
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
        isDark
          ? "bg-white/10 text-white/70 hover:bg-white/15"
          : "bg-black/8 text-gray-600 hover:bg-black/12",
      )}
    >
      <Sun className="w-3.5 h-3.5" />
      {/* Track */}
      <div
        className="w-9 h-5 rounded-full relative transition-colors duration-300 shrink-0"
        style={{ backgroundColor: isDark ? "#3b5bdb" : "#d1d5db" }}
      >
        {/* Thumb */}
        <div
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
          style={{ left: isDark ? "18px" : "2px" }}
        />
      </div>
      <Moon className="w-3.5 h-3.5" />
    </button>
  );
}
