"use client";

import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

/** Tombol sakelar pil kaca melayang (glassmorphic sliding switch). */
export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <div className="fixed top-6 right-6 z-50">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Ganti tema"
        className="relative flex items-center h-10 w-20 rounded-full p-1 bg-black/5 dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 cursor-pointer"
      >
        <span
          className="absolute top-1 left-1 w-8 h-8 rounded-full bg-white dark:bg-linear-to-br dark:from-blue-500 dark:to-indigo-600 shadow-md transition-transform duration-500 ease-in-out"
          style={{ transform: isDark ? "translateX(40px)" : "translateX(0px)" }}
        />

        <span className="flex-1 flex items-center justify-center z-10">
          <Sun
            className={`w-4 h-4 transition-all duration-500 ${
              isDark
                ? "text-gray-500 scale-90 opacity-70"
                : "text-amber-500 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            }`}
          />
        </span>

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
