// components/auth/panda-mascot.tsx
//
// ADAPTIF + RESPONSIVE:
// - "Adaptif" = variant (mobile/tablet/desktop) ditentukan oleh middleware
//   User-Agent, BUKAN oleh lebar browser. Device HP selalu dapat variant
//   "mobile", device desktop selalu dapat variant "desktop", dst.
// - "Responsive" = SETIAP variant punya ukuran clamp(min, preferred-vw, max)
//   sehingga kalau browser di-resize, mascot ikut menyesuaikan secara halus
//   TANPA pernah lebih kecil dari `min` atau lebih besar dari `max`.
//   Ini yang mencegah overflow/terpotong saat viewport mengecil.

import Image from "next/image";

// clamp(MIN, PREFERRED, MAX) — PREFERRED dalam vw supaya ikut lebar viewport
import { cn } from "@/lib/utils";

const sizes = {
  mobile: "clamp(140px, 45vw, 220px)",
  tablet: "clamp(180px, 28vw, 320px)",
  desktop: "clamp(220px, 26vw, 400px)",
  responsive: "", // Menggunakan kelas Tailwind responsif
} as const;

export function PandaMascot({
  variant = "desktop",
}: {
  variant?: keyof typeof sizes;
}) {
  const size = sizes[variant];
  const isResponsive = variant === "responsive";

  return (
    <div
      className={cn(
        "relative shrink-0 bg-transparent transition-all duration-300",
        isResponsive && "w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] md:w-[220px] md:h-[220px] lg:w-[280px] lg:h-[280px] xl:w-[340px] xl:h-[340px]"
      )}
      style={!isResponsive ? { width: size, height: size } : undefined}
    >
      <Image
        src="/images/panda-mascot.png"
        alt="Maskot Uangku"
        fill
        sizes={
          isResponsive
            ? "(max-width: 640px) 150px, (max-width: 768px) 180px, (max-width: 1024px) 220px, (max-width: 1280px) 280px, 340px"
            : "(max-width: 768px) 45vw, (max-width: 1024px) 28vw, 26vw"
        }
        className="object-contain"
        priority
      />
    </div>
  );
}