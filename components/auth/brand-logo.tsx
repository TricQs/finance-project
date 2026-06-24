// components/auth/brand-logo.tsx
// Logo + ribbon banner — statis, tidak berubah dengan tema.

import Image from "next/image";

type LogoSize = "sm" | "md" | "lg";

interface BrandLogoProps {
  size?: LogoSize;
}

const cfg = {
  sm: { img: 44, text: "text-base", px: "pl-3 pr-6 py-1.5", notch: 14, gap: -10 },
  md: { img: 56, text: "text-xl", px: "pl-4 pr-8 py-2", notch: 18, gap: -13 },
  lg: { img: 64, text: "text-2xl", px: "pl-5 pr-10 py-2.5", notch: 20, gap: -15 },
};

export function BrandLogo({ size = "md" }: BrandLogoProps) {
  const c = cfg[size];
  const ribbon = `polygon(0 0, calc(100% - ${c.notch}px) 0, 100% 50%, calc(100% - ${c.notch}px) 100%, 0 100%)`;

  return (
    <div className="flex items-center">
      <div
        className="relative rounded-full shrink-0 z-10 shadow-lg"
        style={{
          width: c.img,
          height: c.img,
          border: "2.5px solid #c9901a",
          backgroundColor: "#f5ecd0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        }}
      >
        <Image
          src="/images/logo.png"
          alt="Logo Uangku"
          fill
          className="object-contain p-1"
          priority
        />
      </div>

      <div
        className={`relative flex items-center ${c.px} shadow-md select-none`}
        style={{
          marginLeft: c.gap,
          clipPath: ribbon,
          backgroundColor: "#1c1000",
          zIndex: 5,
        }}
      >
        <span
          className={`font-extrabold tracking-wide whitespace-nowrap ${c.text}`}
          style={{ color: "#ffffff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
        >
          Uangku
        </span>
      </div>
    </div>
  );
}