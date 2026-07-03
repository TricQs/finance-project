"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <>
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="mode-tog flex items-center justify-between transition-all duration-500 select-none outline-none"
        aria-label={`Ubah ke tema ${isDark ? "terang" : "gelap"}`}
        style={{
          width: "108px",
          height: "44px",
          padding: "2px",
          borderRadius: "9999px",
          position: "fixed",
          right: "50px",
          top: "50px",
          zIndex: 50,
          background: isDark
            ? "linear-gradient(135deg, rgba(30, 32, 42, 0.75), rgba(15, 17, 22, 0.45))"
            : "linear-gradient(135deg, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.05))",
          border: isDark
            ? "1.5px solid rgba(255, 255, 255, 0.08)"
            : "1.5px solid rgba(15, 23, 42, 0.16)",
          boxShadow: isDark
            ? "inset 0 2px 4px rgba(255, 255, 255, 0.03), inset 0 -2px 4px rgba(0, 0, 0, 0.4), 0 10px 25px rgba(0, 0, 0, 0.35)"
            : "inset 0 2px 4px rgba(0, 0, 0, 0.08), inset 0 -2px 4px rgba(255, 255, 255, 0.5), 0 10px 25px rgba(0, 0, 0, 0.04)",
          backdropFilter: "blur(16px) saturate(140%)",
          cursor: "pointer",
        }}
      >
        {/* Text Labels */}
        <div className="relative w-full h-full flex items-center justify-between px-4 select-none pointer-events-none font-heading">
          {/* Dark Mode Text */}
          <span
            className="text-[12px] font-bold tracking-wide transition-all duration-400"
            style={{
              color: isDark ? "rgba(255, 255, 255, 0.85)" : "transparent",
              transform: isDark ? "translateX(0)" : "translateX(-8px)",
              opacity: isDark ? 1 : 0,
            }}
          >
            Dark
          </span>
          {/* Light Mode Text */}
          <span
            className="text-[12px] font-bold tracking-wide transition-all duration-0.2"
            style={{
              color: !isDark ? "rgba(15, 23, 42, 0.75)" : "transparent",
              transform: !isDark ? "translateX(0)" : "translateX(8px)",
              opacity: !isDark ? 1 : 0,
            }}
          >
            Light
          </span>
        </div>

        {/* 3D Liquid Glass Bubble Knob */}
        <motion.div
          className="absolute rounded-full flex items-center justify-center pointer-events-none"
          animate={{
            x: isDark ? 60 : -2,
            rotate: isDark ? 180 : 0
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 22,
            mass: 0.85
          }}
          style={{
            width: "48px",
            height: "48px",
            left: "0px",
            top: "-3.5px",
            background: isDark
              ? "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02))"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.35))",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.8)"
              : "1px solid rgba(15, 23, 42, 0.12)",
            boxShadow: isDark
              ? "inset 1px 1px 2px rgba(255,255,255,0.4), inset -2px -2px 4px rgba(0,0,0,0.5), inset 0 6px 12px rgba(255,255,255,0.15), 0 8px 24px -4px rgba(0, 0, 0, 0.45)"
              : "inset 2px 2px 4px rgba(255,255,255,0.9), inset -2px -2px 4px rgba(0,0,0,0.06), inset 0 6px 12px rgba(255,255,255,0.65), 0 8px 24px -4px rgba(0, 0, 0, 0.12)",
            backdropFilter: "blur(8px)",
            willChange: "transform",
          }}
        >
          {/* Glowing Sun/Moon Icons */}
          <div className="relative w-5 h-5 flex items-center justify-center">
            {/* Moon Icon */}
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute w-5 h-5 text-yellow-100 drop-shadow-[0_0_8px_rgba(254,240,138,0.7)]"
              animate={{
                opacity: isDark ? 1 : 0,
                scale: isDark ? 1 : 0.4,
              }}
              transition={{ duration: 0.3 }}
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" stroke="currentColor" />
            </motion.svg>

            {/* Sun Icon */}
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute w-5 h-5 text-amber-600 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
              animate={{
                opacity: !isDark ? 1 : 0,
                scale: !isDark ? 1 : 0.4,
              }}
              transition={{ duration: 0.3 }}
            >
              <circle cx="12" cy="12" r="4" fill="currentColor" stroke="currentColor" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </motion.svg>
          </div>
        </motion.div>
      </button>

      {/* Layer Animasi Lonjong yang dikendalikan oleh Framer Motion agar KEBAL terhadap blokiran next-themes */}
      <div
        className="dark-mode-wrapper"
        style={{
          position: "fixed",
          right: "84px", /* Centered on the 108px wide button (50px right margin + 34px center offset) */
          top: "52px", /* Centered vertically on the 44px tall button (50px top margin + 2px offset) */
          width: "40px",
          height: "40px",
          zIndex: 10,
          pointerEvents: "none"
        }}
      >
        <AnimatePresence>
          {isDark ? (
            <motion.div
              key="dark-circle"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 120, opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                backgroundColor: "oklch(0.08 0.015 256)",
                transformOrigin: "center center",
                willChange: "transform, opacity"
              }}
            />
          ) : (
            <motion.div
              key="light-circle"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 120, opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                backgroundColor: "oklch(0.97 0.006 256)",
                transformOrigin: "center center",
                willChange: "transform, opacity"
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}