// components/auth/auth-layout.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";

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

  // Warna background utama — panda PNG harus duduk di atas warna ini supaya bg-nya menyatu
  const pageBg = isDark ? "#0d1526" : "#edf0f7";
  const cardBg = isDark ? "#111d35" : "#ffffff";
  const panelLeftBg = isDark ? "#0d1526" : "#edf0f7"; // sama dengan pageBg supaya panda nyatu

  return (
    <div
      className="min-h-screen w-full transition-colors duration-300"
      style={{ backgroundColor: pageBg }}
    >
      {/* ═══════════════════════════════════
          MOBILE  (< 768px)
      ═══════════════════════════════════ */}
      <div className="flex flex-col min-h-screen md:hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-6 pb-2">
          <BrandLogo size="sm" isDark={isDark} />
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle theme"
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                isDark
                  ? "text-yellow-400 bg-white/10"
                  : "text-gray-500 bg-black/8",
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

        {/* Panda — besar, center, overlap ke card */}
        <div className="flex-1 flex flex-col items-center justify-end pb-0">
          <div
            className="relative w-[75vw] max-w-[300px]"
            style={{
              aspectRatio: "3/4",
              marginBottom: "-80px", // overlap ke card
              zIndex: 10,
            }}
          >
            <Image
              src="/images/panda-mascot.png"
              alt="Maskot Uangku"
              fill
              sizes="(max-width: 768px) 75vw"
              className="object-contain object-bottom"
              priority
            />
          </div>
        </div>

        {/* Card bottom */}
        <div
          className="relative z-20 rounded-t-3xl px-6 pt-24 pb-8 mx-0 shadow-2xl"
          style={{ backgroundColor: cardBg }}
        >
          {/* Tab */}
          <TabSwitcher isLogin={isLogin} isDark={isDark} />
          {children}
        </div>
      </div>

      {/* ═══════════════════════════════════
          TABLET + DESKTOP  (≥ 768px)
      ═══════════════════════════════════ */}
      <div className="hidden md:flex min-h-screen items-center justify-center p-6 lg:p-10">
        <div
          className="w-full max-w-4xl xl:max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex"
          style={{
            minHeight: "580px",
            border: isDark
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {/* ── Panel Kiri: Logo + Panda ── */}
          <div
            className="relative flex flex-col items-center justify-between pt-10 pb-0 flex-1"
            style={{ backgroundColor: panelLeftBg }}
          >
            {/* Logo + tagline */}
            <div className="flex flex-col items-center gap-3">
              <BrandLogo size="md" isDark={isDark} />
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-500",
                )}
              >
                Kelola semua keuanganmu dalam satu tempat
              </p>
            </div>

            {/* Panda — mepet ke bawah, kaki di batas card */}
            <div
              className="relative w-full flex justify-center"
              style={{ height: "340px" }}
            >
              <Image
                src="/images/panda-mascot.png"
                alt="Maskot Uangku"
                fill
                sizes="(min-width: 768px) 40vw"
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-px self-stretch"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.08)",
            }}
          />

          {/* ── Panel Kanan: Form ── */}
          <div
            className="flex flex-col justify-center px-8 lg:px-12 py-10"
            style={{
              width: "min(400px, 45%)",
              backgroundColor: cardBg,
            }}
          >
            {/* Theme toggle */}
            <div className="flex justify-end mb-6">
              {mounted && (
                <ThemeToggle
                  isDark={isDark}
                  onToggle={() => setTheme(isDark ? "light" : "dark")}
                />
              )}
            </div>

            {/* Tab */}
            <TabSwitcher isLogin={isLogin} isDark={isDark} />

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

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
      aria-label="Toggle theme"
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
        isDark ? "bg-white/10 text-white/80" : "bg-black/6 text-gray-600",
      )}
    >
      <Sun className="w-3.5 h-3.5" />
      <div
        className="w-9 h-5 rounded-full relative transition-colors duration-300"
        style={{ backgroundColor: isDark ? "#3b5bdb" : "#d1d5db" }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
          style={{ left: isDark ? "18px" : "2px" }}
        />
      </div>
      <Moon className="w-3.5 h-3.5" />
    </button>
  );
}

function BrandLogo({
  size,
  isDark,
}: {
  size: "sm" | "md" | "lg";
  isDark: boolean;
}) {
  const px = size === "sm" ? 40 : size === "md" ? 48 : 56;
  const textCls =
    size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-lg";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="rounded-full border-2 border-yellow-500/60 overflow-hidden flex-shrink-0"
        style={{
          width: px,
          height: px,
          backgroundColor: isDark ? "#1a2030" : "#fff",
        }}
      >
        <Image
          src="/images/logo.png"
          alt="Logo Uangku"
          width={px}
          height={px}
          className="object-contain w-full h-full"
        />
      </div>
      <div
        className="px-4 py-1.5 rounded"
        style={{ backgroundColor: isDark ? "#2a1f0a" : "#1c1400" }}
      >
        <span className={cn("font-bold tracking-wide text-white", textCls)}>
          Uangku
        </span>
      </div>
    </div>
  );
}

function TabSwitcher({
  isLogin,
  isDark,
}: {
  isLogin: boolean;
  isDark: boolean;
}) {
  const tabWrapBg = isDark ? "#0a1020" : "#f0f0f0";
  const activeTabBg = isDark ? "#ffffff" : "#ffffff";
  const activeTabColor = "#111827";
  const inactiveColor = isDark ? "#6b7280" : "#9ca3af";

  return (
    <div
      className="flex rounded-full p-1 mb-6"
      style={{ backgroundColor: tabWrapBg }}
    >
      <Link
        href="/login"
        className="flex-1 text-center py-2 rounded-full text-sm font-semibold transition-all duration-200"
        style={{
          backgroundColor: isLogin ? activeTabBg : "transparent",
          color: isLogin ? activeTabColor : inactiveColor,
          boxShadow: isLogin ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
        }}
      >
        Login
      </Link>
      <Link
        href="/register"
        className="flex-1 text-center py-2 rounded-full text-sm font-semibold transition-all duration-200"
        style={{
          backgroundColor: !isLogin ? activeTabBg : "transparent",
          color: !isLogin ? activeTabColor : inactiveColor,
          boxShadow: !isLogin ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
        }}
      >
        Register
      </Link>
    </div>
  );
}
