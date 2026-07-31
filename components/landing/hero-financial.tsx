"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { ThemeToggleCompact } from "@/components/layout/theme-toggle-compact";
import AboutUsSection from "@/components/ui/about-us-section";
import InkReveal from "@/components/ui/ink-reveal";

import { useSystemLanguage } from "@/lib/i18n/use-system-language";

export function HeroFinancial() {
  const [isMounted, setIsMounted] = React.useState(false);
  const lang = useSystemLanguage();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const t = {
    en: {
      home: "Home",
      aboutUs: "About Us",
      getStarted: "Get Started",
      learnMore: "Learn more",
      newBadge: "NEW",
      newText: "Smart & Automated Personal Finance Platform",
      headlinePart1: "Make your financial",
      headlinePart2: "operations seamless.",
      subtitle:
        "Take control of your finances with UangKu — the next-generation finance software built to simplify, automate, and elevate your financial operations.",
    },
    id: {
      home: "Home",
      aboutUs: "About Us",
      getStarted: "Get Started",
      learnMore: "Learn more",
      newBadge: "NEW",
      newText: "Platform Kelola Keuangan Pintar & Otomatis",
      headlinePart1: "Make your financial",
      headlinePart2: "operations seamless.",
      subtitle:
        "Take control of your finances with UangKu — the next-generation finance software built to simplify, automate, and elevate your financial operations.",
    },
  }[lang];

  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("about-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="min-h-screen bg-[#f7f9fc] dark:bg-zinc-950 text-[#1e293b] dark:text-zinc-100 relative overflow-hidden flex flex-col items-center font-sans transition-colors duration-300">
      {/* Background Hero Photo - Fades in only after canvas mask initializes to prevent hard-refresh flash */}
      <div className={`absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1597200381847-30ec200eeb9a?q=80&w=1074&auto=format&fit=crop')] bg-cover bg-center transition-opacity duration-300 pointer-events-none ${isMounted ? "opacity-40 dark:opacity-40" : "opacity-40 md:opacity-0"}`} />

      {/* Ink Reveal Dynamic Interactive Mask - Desktop only (hidden on mobile for instant crisp background) */}
      <InkReveal maskColor={[247, 249, 252]} brushSize={120} lifetime={500} stampStep={10} maxStamps={100} className="z-[1] hidden md:block dark:hidden pointer-events-auto" />
      <InkReveal maskColor={[9, 9, 11]} brushSize={120} lifetime={500} stampStep={10} maxStamps={100} className="z-[1] hidden md:dark:block pointer-events-auto" />

      {/* Sticky Top Header Navbar - Fixed at top overlay */}
      <header
        className="fixed top-0 left-0 right-0 z-50 w-full max-w-7xl mx-auto p-4 sm:p-6 font-sans pointer-events-none"
      >
        <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl px-4 sm:px-7 py-3 sm:py-3.5 rounded-2xl border border-white/60 dark:border-zinc-800 shadow-md flex items-center justify-between transition-colors pointer-events-auto">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/finance_logo.png"
              alt="Uangku Logo"
              width={28}
              height={28}
              className="rounded-full shrink-0"
              priority
            />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              UangKu
            </span>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-semibold text-neutral-600 dark:text-zinc-200 font-sans">
            <a href="#" onClick={scrollToTop} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.home}
            </a>
            <a href="#about-section" onClick={scrollToAbout} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.aboutUs}
            </a>
          </nav>

          {/* Top Right Action & Theme Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggleCompact />
            <Link
              href="/auth"
              className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-black dark:hover:bg-neutral-200 transition shadow-sm cursor-pointer font-sans"
            >
              {t.getStarted} <ChevronRight className="size-4 sm:size-4.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Content Section - Generously padded to position content lower down from top navbar */}
      <div className="relative z-10 text-center min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center pt-28 sm:pt-44 lg:pt-48 pb-16 sm:pb-24 px-4 gap-5 sm:gap-6 max-w-6xl mx-auto font-sans w-full">
        {/* Announcement Pill - Slightly thicker border & shadow */}
        <div
          className="animate-fade-only bg-white dark:bg-zinc-900/95 text-black dark:text-white px-3.5 py-1.5 rounded-full inline-flex items-center gap-2.5 shadow-xl shadow-blue-500/20 border-2 border-slate-300/80 dark:border-zinc-700/90 font-sans"
          style={{ animationDelay: "150ms" }}
        >
          <span className="bg-gradient-to-r from-blue-500 to-blue-400 text-white px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            {t.newBadge}
          </span>
          <span className="text-xs sm:text-sm font-medium pr-1">
            {t.newText}
          </span>
        </div>

        {/* Main Headline - Urutan 3 (Delay 300ms) */}
        <h1
          className="animate-fade-only text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tight text-neutral-900 dark:text-white leading-[1.05] font-sans max-w-5xl"
          style={{ animationDelay: "300ms" }}
        >
          {t.headlinePart1} <br className="hidden sm:inline" /> {t.headlinePart2}
        </h1>

        {/* Subtitle - Urutan 4 */}
        <p
          className="animate-fade-only text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-600 dark:text-zinc-300 font-normal max-w-3xl leading-relaxed px-2 sm:px-4 font-sans"
          style={{ animationDelay: "450ms" }}
        >
          {t.subtitle}
        </p>

        {/* CTA Buttons - Urutan 5 & 6 */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 pt-3 sm:pt-5 font-sans w-full max-w-md sm:max-w-none">
          <Link
            href="/auth"
            className="animate-fade-only px-6 sm:px-7 py-3.5 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300 text-white text-base sm:text-lg font-semibold rounded-xl shadow-md transition-all border border-blue-400 hover:scale-[1.02] cursor-pointer w-full sm:w-auto text-center"
            style={{ animationDelay: "600ms" }}
          >
            {t.getStarted}
          </Link>
          <a
            href="#about-section"
            onClick={scrollToAbout}
            className="animate-fade-only px-6 sm:px-7 py-3.5 bg-white/90 dark:bg-zinc-900/90 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 text-base sm:text-lg font-semibold rounded-xl shadow-sm border border-slate-300 dark:border-zinc-700/80 transition-all hover:scale-[1.02] cursor-pointer backdrop-blur-md w-full sm:w-auto text-center"
            style={{ animationDelay: "750ms" }}
          >
            {t.learnMore}
          </a>
        </div>
      </div>

      {/* ABOUT US SECTION COMPONENT WITH FRAMER MOTION ANIMATIONS */}
      <AboutUsSection />

      {/* Soft Bottom Gradient Fade to smoothly blend out canvas edges & background photo */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f7f9fc] via-[#f7f9fc]/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 pointer-events-none z-[2]" />
    </section>
  );
}
