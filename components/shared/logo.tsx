type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  size?: LogoSize;
}

const SIZE_CONFIG: Record<
  LogoSize,
  { img: number; text: string; px: string; notch: number; gap: number }
> = {
  sm: {
    img: 44,
    text: "text-base",
    px: "pl-3 pr-6 py-1.5",
    notch: 14,
    gap: -10,
  },
  md: { img: 56, text: "text-xl", px: "pl-4 pr-8 py-2", notch: 18, gap: -13 },
  lg: {
    img: 64,
    text: "text-2xl",
    px: "pl-5 pr-10 py-2.5",
    notch: 20,
    gap: -15,
  },
};

function CoinIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <circle cx="24" cy="24" r="22" fill="#f5ecd0" stroke="#c9901a" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="18" fill="none" stroke="#c9901a" strokeWidth="0.8" opacity="0.4" />
      <text
        x="24" y="24"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#b8860b"
        fontSize="20"
        fontFamily="serif"
        fontWeight="bold"
      >
        U
      </text>
    </svg>
  );
}

export function Logo({ size = "md" }: LogoProps) {
  const config = SIZE_CONFIG[size];
  const ribbonClip = `polygon(0 0, calc(100% - ${config.notch}px) 0, 100% 50%, calc(100% - ${config.notch}px) 100%, 0 100%)`;

  return (
    <div className="flex items-center">
      <div
        className="relative rounded-full shrink-0 z-10 shadow-lg flex items-center justify-center"
        style={{
          width: config.img,
          height: config.img,
          border: "2.5px solid #c9901a",
          backgroundColor: "#f5ecd0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        }}
      >
        <CoinIcon size={config.img - 8} />
      </div>

      <div
        className={`relative flex items-center ${config.px} shadow-md select-none`}
        style={{
          marginLeft: config.gap,
          clipPath: ribbonClip,
          backgroundColor: "#1c1000",
          zIndex: 5,
        }}
      >
        <span
          className={`font-extrabold tracking-wide whitespace-nowrap ${config.text}`}
          style={{ color: "#ffffff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
        >
          Uangku
        </span>
      </div>
    </div>
  );
}
