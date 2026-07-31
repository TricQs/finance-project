"use client";

import Image from "next/image";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
}

const SIZE_CONFIG: Record<
  LogoSize,
  { img: number; text: string; gap: string }
> = {
  sm: { img: 32, text: "text-base font-extrabold", gap: "gap-2" },
  md: { img: 40, text: "text-xl font-black tracking-tight", gap: "gap-2.5" },
  lg: { img: 52, text: "text-2xl font-black tracking-tight", gap: "gap-3" },
};

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const config = SIZE_CONFIG[size];

  return (
    <div className={`flex items-center ${config.gap} select-none ${className}`}>
      <div 
        className="relative rounded-full overflow-hidden shadow-md border border-emerald-500/20 shrink-0 bg-zinc-950 flex items-center justify-center transition-transform hover:scale-105"
        style={{
          width: config.img,
          height: config.img,
        }}
      >
        <Image
          src="/logo.png"
          alt="Uangku Logo"
          width={config.img}
          height={config.img}
          className="object-cover size-full rounded-full"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-heading ${config.text} text-foreground flex items-center gap-1`}>
            Uangku
            <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
          </span>
        </div>
      )}
    </div>
  );
}
