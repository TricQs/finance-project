"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function HeroFinancial() {
  return (
    <section className="min-h-screen bg-[#f7f9fc] dark:bg-zinc-950 text-[#1e293b] dark:text-zinc-100 relative overflow-hidden flex flex-col items-center font-sans">
      {/* Background Hero Soft Gradients & Pattern */}
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1597200381847-30ec200eeb9a?q=80&w=1074&auto=format&fit=crop')] bg-cover bg-center opacity-30 pointer-events-none" />

      {/* Decorative Light SVG Vector Mesh */}
      <svg
        width="358"
        height="483"
        viewBox="0 0 358 483"
        className="absolute top-0 z-1 left-0 pointer-events-none opacity-80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_f_0_1)">
          <rect
            x="-86.9961"
            y="-33.114"
            width="72"
            height="541"
            rx="36"
            transform="rotate(-30.8182 -86.9961 -33.114)"
            fill="url(#paint0_linear_0_1)"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_0_1"
            x="-137.641"
            y="-120.646"
            width="440.285"
            height="602.787"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="32"
              result="effect1_foregroundBlur_0_1"
            />
          </filter>
          <linearGradient
            id="paint0_linear_0_1"
            x1="-50.9961"
            y1="-33.114"
            x2="-50.9961"
            y2="507.886"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#91bbfb" />
            <stop offset="1" stopColor="#E6F1FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Top Header Navbar - Urutan 1 (Delay 0ms) */}
      <header
        className="animate-fade-only relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 font-sans"
        style={{ animationDelay: "0ms" }}
      >
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl px-6 py-3.5 rounded-2xl border border-white/60 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg
              className="fill-slate-900 dark:fill-white w-7 h-7"
              width="97"
              height="108"
              viewBox="0 0 97 108"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M55.5 0C61.0005 0.00109895 64.5005 2.50586 64.5 7.5V17C64.5 24.5059 68.5005 27.5 81 27.5H88C94.0005 27.5059 96.5 29.5059 96.5 37.5V98.5C96.5 106.006 95.0005 107.5 88 107.5H41.5C36.5005 107.5 32 104.506 32 98.5V88C32 84.5 28.5 80 20.5 80H8.5C3 80 0 76.5 0 71.5V6.5C0.00048844 1.50586 2.50049 0.00585937 8.5 0H55.5ZM31 20C28.7909 20 27 21.7909 27 24V74C27 76.2091 28.7909 78 31 78H58C60.2091 78 62 76.2091 62 74V24C62 21.7909 60.2091 20 58 20H31Z" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              UangKu
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-sm font-semibold text-neutral-500 dark:text-neutral-400 font-sans">
            <a href="#" className="hover:text-[#3b82f6] transition-colors">
              Home
            </a>
            <a href="#about" className="hover:text-[#3b82f6] transition-colors">
              About Us
            </a>
            <a href="#blog" className="hover:text-[#3b82f6] transition-colors">
              Blog
            </a>
            <a href="#pages" className="hover:text-[#3b82f6] transition-colors">
              Pages
            </a>
            <a href="#pricing" className="hover:text-[#3b82f6] transition-colors">
              Pricing
            </a>
          </nav>

          <Link
            href="/auth"
            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2.5 flex items-center gap-1.5 rounded-xl font-bold text-sm hover:bg-black dark:hover:bg-neutral-200 transition shadow-sm cursor-pointer font-sans"
          >
            Get Started <ChevronRight size={18} />
          </Link>
        </div>
      </header>

      {/* Hero Content Section */}
      <div className="relative z-10 text-center pt-20 sm:pt-28 pb-20 px-4 flex flex-col items-center gap-6 max-w-6xl mx-auto font-sans">
        {/* Announcement Pill - Urutan 2 (Delay 150ms) */}
        <div
          className="animate-fade-only bg-white dark:bg-zinc-900 text-black dark:text-white px-2 py-1 rounded-full inline-flex items-center gap-2 shadow-lg shadow-blue-500/10 border border-neutral-200 dark:border-zinc-800 font-sans"
          style={{ animationDelay: "150ms" }}
        >
          <span className="bg-gradient-to-r from-blue-500 to-blue-400 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            NEW
          </span>
          <span className="text-xs sm:text-sm font-medium pr-2">
            Announcing our latest product launch
          </span>
        </div>

        {/* Main Headline - Urutan 3 (Delay 300ms) */}
        <h1
          className="animate-fade-only text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-neutral-900 dark:text-white leading-[1.05] font-sans"
          style={{ animationDelay: "300ms" }}
        >
          Make your financial <br /> operations seamless.
        </h1>

        {/* Subtitle - Urutan 4 (Delay 450ms) */}
        <p
          className="animate-fade-only text-lg sm:text-xl md:text-2xl text-neutral-500 dark:text-zinc-400 font-normal max-w-3xl leading-relaxed px-4 font-sans"
          style={{ animationDelay: "450ms" }}
        >
          Take control of your finances with Startive the next-generation finance software built to simplify, automate, and elevate your financial operations.
        </p>

        {/* CTA Buttons - Urutan 5 & 6 (Delay 600ms & 750ms) */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 font-sans">
          <Link
            href="/auth"
            className="animate-fade-only px-6 py-3.5 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300 text-white text-lg font-semibold rounded-xl shadow-md transition-all border border-blue-400 hover:scale-[1.02] cursor-pointer"
            style={{ animationDelay: "600ms" }}
          >
            Get Started
          </Link>
          <a
            href="#about"
            className="animate-fade-only px-6 py-3.5 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-zinc-800 dark:to-zinc-900 text-slate-900 dark:text-white text-lg font-semibold rounded-xl shadow-sm transition-all border border-neutral-300 dark:border-zinc-700 hover:bg-neutral-200 cursor-pointer"
            style={{ animationDelay: "750ms" }}
          >
            Learn more
          </a>
        </div>
      </div>
    </section>
  );
}
