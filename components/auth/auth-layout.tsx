// components/auth/auth-layout.tsx
//
// Perbaikan dari versi sebelumnya:
// 1. Mobile: card form punya margin kiri-kanan (tangan mascot kelihatan),
//    fixed min-height berdasarkan konten Register agar tidak naik-turun.
// 2. Tablet/Desktop: GRID 2 kolom 50/50. Mascot KIRI, card form KANAN —
//    melayang dengan padding di semua sisi, background kontras.
// 3. Logo+pita di TENGAH-ATAS kepala mascot.
// 4. ThemeToggle benar-benar independen (fixed).
// 5. Card form ukuran FIXED, diperbesar agar tidak tenggelam di layar lebar.
//    Kolom mascot pakai h-full + justify-center supaya sejajar vertikal
//    dengan card.
"use client";

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
    <>
      {mounted && <ThemeToggle isDark={isDark} onToggle={toggle} />}
      <MobileLayout isDark={isDark} />
      <TabletDesktopLayout isDark={isDark} variant="tablet" />
      <TabletDesktopLayout isDark={isDark} variant="desktop" />
    </>
  );
}

function MobileLayout({ isDark }: { isDark: boolean }) {
  const pageBg = isDark ? "#0d1526" : "#dde3f0";
  const cardBg = isDark ? "#111d35" : "#ffffff";

  return (
    <div
      className="md:hidden flex flex-col min-h-svh items-center pt-8 px-3 pb-6"
      style={{ backgroundColor: pageBg }}
    >
      <div className="mb-1">
        <BrandLogo size="sm" />
      </div>

      <div className="relative z-0" style={{ marginBottom: "-56px" }}>
        <PandaMascot variant="mobile" />
      </div>

      <div
        className="relative z-10 w-full max-w-90 rounded-3xl shadow-2xl px-6 py-7"
        style={{ backgroundColor: cardBg, minHeight: 480 }}
      >
        <AuthForm isDark={isDark} />
      </div>
    </div>
  );
}

function TabletDesktopLayout({
  isDark,
  variant,
}: {
  isDark: boolean;
  variant: "tablet" | "desktop";
}) {
  const bg = isDark ? "#0d1526" : "#dde3f0";
  const cardBg = isDark ? "#151f3a" : "#ffffff";

  const visibility =
    variant === "tablet" ? "hidden md:grid lg:hidden" : "hidden lg:grid";

  const cardSize =
    variant === "tablet"
      ? { width: 420, height: 560 }
      : { width: 460, height: 600 };

  const mascotVariant = variant;
  const logoSize: "md" | "lg" = "lg";
  const gap = variant === "tablet" ? 20 : 24;

  return (
    <div
      className={`${visibility} min-h-svh grid-cols-2`}
      style={{ backgroundColor: bg }}
    >
      <div className="flex h-full flex-col items-center justify-center">
        <div style={{ marginBottom: gap }}>
          <BrandLogo size={logoSize} />
        </div>
        <PandaMascot variant={mascotVariant} />
      </div>

      <div className="flex h-full items-center justify-center p-8">
        <div
          className="rounded-2xl shadow-xl px-10 py-10 flex flex-col"
          style={{
            backgroundColor: cardBg,
            width: cardSize.width,
            height: cardSize.height,
            boxShadow: isDark
              ? "0 8px 30px rgba(0,0,0,0.4)"
              : "0 8px 30px rgba(0,0,0,0.12)",
          }}
        >
          <AuthForm isDark={isDark} />
        </div>
      </div>
    </div>
  );
}
