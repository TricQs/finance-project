"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ThemeToggleCompact } from "@/components/layout/theme-toggle-compact";

export function HeroFinancial() {
  return (
    <section className="min-h-screen bg-[#f7f9fc] dark:bg-zinc-950 text-[#1e293b] dark:text-zinc-100 relative overflow-hidden flex flex-col items-center font-sans transition-colors duration-300">
      {/* Background Hero Photo (Original Unsplash Image Background) */}
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1597200381847-30ec200eeb9a?q=80&w=1074&auto=format&fit=crop')] bg-cover bg-center opacity-30 pointer-events-none" />

      {/* Top Header Navbar - Responsive for Mobile, Tablet & Desktop */}
      <header
        className="animate-fade-only relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 font-sans"
        style={{ animationDelay: "0ms" }}
      >
        <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl px-4 sm:px-7 py-3 sm:py-3.5 rounded-2xl border border-white/60 dark:border-zinc-800 shadow-sm flex items-center justify-between transition-colors">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <svg
              className="fill-slate-900 dark:fill-white w-6 sm:w-7 h-6 sm:h-7 shrink-0"
              width="97"
              height="108"
              viewBox="0 0 97 108"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M55.5 0C61.0005 0.00109895 64.5005 2.50586 64.5 7.5V17C64.5 24.5059 68.5005 27.5 81 27.5H88C94.0005 27.5059 96.5 29.5059 96.5 37.5V98.5C96.5 106.006 95.0005 107.5 88 107.5H41.5C36.5005 107.5 32 104.506 32 98.5V88C32 84.5 28.5 80 20.5 80H8.5C3 80 0 76.5 0 71.5V6.5C0.00048844 1.50586 2.50049 0.00585937 8.5 0H55.5ZM31 20C28.7909 20 27 21.7909 27 24V74C27 76.2091 28.7909 78 31 78H58C60.2091 78 62 76.2091 62 74V24C62 21.7909 60.2091 20 58 20H31Z" />
            </svg>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              UangKu
            </span>
          </div>

          {/* Desktop Navigation Items (High Contrast Readability) */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-semibold text-neutral-600 dark:text-zinc-200 font-sans">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </a>
            <a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              About Us
            </a>
            <a href="#blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Blog
            </a>
            <a href="#pages" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Pages
            </a>
            <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Pricing
            </a>
          </nav>

          {/* Top Right Action & Theme Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggleCompact />
            <Link
              href="/auth"
              className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-black dark:hover:bg-neutral-200 transition shadow-sm cursor-pointer font-sans"
            >
              Get Started <ChevronRight className="size-4 sm:size-4.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Content Section - Ultra Responsive */}
      <div className="relative z-10 text-center pt-10 sm:pt-20 lg:pt-28 pb-16 sm:pb-24 px-4 flex flex-col items-center gap-5 sm:gap-6 max-w-6xl mx-auto font-sans">
        {/* Announcement Pill - Urutan 2 (Delay 150ms) */}
        <div
          className="animate-fade-only bg-white dark:bg-zinc-900/90 text-black dark:text-white px-3 py-1.5 rounded-full inline-flex items-center gap-2.5 shadow-lg shadow-blue-500/10 border border-neutral-200 dark:border-zinc-800 font-sans"
          style={{ animationDelay: "150ms" }}
        >
          <span className="bg-gradient-to-r from-blue-500 to-blue-400 text-white px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            NEW
          </span>
          <span className="text-xs sm:text-sm font-medium pr-1">
            Announcing our latest product launch
          </span>
        </div>

        {/* Main Headline - Urutan 3 (Delay 300ms) */}
        <h1
          className="animate-fade-only text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tight text-neutral-900 dark:text-white leading-[1.05] font-sans max-w-5xl"
          style={{ animationDelay: "300ms" }}
        >
          Make your financial <br className="hidden sm:inline" /> operations seamless.
        </h1>

        {/* Subtitle - Urutan 4 (Delay 450ms, Teks Tajam & Sangat Jelas di Light & Dark Mode) */}
        <p
          className="animate-fade-only text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-600 dark:text-zinc-300 font-normal max-w-3xl leading-relaxed px-2 sm:px-4 font-sans"
          style={{ animationDelay: "450ms" }}
        >
          Take control of your finances with Startive the next-generation finance software built to simplify, automate, and elevate your financial operations.
        </p>

        {/* CTA Buttons - Urutan 5 & 6 (Delay 600ms & 750ms, Tombol Learn More 100% Kontras Keren) */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 pt-3 sm:pt-5 font-sans w-full max-w-md sm:max-w-none">
          <Link
            href="/auth"
            className="animate-fade-only px-6 sm:px-7 py-3.5 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300 text-white text-base sm:text-lg font-semibold rounded-xl shadow-md transition-all border border-blue-400 hover:scale-[1.02] cursor-pointer w-full sm:w-auto text-center"
            style={{ animationDelay: "600ms" }}
          >
            Get Started
          </Link>
          <a
            href="#about"
            className="animate-fade-only px-6 sm:px-7 py-3.5 bg-white/90 dark:bg-zinc-900/90 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 text-base sm:text-lg font-semibold rounded-xl shadow-sm border border-slate-300 dark:border-zinc-700/80 transition-all hover:scale-[1.02] cursor-pointer backdrop-blur-md w-full sm:w-auto text-center"
            style={{ animationDelay: "750ms" }}
          >
            Learn more
          </a>
        </div>
      </div>
    </section>
  );
}
