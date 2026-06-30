"use client";

import { m } from "framer-motion";
import { useState } from "react";

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
  const [hoveredTab, setHoveredTab] = useState<AuthMode | null>(null);

  return (
    <div
      role="tablist"
      aria-label="Pilih mode masuk atau daftar"
      className="relative flex items-center rounded-2xl p-1.5 border transition-colors duration-1000 shadow-inner"
      style={{
        backgroundColor: "var(--auth-input-bg)",
        borderColor: "var(--auth-input-border)",
      }}
      onMouseLeave={() => setHoveredTab(null)}
    >
      {TABS.map((tab) => {
        const isActive = tab.value === mode;
        const isHovered = tab.value === hoveredTab;

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            onMouseEnter={() => setHoveredTab(tab.value)}
            className={`relative flex-1 py-2.5 text-sm font-bold rounded-xl outline-none transition-all duration-300 select-none ${
              isActive ? "cursor-default" : "cursor-pointer"
            }`}
          >
            {/* Indikator Tab Aktif (Pill Menonjol & Glow) */}
            {isActive && (
              <m.div
                layoutId="auth-tab-active-indicator"
                className="absolute inset-0 rounded-xl border"
                initial={false}
                transition={{
                  type: "spring",
                  bounce: 0.15,
                  duration: 0.5,
                }}
                style={{
                  // Menggunakan warna background solid, BUKAN floating/transparan
                  backgroundColor: "var(--auth-card-bg)", 
                  // Border warna primary agar batasnya sangat tegas di Dark Mode
                  borderColor: "var(--auth-primary)", 
                  // Efek Glow / Pendaran Halus
                  boxShadow: "0 4px 12px var(--auth-primary-glow)", 
                }}
              />
            )}

            {/* Indikator Hover (Pill Transparan yang mengikuti mouse) */}
            {isHovered && !isActive && (
              <m.div
                layoutId="auth-tab-hover-indicator"
                className="absolute inset-0 rounded-xl opacity-60"
                initial={false}
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.4,
                }}
                style={{
                  backgroundColor: "var(--auth-input-hover)",
                }}
              />
            )}

            {/* Teks Label */}
            <span
              className="relative z-10 block w-full text-center transition-colors duration-300"
              style={{
                color: isActive
                  ? "var(--auth-primary)" // Teks menyala terang saat aktif
                  : isHovered
                  ? "var(--auth-text-primary)"
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