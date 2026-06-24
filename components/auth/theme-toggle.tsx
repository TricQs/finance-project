// components/auth/theme-toggle.tsx
// Desain tombol sakelar pil kaca melayang (glassmorphic sliding switch).
"use client";

import { Sun, Moon } from "lucide-react";

export function ThemeToggle({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="fixed top-6 right-6 z-50">
      <button
        onClick={onToggle}
        aria-label="Ganti tema"
        className="relative flex items-center h-10 w-20 rounded-full p-1 bg-black/5 dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 cursor-pointer"
      >
        {/* Sliding Indicator (Pill latar belakang aktif) */}
        <span
          className="absolute top-1 left-1 w-8 h-8 rounded-full bg-white dark:bg-gradient-to-br dark:from-blue-500 dark:to-indigo-600 shadow-md transition-all duration-500 ease-in-out"
          style={{
            transform: isDark ? "translateX(40px)" : "translateX(0px)",
          }}
        />

        {/* Sun Icon */}
        <span className="flex-1 flex items-center justify-center z-10">
          <Sun
            className={`w-4 h-4 transition-all duration-500 ${
              isDark
                ? "text-gray-500 scale-90 opacity-70"
                : "text-amber-500 scale-110 rotate-[360deg] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            }`}
          />
        </span>

        {/* Moon Icon */}
        <span className="flex-1 flex items-center justify-center z-10">
          <Moon
            className={`w-4 h-4 transition-all duration-500 ${
              isDark
                ? "text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                : "text-gray-400 scale-90 opacity-70"
            }`}
          />
        </span>
      </button>
    </div>
  );
}