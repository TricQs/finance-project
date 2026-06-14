"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const isLogin = pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f1520] dark:bg-[#0f1520] light:bg-gray-100 transition-colors duration-300 px-4 py-8">
      {/* Theme Toggle - top right */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm text-white/80 hover:bg-white/20 transition-all"
      >
        <Sun className="w-3.5 h-3.5" />
        <div className="w-8 h-4 bg-blue-500/50 rounded-full relative">
          <div
            className={cn(
              "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300",
              theme === "dark" ? "left-4" : "left-0.5",
            )}
          />
        </div>
        <Moon className="w-3.5 h-3.5" />
      </button>

      {/* Mobile Layout */}
      <div className="w-full max-w-sm md:hidden flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full border-2 border-yellow-500/60 overflow-hidden bg-[#1a2030]">
            <Image
              src="/images/logo.png"
              alt="Uangku Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div className="bg-[#2a1f0a] px-4 py-1 rounded clip-ribbon">
            <span className="text-white font-bold text-xl tracking-wide">
              Uangku
            </span>
          </div>
        </div>

        {/* Panda Mascot */}
        <div className="w-56 h-56 mb-4">
          <Image
            src="/images/panda-mascot.png"
            alt="Panda Mascot"
            width={224}
            height={224}
            className="object-contain drop-shadow-2xl"
          />
        </div>

        {/* Auth Card */}
        <div className="w-full bg-[#111827]/80 dark:bg-[#0d1526]/80 light:bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-[#1a2235] dark:bg-[#0a1020] light:bg-gray-200 rounded-full p-1 mb-6">
            <Link
              href="/login"
              className={cn(
                "flex-1 text-center py-2 rounded-full text-sm font-medium transition-all duration-200",
                isLogin
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-white",
              )}
            >
              Login
            </Link>
            <Link
              href="/register"
              className={cn(
                "flex-1 text-center py-2 rounded-full text-sm font-medium transition-all duration-200",
                !isLogin
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-white",
              )}
            >
              Register
            </Link>
          </div>

          {children}
        </div>
      </div>

      {/* Tablet & Desktop Layout */}
      <div className="hidden md:flex w-full max-w-4xl xl:max-w-5xl items-center justify-between gap-8 bg-[#111827]/60 dark:bg-[#0d1526]/60 light:bg-white/80 backdrop-blur-md rounded-3xl p-8 xl:p-12 border border-white/5 shadow-2xl">
        {/* Left: Logo + Panda */}
        <div className="flex flex-col items-center flex-1">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-full border-2 border-yellow-500/60 overflow-hidden bg-[#1a2030]">
              <Image
                src="/images/logo.png"
                alt="Uangku Logo"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <div className="bg-[#2a1f0a] px-5 py-1.5 rounded-sm">
              <span className="text-white font-bold text-2xl tracking-wide">
                Uangku
              </span>
            </div>
          </div>

          {/* Panda */}
          <div className="w-64 h-64 xl:w-80 xl:h-80">
            <Image
              src="/images/panda-mascot.png"
              alt="Panda Mascot"
              width={320}
              height={320}
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-1 max-w-sm">
          {/* Theme toggle inline for desktop */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 text-sm text-white/70 hover:bg-white/20 transition-all"
            >
              <Sun className="w-3.5 h-3.5" />
              <div className="w-8 h-4 bg-blue-500/50 rounded-full relative">
                <div
                  className={cn(
                    "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300",
                    theme === "dark" ? "left-4" : "left-0.5",
                  )}
                />
              </div>
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#1a2235] dark:bg-[#0a1020] light:bg-gray-200 rounded-lg p-1 mb-6">
            <Link
              href="/login"
              className={cn(
                "flex-1 text-center py-2 rounded-md text-sm font-medium transition-all duration-200",
                isLogin
                  ? "bg-[#3b5bdb] text-white shadow-sm"
                  : "text-gray-400 hover:text-white",
              )}
            >
              Login
            </Link>
            <Link
              href="/register"
              className={cn(
                "flex-1 text-center py-2 rounded-md text-sm font-medium transition-all duration-200",
                !isLogin
                  ? "bg-[#3b5bdb] text-white shadow-sm"
                  : "text-gray-400 hover:text-white",
              )}
            >
              Register
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
