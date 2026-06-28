"use client";

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
      className="relative flex items-center rounded-2xl p-1.5"
      style={{
        backgroundColor: "var(--auth-tab-track)",
        border: "1px solid var(--auth-tab-track-border)",
        boxShadow: "inset 0 2px 6px rgba(0,0,0,0.18)",
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
            className="relative flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition-colors duration-200 cursor-pointer z-10"
            style={{
              color: isActive
                ? "var(--auth-tab-active-text)"
                : "var(--auth-tab-inactive-text)",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="auth-tab-indicator"
                className="absolute inset-0 rounded-xl"
                initial={false}
                style={{
                  background: "var(--auth-tab-pill-bg)",
                  boxShadow: "var(--auth-tab-pill-shadow)",
                  border: "1px solid var(--auth-tab-pill-border)",
                }}
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            {/* Top gloss on pill */}
            {isActive && (
              <motion.span
                layoutId="auth-tab-gloss"
                className="absolute inset-x-3 top-0 h-px rounded-full"
                style={{ background: "var(--auth-tab-pill-gloss)" }}
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
