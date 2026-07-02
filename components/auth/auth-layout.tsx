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
  {
    icon: Wallet,
    text: "Catat pemasukan & pengeluaran",
    desc: "Pantau setiap transaksi harian dengan mudah dan cepat",
    num: "01",
  },
  {
    icon: BarChart3,
    text: "Analisis keuangan real-time",
    desc: "Visualisasi data keuangan dalam grafik interaktif",
    num: "02",
  },
  {
    icon: Lock,
    text: "Data aman & terenkripsi",
    desc: "Enkripsi end-to-end melindungi semua data kamu",
    num: "03",
  },
];

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
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden auth-bg-gradient auth-bg-transition">
        <div className="absolute top-[-15%] left-[-5%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-40 mix-blend-normal pointer-events-none hidden sm:block auth-glow-transition" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-30 mix-blend-normal pointer-events-none hidden sm:block auth-primary-glow-transition" />

        {mounted && <ThemeToggle />}

        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: appleEase }}
          className="relative z-20 w-full max-w-360"
        >
          <div className="relative">
            <div className="absolute -inset-1.5 sm:-inset-2 rounded-[2.5rem] sm:rounded-[3rem] pointer-events-none blur-2xl opacity-50 auth-glow-transition" />

            <div
              className="relative rounded-4xl sm:rounded-[2.5rem] overflow-hidden border shadow-2xl ring-1 ring-white/10 dark:ring-white/5 auth-card-transition"
              style={{
                backdropFilter: "blur(40px) saturate(200%)",
              }}
            >
              <div className="flex flex-col md:flex-row min-h-0 sm:min-h-175 md:min-h-190 lg:min-h-210">
                {/* ── SISI KIRI: Branding, Maskot, Feature Cards ── */}
                <div className="relative md:w-1/2 flex flex-col items-center justify-between p-6 sm:p-8 md:p-12 overflow-hidden">
                  {/* Particles */}
                  <div className="auth-particles">
                    <div className="auth-particle" />
                    <div className="auth-particle" />
                    <div className="auth-particle" />
                  </div>

                  <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full blur-[70px] opacity-40 pointer-events-none auth-primary-glow-transition" />

                  <div className="w-full mb-3 flex justify-center md:justify-start relative z-10">
                    <div className="hover:scale-105 transition-transform duration-500 ease-out">
                      <Logo size="sm" />
                    </div>
                  </div>
                  {/* Tagline */}
                  <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: appleEase }}
                    className="relative z-10 w-full text-center md:text-left mb-2"
                  >
                    <p
                      className="text-xs font-bold tracking-[0.2em] uppercase auth-text-transition"
                      style={{ color: "var(--auth-text-muted)" }}
                    >
                      Uangku Financial
                    </p>
                    <h2
                      className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 leading-tight font-heading auth-text-transition"
                      style={{ color: "var(--auth-text-primary)" }}
                    >
                      Kelola Keuanganmu
                      <br />
                      dengan{" "}
                      <span style={{ color: "var(--auth-primary)" }}>
                        Cerdas
                      </span>
                    </h2>
                  </m.div>

                  {/* Maskot */}
                  <div className="relative z-10 w-full flex justify-center my-1">
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-black/10 dark:bg-black/40 blur-md rounded-[100%] pointer-events-none" />

                    <m.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.2,
                        ease: appleEase,
                      }}
                      className="relative w-36 h-40 sm:w-44 sm:h-48 lg:w-50 lg:h-55 select-none pointer-events-none drop-shadow-2xl"
                    >
                      <MascotCelengan
                        expression={expression}
                        className="w-full h-full"
                      />
                    </m.div>
                  </div>

                  {/* Feature Cards with Staggered Entrance */}
                  <div className="relative z-10 w-full space-y-2.5 max-w-70 sm:max-w-sm md:max-w-none mt-2">
                    {FEATURES.map((item, i) => (
                      <m.div
                        key={item.text}
                        className="feature-card feature-card-float group flex items-center gap-4 px-4 py-3 rounded-2xl border cursor-default select-none hover:shadow-lg transition-all duration-300"
                        style={{
                          animationDelay: `${0.15 + i * 0.15}s`,
                        }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.15 + i * 0.15,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <div
                          className="relative flex items-center justify-center w-11 h-11 rounded-[14px] transition-all duration-300 group-hover:scale-110 shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--auth-primary), #7c3aed)",
                          }}
                        >
                          <div className="absolute inset-0 rounded-[14px] overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 dark:bg-white/5 blur-md" />
                          </div>
                          <item.icon className="relative w-5 h-5 text-white drop-shadow-md transition-transform duration-300 group-hover:rotate-6 z-10" />
                          <div className="feature-badge">{item.num}</div>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <span
                            className="text-[13px] font-semibold tracking-wide font-heading transition-colors duration-300"
                            style={{ color: "var(--auth-text-primary)" }}
                          >
                            {item.text}
                          </span>
                          <div className="feature-card-desc-container">
                            <div className="overflow-hidden">
                              <p
                                className="text-[11px] pt-1 leading-snug font-heading feature-card-desc"
                                style={{ color: "var(--auth-text-muted)" }}
                              >
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      </m.div>
                    ))}
                  </div>
                </div>

                {/* ── DIVIDER ── */}
                <div className="hidden md:flex flex-col items-center justify-center py-12 select-none pointer-events-none">
                  <div className="auth-divider-line" />
                </div>

                {/* ── SISI KANAN: Auth Form ── */}
                <div className="relative md:w-1/2 flex flex-col justify-center p-6 sm:p-10 md:p-12 md:pl-10 lg:pl-16">
                  <m.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.15,
                      ease: appleEase,
                    }}
                    className="w-full max-w-105 mx-auto"
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

          <div className="mt-8 flex items-center justify-center gap-2 auth-text-transition">
            <Lock
              className="w-3.5 h-3.5 opacity-60 auth-text-transition"
              style={{ color: "var(--auth-text-muted)" }}
            />
            <p
              className="text-center text-[11px] font-semibold tracking-[0.2em] uppercase opacity-50 auth-text-transition"
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
