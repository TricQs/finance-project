"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { useSystemLanguage } from "@/lib/i18n/use-system-language";

export default function VerificationSuccessPage() {
  const router = useRouter();
  const lang = useSystemLanguage();
  const isId = lang === "id";
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/auth?verified=true");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 size-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-card border border-border/60 shadow-xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative z-10"
      >
        {/* App Logo */}
        <div className="mb-6">
          <Logo size="md" />
        </div>

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 20 }}
          className="size-20 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20 shadow-inner"
        >
          <CheckCircle2 className="size-10" />
        </motion.div>

        {/* Headline */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mb-2 font-heading">
          {isId ? "Verifikasi Email Berhasil!" : "Email Verification Successful!"}
        </h1>

        {/* User Requested Custom Sentence */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {isId
            ? "Anda berhasil memverifikasi akun Anda. Silakan kembali ke halaman aplikasi keuangan Uangku untuk melanjutkan masuk."
            : "You have successfully verified your account. Please return to the Uangku financial app page to sign in."}
        </p>

        {/* Badge & Info */}
        <div className="w-full bg-muted/60 rounded-2xl p-3.5 mb-6 flex items-center justify-between border border-border/50 text-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="size-4 shrink-0" />
            <span>{isId ? "Akun Terverifikasi" : "Account Verified"}</span>
          </div>
          <span className="text-muted-foreground font-mono">
            {isId ? `Otomatis kembali (${countdown}s)` : `Redirecting (${countdown}s)`}
          </span>
        </div>

        {/* Direct Action Button */}
        <Button
          onClick={() => router.push("/auth?verified=true")}
          className="w-full h-11 rounded-2xl gap-2 font-bold shadow-md cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <span>{isId ? "Kembali ke Halaman Login" : "Return to Login Page"}</span>
          <ArrowRight className="size-4" />
        </Button>
      </motion.div>
    </div>
  );
}
