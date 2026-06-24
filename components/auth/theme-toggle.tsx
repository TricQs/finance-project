// components/auth/theme-toggle.tsx
// Berdiri sendiri, fixed di pojok kanan atas — TIDAK ada di dalam card form.
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
    <button
      onClick={onToggle}
      aria-label="Ganti tema"
      className="fixed top-5 right-5 z-50 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all shadow-md"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#ffffff",
        color: isDark ? "rgba(255,255,255,0.75)" : "#4b5563",
        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
      }}
    >
      <Sun className="w-3.5 h-3.5" />
      <div
        className="w-9 h-5 rounded-full relative transition-colors duration-300 shrink-0"
        style={{ backgroundColor: isDark ? "#3b5bdb" : "#d1d5db" }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
          style={{ left: isDark ? "18px" : "2px" }}
        />
      </div>
      <Moon className="w-3.5 h-3.5" />
    </button>
  );
}