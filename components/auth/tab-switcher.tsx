// components/auth/tab-switcher.tsx
// Login/Register sebagai STATE (onClick callback), bukan navigasi route.
"use client";

export function TabSwitcher({
  mode,
  onChange,
  isDark,
}: {
  mode: "login" | "register";
  onChange: (mode: "login" | "register") => void;
  isDark: boolean;
}) {
  const wrapBg = isDark ? "#0a1020" : "#e4e9f2";

  return (
    <div className="flex rounded-full p-1 mb-6" style={{ backgroundColor: wrapBg }}>
      {(["login", "register"] as const).map((tab) => {
        const active = tab === mode;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className="flex-1 text-center py-2 rounded-full text-sm font-semibold transition-all duration-200 capitalize"
            style={{
              backgroundColor: active ? "#ffffff" : "transparent",
              color: active ? "#111827" : isDark ? "#6b7280" : "#9ca3af",
              boxShadow: active ? "0 1px 4px rgba(0,0,0,0.18)" : "none",
            }}
          >
            {tab === "login" ? "Login" : "Register"}
          </button>
        );
      })}
    </div>
  );
}