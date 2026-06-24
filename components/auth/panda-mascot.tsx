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
const sizes = {
  mobile: "clamp(140px, 45vw, 220px)",
  tablet: "clamp(180px, 28vw, 320px)",
  desktop: "clamp(220px, 26vw, 400px)",
} as const;

export function PandaMascot({
  variant = "desktop",
}: {
  variant?: keyof typeof sizes;
}) {
  const size = sizes[variant];

  return (
    <div
      className="relative shrink-0 bg-transparent"
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/panda-mascot.png"
        alt="Maskot Uangku"
        fill
        sizes="(max-width: 768px) 45vw, (max-width: 1024px) 28vw, 26vw"
        className="object-contain"
        priority
      />
    </div>
  );
}