"use client";

import { useEffect, useState, useId } from "react";
import { motion } from "framer-motion";
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

export function MascotCelengan({
  expression = "idle",
  className,
}: MascotCelenganProps) {
  const [blink, setBlink] = useState(false);
  const id = useId();
  const seed = Array.from(id).reduce((acc, c) => acc + c.charCodeAt(0), 0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      const delay = 3500 + (seed % 2500);
      timeoutId = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 100);
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  const eyeShape = EYE_SHAPE[expression];
  const eyeRX = blink ? 9 : eyeShape.rx;
  const eyeRY = blink ? 1 : eyeShape.ry;

  return (
    <svg
      viewBox="0 0 200 240"
      width="100%"
      height="100%"
      role="img"
      aria-label="Maskot celengan Uangku"
      className={cn("select-none overflow-visible", className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <ellipse cx={100} cy={210} rx={50} ry={6} fill="#000" fillOpacity="0.15" />

      <rect x="60" y="180" width="16" height="15" rx="6" fill="#3730a3" />
      <rect x="82" y="182" width="14" height="13" rx="5" fill="#3730a3" />
      <rect x="104" y="182" width="14" height="13" rx="5" fill="#3730a3" />
      <rect x="124" y="180" width="16" height="15" rx="6" fill="#3730a3" />

      <path
        d="M 158,135 Q 172,130 170,118 Q 168,108 174,110"
        fill="none"
        stroke="#4338ca"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <motion.path
        animate={{ d: LEFT_ARM[expression] }}
        fill="none" stroke="#4338ca" strokeWidth="6" strokeLinecap="round"
        transition={{ duration: 0.2 }}
      />
      <motion.path
        animate={{ d: RIGHT_ARM[expression] }}
        fill="none" stroke="#4338ca" strokeWidth="6" strokeLinecap="round"
        transition={{ duration: 0.2 }}
      />

      <defs>
        <radialGradient id="celengan-body-gradient" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </radialGradient>
      </defs>
      <ellipse cx={100} cy={135} rx={58} ry={50} fill="url(#celengan-body-gradient)" />

      <rect x="86" y="82" width="28" height="5" rx="2.5" fill="#fbbf24" />
      <rect x="88" y="83" width="24" height="2" rx="1" fill="#fcd34d" />

      <motion.path
        animate={{ d: LEFT_EAR[expression] }}
        fill="none" stroke="#4f46e5" strokeWidth="6" strokeLinecap="round"
        transition={{ duration: 0.2 }}
      />
      <motion.path
        animate={{ d: RIGHT_EAR[expression] }}
        fill="none" stroke="#4f46e5" strokeWidth="6" strokeLinecap="round"
        transition={{ duration: 0.2 }}
      />

      <ellipse cx={100} cy={158} rx={22} ry={15} fill="#6366f1" fillOpacity="0.4" />
      <circle cx="93" cy="156" r="2.5" fill="#1e1b4b" fillOpacity="0.5" />
      <circle cx="107" cy="156" r="2.5" fill="#1e1b4b" fillOpacity="0.5" />

      <ellipse cx={EYES.left.x} cy={EYES.left.y} rx={eyeRX} ry={eyeRY} fill="#ffffff" />
      <ellipse cx={EYES.right.x} cy={EYES.right.y} rx={eyeRX} ry={eyeRY} fill="#ffffff" />

      <g style={{ opacity: blink ? 0 : 1 }}>
        <circle cx={EYES.left.x} cy={EYES.left.y} r={PUPIL_RADIUS} fill="#292524" />
        <circle cx={EYES.right.x} cy={EYES.right.y} r={PUPIL_RADIUS} fill="#292524" />
      </g>

      <ellipse cx={64} cy={134} rx={8} ry={4} fill="#f472b6" fillOpacity="0.3" />
      <ellipse cx={136} cy={134} rx={8} ry={4} fill="#f472b6" fillOpacity="0.3" />

      <motion.path
        animate={{ d: MOUTH[expression] }}
        fill="none" stroke="#312e81" strokeWidth="2" strokeLinecap="round"
        transition={{ duration: 0.2 }}
      />

      {expression === "error" && (
        <path d="M 58,108 Q 54,114 58,116 Q 62,114 58,108 Z" fill="#38bdf8" />
      )}

      {expression === "success" && (
        <>
          <path d="M 48,92 L 51,98 L 57,99 L 52,103 L 53,110 L 48,106 L 43,110 L 44,103 L 39,99 L 45,98 Z" fill="#fde047" />
          <path d="M 152,96 L 155,102 L 161,103 L 156,107 L 157,114 L 152,110 L 147,114 L 148,107 L 143,103 L 149,102 Z" fill="#fde047" />
          <path d="M 100,60 L 103,66 L 109,67 L 104,71 L 105,78 L 100,74 L 95,78 L 96,71 L 91,67 L 97,66 Z" fill="#fde047" />
        </>
      )}
    </svg>
  );
}