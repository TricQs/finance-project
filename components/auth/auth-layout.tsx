"use client";

import { useEffect, useState } from "react";
import { Wallet, BarChart3, Lock } from "lucide-react";
import { m, LazyMotion, domAnimation } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AuthForm } from "@/components/auth/auth-form";
import {
  MascotCelengan,
  type CelenganExpression,
} from "@/components/auth/mascot-celengan";

const appleEase = [0.16, 1, 0.3, 1] as [number, number, number, number];

const FEATURES = [
  { icon: Wallet, text: "Catat pemasukan & pengeluaran" },
  { icon: BarChart3, text: "Analisis keuangan real-time" },
  { icon: Lock, text: "Data aman & terenkripsi" },
];

interface AuthLayoutProps {
  initialError?: string;
}

export function AuthLayout({ initialError }: AuthLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [expression, setExpression] = useState<CelenganExpression>("idle");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <LazyMotion features={domAnimation}>
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden auth-bg-gradient transition-colors duration-1500 delay-300"
      style={{ backgroundColor: "var(--auth-bg)" }}
    >
      <div 
        className="absolute top-[-15%] left-[-5%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-40 mix-blend-normal pointer-events-none transition-colors duration-1500 delay-300"
        style={{ backgroundColor: "var(--auth-card-glow)" }}
      />
      <div 
        className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-30 mix-blend-normal pointer-events-none transition-colors duration-1500 delay-300"
        style={{ backgroundColor: "var(--auth-primary-glow)" }}
      />

      {mounted && <ThemeToggle />}

      <m.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: appleEase }}
        className="relative z-20 w-full max-w-[1060px]"
      >
        <div className="relative">
          
          <div
            className="absolute -inset-1.5 sm:-inset-2 rounded-[2.5rem] sm:rounded-[3rem] pointer-events-none blur-2xl opacity-50 transition-colors duration-1500 delay-300"
            style={{ backgroundColor: "var(--auth-card-glow)" }}
          />

          <div
            className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border shadow-2xl ring-1 ring-white/10 dark:ring-white/5 transition-colors duration-1000 delay-150"
            style={{
              backgroundColor: "var(--auth-card-bg)",
              borderColor: "var(--auth-card-border)",
              backdropFilter: "blur(40px) saturate(200%)",
            }}
          >
            <div className="flex flex-col md:flex-row min-h-[580px] lg:min-h-[660px]">
              
              {/* SISI KIRI: Branding & Maskot */}
              <div className="relative md:w-[45%] lg:w-[42%] flex flex-col items-center justify-between p-6 sm:p-8 md:p-12 overflow-hidden bg-gradient-to-br from-transparent via-transparent to-[var(--auth-primary-glow)]/10">
                
                <div 
                  className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full blur-[70px] opacity-40 pointer-events-none transition-colors duration-1500 delay-300"
                  style={{ backgroundColor: "var(--auth-primary-glow)" }}
                />

                <div className="w-full mb-8 md:mb-0 flex justify-center md:justify-start relative z-10">
                  <div className="hover:scale-105 transition-transform duration-500 ease-out">
                    <Logo size="sm" />
                  </div>
                </div>

                <div className="relative z-10 w-full flex justify-center my-2 md:mb-6">
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-black/10 dark:bg-black/40 blur-md rounded-[100%] pointer-events-none" />
                  
                  <div className="relative w-40 h-44 sm:w-48 sm:h-52 lg:w-[220px] lg:h-[240px] select-none pointer-events-none drop-shadow-2xl">
                    <MascotCelengan
                      expression={expression}
                      className="w-full h-full"
                    />
                  </div>
                </div>

                <div className="relative z-10 w-full space-y-3.5 max-w-[280px] sm:max-w-sm md:max-w-none mt-8 md:mt-0">
                  {FEATURES.map((item) => (
                    <div
                      key={item.text}
                      className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl border cursor-default select-none transition-all duration-500 delay-150 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg bg-[var(--auth-floating-bg)] border-[var(--auth-floating-border)] hover:bg-[var(--auth-input-hover)] hover:border-[var(--auth-primary)] hover:-translate-y-0.5"
                    >
                      <div 
                        className="relative flex items-center justify-center w-11 h-11 rounded-[14px] transition-all duration-500 delay-150 group-hover:scale-110 shadow-inner overflow-hidden border border-white/10 dark:border-white/5"
                        style={{ backgroundColor: "var(--auth-primary-glow)" }}
                      >
                        <div className="absolute inset-0 bg-white/20 dark:bg-white/5 blur-md" />
                        <item.icon className="relative w-5 h-5 text-white drop-shadow-md transition-transform duration-300 group-hover:rotate-6" />
                      </div>
                      
                      <span
                        className="text-[13px] font-semibold tracking-wide transition-colors duration-700 delay-150"
                        style={{ color: "var(--auth-text-primary)" }}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden md:flex flex-col items-center justify-center py-12 opacity-60">
                <div 
                  className="w-[1.5px] h-full transition-colors duration-700 delay-150"
                  style={{
                    background: "linear-gradient(180deg, transparent 0%, var(--auth-card-border) 25%, var(--auth-card-border) 75%, transparent 100%)"
                  }}
                />
              </div>

              <div className="relative md:w-[55%] lg:w-[58%] flex flex-col justify-center p-6 sm:p-10 md:p-12 md:pl-10 lg:pl-16">
                <m.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.15,
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

        <div className="mt-8 flex items-center justify-center gap-2 transition-colors duration-1000 delay-150">
          <Lock className="w-3.5 h-3.5 opacity-60 transition-colors duration-700 delay-150" style={{ color: "var(--auth-text-muted)" }} />
          <p
            className="text-center text-[11px] font-semibold tracking-[0.2em] uppercase opacity-50 transition-colors duration-700 delay-150"
            style={{ color: "var(--auth-text-muted)" }}
          >
            Aplikasi Data Terenkripsi End-To-End · Uangku
          </p>
        </div>
      </m.div>
    </div>
    </LazyMotion>
  );
}