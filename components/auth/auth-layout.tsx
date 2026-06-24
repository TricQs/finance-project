// components/auth/auth-layout.tsx
//
// Layout SaaS 3D Premium — komposisi ala split-screen fintech modern:
// • Latar belakang: gambar ilustrasi finansial (gelap/terang) yang mengisi penuh layar
// • Kiri: Mascot panda berdiri bebas tanpa card/kotak (ikut referensi gambar)
//   + Logo Uangku + tagline di bawah mascot
// • Kanan: Card kaca glassmorphism untuk form login/register
// • ThemeToggle: Tombol pil kaca melayang di pojok kanan atas
"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/auth/brand-logo";
import { PandaMascot } from "@/components/auth/panda-mascot";
import { ThemeToggle } from "@/components/auth/theme-toggle";
import { AuthForm } from "@/components/auth/auth-form";

export function AuthLayout() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;
  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <div className="min-h-svh w-full relative overflow-hidden flex flex-col md:flex-row">

      {/* ── GAMBAR LATAR BELAKANG (full bleed, beda per tema) ── */}
      {mounted && (
        <Image
          src={isDark ? "/images/auth-bg-dark.png" : "/images/auth-bg-light.png"}
          alt="Background"
          fill
          className="object-cover object-center z-0 transition-opacity duration-700"
          priority
          quality={90}
        />
      )}
      {/* Fallback background saat belum mounted (SSR) */}
      {!mounted && (
        <div className="absolute inset-0 bg-[#060d1f] z-0" />
      )}

      {/* ── THEME TOGGLE ── */}
      {mounted && <ThemeToggle isDark={isDark} onToggle={toggle} />}

      {/* ── KOLOM KIRI: Mascot + Logo + Tagline ── */}
      {/* Di HP: urutan di atas form; Di Desktop: grid kiri */}
      <div className="relative z-10 flex flex-col items-center justify-end md:justify-center
                      w-full md:w-1/2 lg:w-[55%]
                      pt-14 pb-0 md:pt-0 md:pb-0
                      px-8 md:px-12 lg:px-20
                      min-h-[360px] md:min-h-svh">

        {/* Logo dan Tagline — ditampilkan di atas mascot */}
        <div className="flex flex-col items-center mb-6 md:mb-10">
          <BrandLogo size="lg" />
          <div className="mt-5 text-center hidden md:block">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]">
              Kelola Keuanganmu<br />
              <span className="text-emerald-300">Lebih Cerdas</span>
            </h1>
            <p className="mt-3 text-sm lg:text-base text-white/70 font-medium max-w-xs">
              Catat pemasukan, pengeluaran, tabungan,<br className="hidden lg:block" /> dan investasimu dalam satu aplikasi.
            </p>
          </div>
        </div>

        {/* Mascot Panda — berdiri bebas, tidak dibungkus card */}
        <div className="relative animate-float select-none pointer-events-none
                        w-[240px] h-[260px] sm:w-[280px] sm:h-[300px]
                        md:w-[340px] md:h-[370px]
                        lg:w-[400px] lg:h-[440px]
                        xl:w-[440px] xl:h-[480px]
                        -mb-6 md:mb-0">
          <Image
            src="/images/panda-mascot.png"
            alt="Maskot Panda Uangku"
            fill
            className="object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            priority
            sizes="(max-width: 640px) 240px, (max-width: 768px) 280px, (max-width: 1024px) 340px, (max-width: 1280px) 400px, 440px"
          />
        </div>
      </div>

      {/* ── KOLOM KANAN: Form Card Glassmorphism ── */}
      <div className="relative z-10 flex flex-col items-center justify-center
                      w-full md:w-1/2 lg:w-[45%]
                      min-h-[500px] md:min-h-svh
                      p-4 sm:p-6 md:p-8 lg:p-12">

        {/* Overlay gelap/terang di belakang card untuk kontras */}
        <div className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? "bg-black/25 backdrop-blur-[2px]"
            : "bg-white/20 backdrop-blur-[2px]"
        }`} />

        {/* Form Card */}
        <div
          className="relative z-10 w-full flex flex-col rounded-3xl overflow-hidden
                     transition-all duration-500"
          style={{
            maxWidth: "440px",
            background: isDark
              ? "rgba(8, 14, 36, 0.75)"
              : "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.07)"
              : "1px solid rgba(255,255,255,0.9)",
            boxShadow: isDark
              ? "0 24px 64px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.05) inset"
              : "0 24px 64px rgba(59,130,246,0.10), 0 1px 0 rgba(255,255,255,1) inset",
            padding: "36px 40px",
            minHeight: "480px",
          }}
        >
          <AuthForm isDark={isDark} />
        </div>
      </div>
    </div>
  );
}
