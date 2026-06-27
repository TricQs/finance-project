"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export type CelenganExpression =
  | "idle"
  | "typing"
  | "password"
  | "loading"
  | "error"
  | "success";

interface MascotCelenganProps {
  expression?: CelenganExpression;
  className?: string;
}

const PUPIL_RADIUS = 3.5;
const MAX_PUPIL_OFFSET = 4.5;
const EYES = { left: { x: 78, y: 120 }, right: { x: 122, y: 120 } } as const;

const MOUTH: Record<CelenganExpression, string> = {
  idle: "M 92,162 Q 100,168 108,162",
  typing: "M 93,162 Q 100,167 107,162",
  password: "M 94,164 Q 100,161 106,164",
  loading: "M 92,165 Q 100,159 108,165",
  error: "M 92,166 Q 100,161 108,166",
  success: "M 90,160 Q 100,172 110,160",
};

const LEFT_EAR: Record<CelenganExpression, string> = {
  idle: "M 60,86 Q 55,64 70,78",
  typing: "M 60,86 Q 56,66 70,78",
  password: "M 60,92 Q 58,78 70,84",
  loading: "M 62,86 Q 57,66 72,78",
  error: "M 60,94 Q 58,82 70,88",
  success: "M 58,82 Q 52,60 68,74",
};

const RIGHT_EAR: Record<CelenganExpression, string> = {
  idle: "M 140,86 Q 145,64 130,78",
  typing: "M 140,86 Q 144,66 130,78",
  password: "M 140,92 Q 142,78 130,84",
  loading: "M 138,86 Q 143,66 128,78",
  error: "M 140,94 Q 142,82 130,88",
  success: "M 142,82 Q 148,60 132,74",
};

const LEFT_ARM: Record<CelenganExpression, string> = {
  idle: "M 38,140 Q 32,152 42,160",
  typing: "M 38,140 Q 32,152 42,160",
  password: "M 38,130 Q 50,105 72,116",
  loading: "M 38,142 Q 32,152 42,160",
  error: "M 38,142 Q 32,152 42,160",
  success: "M 38,136 Q 30,146 42,154",
};

const RIGHT_ARM: Record<CelenganExpression, string> = {
  idle: "M 162,140 Q 168,152 158,160",
  typing: "M 162,140 Q 168,152 158,160",
  password: "M 162,130 Q 150,105 128,116",
  loading: "M 162,142 Q 168,152 158,160",
  error: "M 162,142 Q 168,152 158,160",
  success: "M 162,136 Q 170,146 158,154",
};

const EYE_SHAPE: Record<CelenganExpression, { rx: number; ry: number }> = {
  idle: { rx: 9, ry: 9 },
  typing: { rx: 9, ry: 8 },
  password: { rx: 10, ry: 10 },
  loading: { rx: 7, ry: 5 },
  error: { rx: 9, ry: 6 },
  success: { rx: 10, ry: 10 },
};

function SparkleStar({
  cx,
  cy,
  delay,
}: {
  cx: number;
  cy: number;
  delay: number;
}) {
  return (
    <motion.path
      d={`M ${cx},${cy - 8} L ${cx + 3},${cy - 2} L ${cx + 9},${cy - 1} L ${cx + 4},${cy + 4} L ${cx + 5},${cy + 10} L ${cx},${cy + 6} L ${cx - 5},${cy + 10} L ${cx - 4},${cy + 4} L ${cx - 9},${cy - 1} L ${cx - 3},${cy - 2} Z`}
      fill="#fde047"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
    />
  );
}

/**
 * Mascot "Celengan" (piggy bank) — SVG vector, bereaksi terhadap
 * pergerakan cursor (mata) dan state form yang sedang aktif (ekspresi).
 *
 * Catatan migrasi: ini adalah implementasi sementara berbasis SVG path.
 * Sesuai rencana, mascot akan dipindah ke Rive (state machine animasi)
 * pada fase UI touch-up. Prop `expression` sengaja dipertahankan sebagai
 * string union supaya kompatibel dipetakan langsung ke Rive state input
 * nanti tanpa mengubah pemanggil (AuthForm).
 */
export function MascotCelengan({
  expression = "idle",
  className,
}: MascotCelenganProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 180, damping: 22 });
  const smoothY = useSpring(mouseY, { stiffness: 180, damping: 22 });
  const [blink, setBlink] = useState(false);

  // Blink berkala otomatis
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      const delay = 3500 + Math.random() * 2500;
      timeoutId = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 100);
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  // Parallax pupil mengikuti cursor relatif terhadap elemen mascot
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    function handlePointerMove(e: PointerEvent) {
      if (!el) return; // ← add this
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      mouseX.set(Math.max(-1, Math.min(1, dx)));
      mouseY.set(Math.max(-1, Math.min(1, dy)));
    }

    function handlePointerLeave() {
      mouseX.set(0);
      mouseY.set(0);
    }

    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [mouseX, mouseY]);

  const leftPupilX = useTransform(
    smoothX,
    [-1, 1],
    [EYES.left.x - MAX_PUPIL_OFFSET, EYES.left.x + MAX_PUPIL_OFFSET],
  );
  const leftPupilY = useTransform(
    smoothY,
    [-1, 1],
    [EYES.left.y - MAX_PUPIL_OFFSET, EYES.left.y + MAX_PUPIL_OFFSET],
  );
  const rightPupilX = useTransform(
    smoothX,
    [-1, 1],
    [EYES.right.x - MAX_PUPIL_OFFSET, EYES.right.x + MAX_PUPIL_OFFSET],
  );
  const rightPupilY = useTransform(
    smoothY,
    [-1, 1],
    [EYES.right.y - MAX_PUPIL_OFFSET, EYES.right.y + MAX_PUPIL_OFFSET],
  );

  const eyeShape = EYE_SHAPE[expression];

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 240"
      width="100%"
      height="100%"
      role="img"
      aria-label="Maskot celengan Uangku"
      className={cn("select-none overflow-visible", className)}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Shadow */}
      <ellipse
        cx={100}
        cy={210}
        rx={50}
        ry={6}
        fill="#000"
        fillOpacity="0.15"
      />

      {/* Legs */}
      <rect x="60" y="180" width="16" height="15" rx="6" fill="#3730a3" />
      <rect x="82" y="182" width="14" height="13" rx="5" fill="#3730a3" />
      <rect x="104" y="182" width="14" height="13" rx="5" fill="#3730a3" />
      <rect x="124" y="180" width="16" height="15" rx="6" fill="#3730a3" />

      {/* Tail */}
      <path
        d="M 158,135 Q 172,130 170,118 Q 168,108 174,110"
        fill="none"
        stroke="#4338ca"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Arms */}
      <motion.path
        d={LEFT_ARM[expression]}
        fill="none"
        stroke="#4338ca"
        strokeWidth="6"
        strokeLinecap="round"
        transition={{ duration: 0.35, ease: "easeInOut" }}
      />
      <motion.path
        d={RIGHT_ARM[expression]}
        fill="none"
        stroke="#4338ca"
        strokeWidth="6"
        strokeLinecap="round"
        transition={{ duration: 0.35, ease: "easeInOut" }}
      />

      {/* Body */}
      <defs>
        <radialGradient id="celengan-body-gradient" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </radialGradient>
      </defs>
      <ellipse
        cx={100}
        cy={135}
        rx={58}
        ry={50}
        fill="url(#celengan-body-gradient)"
      />

      {/* Coin slot */}
      <rect x="86" y="82" width="28" height="5" rx="2.5" fill="#fbbf24" />
      <rect x="88" y="83" width="24" height="2" rx="1" fill="#fcd34d" />

      {/* Ears */}
      <motion.path
        d={LEFT_EAR[expression]}
        fill="none"
        stroke="#4f46e5"
        strokeWidth="6"
        strokeLinecap="round"
        transition={{ duration: 0.25 }}
      />
      <motion.path
        d={RIGHT_EAR[expression]}
        fill="none"
        stroke="#4f46e5"
        strokeWidth="6"
        strokeLinecap="round"
        transition={{ duration: 0.25 }}
      />

      {/* Snout */}
      <ellipse
        cx={100}
        cy={158}
        rx={22}
        ry={15}
        fill="#6366f1"
        fillOpacity="0.4"
      />
      <circle cx="93" cy="156" r="2.5" fill="#1e1b4b" fillOpacity="0.5" />
      <circle cx="107" cy="156" r="2.5" fill="#1e1b4b" fillOpacity="0.5" />

      {/* Eyes */}
      <motion.ellipse
        cx={EYES.left.x}
        cy={EYES.left.y}
        animate={{ rx: blink ? 9 : eyeShape.rx, ry: blink ? 1 : eyeShape.ry }}
        transition={{ duration: 0.08 }}
        fill="#ffffff"
      />
      <motion.ellipse
        cx={EYES.right.x}
        cy={EYES.right.y}
        animate={{ rx: blink ? 9 : eyeShape.rx, ry: blink ? 1 : eyeShape.ry }}
        transition={{ duration: 0.08 }}
        fill="#ffffff"
      />

      {/* Pupils */}
      <motion.g
        animate={{ opacity: blink ? 0 : 1 }}
        transition={{ duration: 0.06 }}
      >
        <motion.circle
          cx={leftPupilX}
          cy={leftPupilY}
          r={PUPIL_RADIUS}
          fill="#292524"
        />
        <motion.circle
          cx={rightPupilX}
          cy={rightPupilY}
          r={PUPIL_RADIUS}
          fill="#292524"
        />
      </motion.g>

      {/* Blush */}
      <ellipse
        cx={64}
        cy={134}
        rx={8}
        ry={4}
        fill="#f472b6"
        fillOpacity="0.3"
      />
      <ellipse
        cx={136}
        cy={134}
        rx={8}
        ry={4}
        fill="#f472b6"
        fillOpacity="0.3"
      />

      {/* Mouth */}
      <motion.path
        d={MOUTH[expression]}
        fill="none"
        stroke="#312e81"
        strokeWidth="2"
        strokeLinecap="round"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />

      {/* Error tear */}
      {expression === "error" && (
        <motion.path
          d="M 58,108 Q 54,114 58,116 Q 62,114 58,108 Z"
          fill="#38bdf8"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        />
      )}

      {/* Success sparkles */}
      {expression === "success" && (
        <>
          <SparkleStar cx={48} cy={100} delay={0.1} />
          <SparkleStar cx={152} cy={104} delay={0.2} />
          <SparkleStar cx={100} cy={68} delay={0.15} />
        </>
      )}
    </svg>
  );
}
