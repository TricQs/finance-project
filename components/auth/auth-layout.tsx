"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AuthForm } from "@/components/auth/auth-form";
import {
  MascotCelengan,
  type CelenganExpression,
} from "@/components/auth/mascot-celengan";

// Kombinasi kurva transisi ala Apple (sangat mulus) — typed sebagai tuple untuk kompatibilitas Framer Motion
const appleEase = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Menggunakan Microsoft Fluent 3D Animated Emojis dari open-source CDN
const FEATURES = [
  { 
    icon: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Money%20Bag.png", 
    text: "Catat pemasukan & pengeluaran" 
  },
  { 
    icon: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Chart%20Increasing.png", 
    text: "Analisis keuangan real-time" 
  },
  { 
    icon: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Locked.png", 
    text: "Data aman & terenkripsi" 
  },
];

// Orkestrasi Animasi Modern (Staggered Children)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.35,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95, filter: "blur(5px)" },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: appleEase as [number, number, number, number] },
  },
};

interface AuthLayoutProps {
  initialError?: string;
}

export function AuthLayout({ initialError }: AuthLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [expression, setExpression] = useState<CelenganExpression>("idle");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <LazyMotion features={domAnimation}>
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden auth-bg-gradient auth-noise transition-colors duration-1000 ease-in-out"
      style={{ backgroundColor: "oklch(0.97 0.006 256)" }}
    >
      {/* Latar Belakang Orbs (Cahaya Pendar Artistik) */}
      <div 
        className="absolute top-[-15%] left-[-5%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-40 mix-blend-normal pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: "var(--auth-card-glow)" }}
      />
      <div 
        className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-30 mix-blend-normal pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: "var(--auth-primary-glow)" }}
      />

      {/* Roda Toggle Tema (Z-Index: 10 di background, tombol di Z-50) */}
      {mounted && <ThemeToggle />}

      {/* Kontainer UI Utama */}
      <m.div 
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: appleEase }}
        className="relative z-20 w-full max-w-[1060px] transition-colors duration-1000 ease-in-out"
        style={{ willChange: "transform" }}
      >
        <div className="relative">
          
          {/* Ambient Glow di belakang Card Utama */}
          <div
            className="absolute -inset-1.5 sm:-inset-2 rounded-[2.5rem] sm:rounded-[3rem] pointer-events-none blur-2xl opacity-50 transition-colors duration-1000"
            style={{ backgroundColor: "var(--auth-card-glow)" }}
          />

          {/* Premium Glassmorphic Card Container — GPU composite layer */}
          <div
            className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border shadow-2xl transition-all duration-1000 ring-1 ring-white/10 dark:ring-white/5"
            style={{
              backgroundColor: "var(--auth-card-bg)",
              borderColor: "var(--auth-card-border)",
              backdropFilter: "blur(40px) saturate(200%)",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              willChange: "transform",
            }}
          >
            <div className="flex flex-col md:flex-row min-h-[580px] lg:min-h-[660px]">
              
              {/* SISI KIRI: Branding & Maskot */}
              <div className="relative md:w-[45%] lg:w-[42%] flex flex-col items-center justify-between p-6 sm:p-8 md:p-12 overflow-hidden bg-gradient-to-br from-transparent via-transparent to-[var(--auth-primary-glow)]/10">
                
                {/* Spotlight Halus di Belakang Maskot */}
                <div 
                  className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full blur-[70px] opacity-40 pointer-events-none transition-colors duration-1000"
                  style={{ backgroundColor: "var(--auth-primary-glow)" }}
                />

                {/* Logo Section */}
                <m.div
                  initial={{ y: -16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: appleEase, delay: 0.1 }}
                  className="w-full mb-8 md:mb-0 flex justify-center md:justify-start relative z-10"
                >
                  <div className="hover:scale-105 transition-transform duration-500 ease-out">
                    <Logo size="sm" />
                  </div>
                </m.div>

                {/* Mascot Wrapper */}
                <m.div
                  className="relative z-10 w-full flex justify-center my-6 md:my-0 animate-float"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: appleEase, delay: 0.2 }}
                >
                  {/* Stage Base (Bayangan di bawah maskot) */}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-black/10 dark:bg-black/40 blur-md rounded-[100%] pointer-events-none" />
                  
                  <div className="relative w-40 h-44 sm:w-48 sm:h-52 lg:w-[220px] lg:h-[240px] select-none pointer-events-none drop-shadow-2xl">
                    <MascotCelengan
                      expression={expression}
                      className="w-full h-full"
                    />
                  </div>
                </m.div>

                {/* Fitur/Highlights List */}
                <m.div
                  className="relative z-10 w-full space-y-3.5 max-w-[280px] sm:max-w-sm md:max-w-none mt-8 md:mt-0"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {FEATURES.map((item) => (
                    <m.div
                      key={item.text}
                      variants={itemVariants}
                      whileHover={{ 
                        y: -3, 
                        scale: 1.02,
                      }}
                      className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl border cursor-default select-none transition-all duration-400 ease-out shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg bg-[var(--auth-floating-bg)] border-[var(--auth-floating-border)] hover:bg-[var(--auth-input-hover)] hover:border-[var(--auth-primary)]"
                    >
                      {/* Icon Wrapper Modern dengan 3D Emoji Online */}
                      <div 
                        className="relative flex items-center justify-center w-11 h-11 rounded-[14px] transition-all duration-500 ease-out group-hover:scale-110 shadow-inner overflow-hidden border border-white/10 dark:border-white/5"
                        style={{ backgroundColor: "var(--auth-primary-glow)" }}
                      >
                        {/* Soft Glow di balik ikon 3D */}
                        <div className="absolute inset-0 bg-white/20 dark:bg-white/5 blur-md" />
                        
                        {/* Gambar above-the-fold: hapus lazy, prioritaskan fetch */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={item.icon} 
                          alt="Icon" 
                          className="relative w-7 h-7 object-contain drop-shadow-md transition-transform duration-500 group-hover:rotate-6"
                          decoding="async"
                          fetchPriority="high"
                        />
                      </div>
                      
                      <span
                        className="text-[13px] font-semibold tracking-wide transition-colors duration-1000"
                        style={{ color: "var(--auth-text-primary)" }}
                      >
                        {item.text}
                      </span>
                    </m.div>
                  ))}
                </m.div>
              </div>

              {/* Garis Pembatas Vertikal Premium (Fading gradient top & bottom) */}
              <div className="hidden md:flex flex-col items-center justify-center py-12 opacity-60">
                <div 
                  className="w-[1.5px] h-full transition-all duration-1000"
                  style={{
                    background: "linear-gradient(180deg, transparent 0%, var(--auth-card-border) 25%, var(--auth-card-border) 75%, transparent 100%)"
                  }}
                />
              </div>

              {/* SISI KANAN: Form Interaktif (Login / Register) */}
              <div className="relative md:w-[55%] lg:w-[58%] flex flex-col justify-center p-6 sm:p-10 md:p-12 md:pl-10 lg:pl-16">
                <m.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3,
                    ease: appleEase,
                  }}
                  className="w-full max-w-[420px] mx-auto md:mx-0"
                >
                  <AuthForm
                    onExpressionChange={setExpression}
                    initialError={initialError}
                  />
                </m.div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Text / Security Badge */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: appleEase }}
          className="mt-8 flex items-center justify-center gap-2"
        >
          {/* Ikon Gembok — above-the-fold, prioritaskan fetch */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Locked.png" 
            alt="Secure" 
            className="w-3.5 h-3.5 opacity-60" 
            decoding="async"
            fetchPriority="high"
          />
          <p
            className="text-center text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-1000 opacity-50"
            style={{ color: "var(--auth-text-muted)" }}
          >
            Aplikasi Data Terenkripsi End-To-End · Uangku
          </p>
        </m.div>
      </m.div>
    </div>
    </LazyMotion>
  );
}