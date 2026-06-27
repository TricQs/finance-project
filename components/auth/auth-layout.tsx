"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AuthForm } from "@/components/auth/auth-form";
import {
  MascotCelengan,
  type CelenganExpression,
} from "@/components/auth/mascot-celengan";
import { easeOutExpo } from "@/lib/motion";

const FEATURES = [
  { icon: "💰", text: "Catat pemasukan & pengeluaran" },
  { icon: "📊", text: "Analisis keuangan real-time" },
  { icon: "🔒", text: "Data aman & terenkripsi" },
];

interface AuthLayoutProps {
  initialError?: string;
}

export function AuthLayout({ initialError }: AuthLayoutProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [expression, setExpression] = useState<CelenganExpression>("idle");

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden auth-bg-gradient auth-noise"
      style={{ backgroundColor: "var(--auth-bg)" }}
    >
      {mounted && <ThemeToggle isDark={isDark} onToggle={toggleTheme} />}

      <div className="relative z-20 w-full max-w-255 px-4 md:px-8">
        <div className="relative">
          <div
            className="absolute -inset-1 rounded-[2.75rem] pointer-events-none blur-2xl opacity-45"
            style={{ backgroundColor: "var(--auth-card-glow)" }}
          />

          <div
            className="relative rounded-[2.5rem] overflow-hidden border"
            style={{
              backgroundColor: "var(--auth-card-bg)",
              borderColor: "var(--auth-card-border)",
              backdropFilter: "blur(40px) saturate(180%)",
            }}
          >
            <div className="flex flex-col md:flex-row min-h-145">
              <div className="relative md:w-[44%] flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden">
                <motion.div
                  initial={{ y: -24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: easeOutExpo }}
                  className="relative z-10 mb-8 self-start"
                >
                  <Logo size="sm" />
                </motion.div>

                <motion.div
                  className="relative z-10 w-full flex justify-center mt-4"
                  initial={{ y: 32, opacity: 0, scale: 0.92 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.08 }}
                >
                  <div className="relative w-44 h-48 md:w-52 md:h-56">
                    <MascotCelengan
                      expression={expression}
                      className="w-full h-full"
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="relative z-10 mt-8 w-full space-y-2"
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: easeOutExpo }}
                >
                  {FEATURES.map((item, i) => (
                    <motion.div
                      key={item.text}
                      initial={{ x: -18, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.42 + i * 0.07,
                        ease: easeOutExpo,
                      }}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border"
                      style={{
                        backgroundColor: "var(--auth-floating-bg)",
                        borderColor: "var(--auth-floating-border)",
                      }}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: "var(--auth-text-muted)" }}
                      >
                        {item.text}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <div
                className="hidden md:block w-px self-stretch my-12"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, var(--auth-card-border), transparent)",
                }}
              />

              <div className="relative md:w-[56%] flex flex-col justify-center p-8 md:p-12 md:pl-10">
                <motion.div
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.68,
                    delay: 0.18,
                    ease: easeOutExpo,
                  }}
                >
                  <AuthForm
                    onExpressionChange={setExpression}
                    initialError={initialError}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-5 text-center text-[10px] tracking-widest uppercase"
          style={{ color: "var(--auth-text-muted)", opacity: 0.5 }}
        >
          🔐 Data terenkripsi end-to-end · Uangku
        </motion.p>
      </div>
    </div>
  );
}
