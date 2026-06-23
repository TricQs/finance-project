// components/auth/brand-logo.tsx
// Komponen Logo + Ribbon Banner — STATIS, tidak berubah dengan tema
// Logo PNG harus transparan backgroundnya

import Image from "next/image";

type LogoSize = "sm" | "md" | "lg";

interface BrandLogoProps {
  size?: LogoSize;
}

const cfg = {
  sm: { img: 42, text: "text-lg", px: "pl-3 pr-7 py-1.5", notch: 16, gap: -10 },
  md: { img: 52, text: "text-xl", px: "pl-4 pr-9 py-2", notch: 18, gap: -12 },
  lg: {
    img: 62,
    text: "text-2xl",
    px: "pl-5 pr-11 py-2.5",
    notch: 22,
    gap: -14,
  },
};

export function BrandLogo({ size = "md" }: BrandLogoProps) {
  const c = cfg[size];
  // Ribbon: rata kiri, ujung kanan notch segitiga masuk ke dalam
  const ribbon = `polygon(0 0, calc(100% - ${c.notch}px) 0, 100% 50%, calc(100% - ${c.notch}px) 100%, 0 100%)`;

  return (
    <div className="flex items-center">
      {/* Lingkaran logo — border emas, z-index lebih tinggi dari ribbon */}
      <div
        className="relative rounded-full shrink-0 z-10 shadow-lg"
        style={{
          width: c.img,
          height: c.img,
          border: "2.5px solid #c9901a",
          backgroundColor: "#f5ecd0", // krem netral, logo wallet tampil baik di atas ini
          boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        }}
      >
        <Image
          src="/images/logo.png"
          alt="Logo Uangku"
          fill
          className="object-contain p-0.75"
          priority
        />
      </div>

      {/* Ribbon banner — overlap dari belakang lingkaran */}
      <div
        className={`relative flex items-center ${c.px} shadow-md select-none`}
        style={{
          marginLeft: c.gap, // negatif = ribbon masuk ke balik lingkaran
          clipPath: ribbon,
          backgroundColor: "#1c1000", // coklat hitam gelap — sama persis di semua tema
          zIndex: 5,
        }}
      >
        <span
          className={`font-extrabold tracking-wide ${c.text}`}
          style={{ color: "#ffffff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
        >
          Uangku
        </span>
      </div>
    </div>
  );
}
