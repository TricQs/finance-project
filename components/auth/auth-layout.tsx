"use client";

import { useEffect, useState } from "react";
import { Lock, Star } from "lucide-react";
import { m, LazyMotion, domAnimation } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import { AuthForm } from "@/components/auth/auth-form";
import {
  MascotCelengan,
  type CelenganExpression,
} from "@/components/auth/mascot-celengan";

const appleEase = [0.16, 1, 0.3, 1] as [number, number, number, number];

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Platform yang luar biasa! Pengalaman penggunanya sangat mulus dan fitur manajemen keuangannya sangat membantu.",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "Aplikasi Uangku sangat membantu melacak arus kas multi-rekening saya secara otomatis.",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "Laporan analisis saldo dan ekspor PDF memudahkan evaluasi anggaran bulanan keluarga kami.",
  },
];

const TestimonialCard = ({
  testimonial,
  delay,
}: {
  testimonial: Testimonial;
  delay: string;
}) => (
  <div
    className={`${delay} flex items-start gap-3.5 rounded-3xl bg-card/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/15 p-4 shadow-2xl w-72 text-left hover:scale-[1.02] transition-transform duration-300`}
  >
    <img
      src={testimonial.avatarSrc}
      className="h-10 w-10 object-cover rounded-2xl border border-white/20 shadow-md shrink-0"
      alt={testimonial.name}
    />
    <div className="text-xs leading-snug">
      <div className="flex items-center justify-between gap-1">
        <p className="font-semibold text-foreground">{testimonial.name}</p>
        <div className="flex text-amber-400">
          <Star size={11} fill="currentColor" />
          <Star size={11} fill="currentColor" />
          <Star size={11} fill="currentColor" />
        </div>
      </div>
      <p className="text-muted-foreground text-[11px] mb-1">{testimonial.handle}</p>
      <p className="text-foreground/90 text-[11.5px] leading-relaxed">{testimonial.text}</p>
    </div>
  </div>
);

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
      <div className="relative min-h-screen w-full flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-hidden auth-bg-gradient auth-bg-transition">
        {/* Glow Effects */}
        <div className="absolute top-[-15%] left-[-5%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-40 pointer-events-none hidden sm:block auth-glow-transition" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-30 pointer-events-none hidden sm:block auth-primary-glow-transition" />

        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: appleEase }}
          className="relative z-20 w-full max-w-6xl"
        >
          <div className="relative">
            <div className="absolute -inset-1.5 sm:-inset-2 rounded-[2.5rem] sm:rounded-[3rem] pointer-events-none blur-2xl opacity-40 auth-glow-transition" />

            <div
              className="relative rounded-4xl sm:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/10 dark:ring-white/5 bg-card/70 backdrop-blur-3xl"
            >
              <div className="flex flex-col lg:flex-row min-h-[640px]">
                {/* ── KIRI: Form Sign In / Sign Up ── */}
                <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 md:p-12 relative z-10">
                  <div className="w-full max-w-md mx-auto my-auto space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <Logo size="sm" />
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
                          Aman &amp; Terenkripsi
                        </span>
                      </div>
                    </div>

                    <AuthForm
                      onExpressionChange={setExpression}
                      initialError={initialError}
                    />
                  </div>
                </div>

                {/* ── KANAN: Hero Visual Split Screen & Testimonial Cards ── */}
                <div className="hidden lg:block lg:w-1/2 relative p-4 overflow-hidden">
                  <div
                    className="absolute inset-4 rounded-[2rem] bg-cover bg-center overflow-hidden border border-white/10 shadow-2xl"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=1600&q=80')`,
                    }}
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-black/30" />

                    {/* Top Branding Badge */}
                    <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-10">
                      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-card/60 backdrop-blur-xl border border-white/15 text-xs font-semibold text-foreground">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Platform Keuangan Terpercaya #1
                      </div>

                      {/* Mascot Preview Badge */}
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <MascotCelengan expression={expression} className="w-full h-full" />
                      </div>
                    </div>

                    {/* Bottom Floating Testimonial Cards Carousel */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 w-full px-6 z-10">
                      <TestimonialCard
                        testimonial={sampleTestimonials[0]}
                        delay="animate-element animate-delay-300"
                      />
                      <TestimonialCard
                        testimonial={sampleTestimonials[1]}
                        delay="animate-element animate-delay-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
            <Lock className="w-3.5 h-3.5 opacity-70" />
            <p className="text-center text-[11px] font-semibold tracking-[0.2em] uppercase opacity-70">
              Sinkronisasi Otomatis · Row Level Security (RLS) · Uangku
            </p>
          </div>
        </m.div>
      </div>
    </LazyMotion>
  );
}
