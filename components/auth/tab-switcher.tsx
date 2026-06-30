"use client";

// 1. PERBAIKAN: Ubah 'm' menjadi 'motion'
import { motion } from "framer-motion";

export type AuthMode = "login" | "register";

interface TabSwitcherProps {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
}

const TABS: { value: AuthMode; label: string }[] = [
  { value: "login", label: "Masuk" },
  { value: "register", label: "Daftar" },
];

export function TabSwitcher({ mode, onChange }: TabSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Pilih mode masuk atau daftar"
      className="relative flex items-center rounded-2xl p-1 border"
      style={{
        backgroundColor: "var(--auth-floating-bg)",
        borderColor: "var(--auth-floating-border)",
      }}
    >
      {TABS.map((tab) => {
          const isActive = tab.value === mode;

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className="relative flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {/* Indikator Tab Aktif (Pill Menonjol & Glow) */}
            {isActive && (
              <motion.div
                layoutId="auth-tab-indicator"
                className="absolute inset-0 rounded-xl border opacity-10"
                initial={false}
                transition={{
                  type: "spring",
                  bounce: 0.15,
                  duration: 0.5,
                }}
                style={{
                  backgroundColor: "var(--auth-primary)",
                  borderColor: "var(--auth-primary)",
                }}
              />
            )}
            <span
              className="relative z-10 transition-colors duration-200"
              style={{
                color: isActive
                  ? "var(--auth-primary)"
                  : "var(--auth-text-muted)",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}