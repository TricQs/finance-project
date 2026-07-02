"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function ThemeToggleCompact() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="size-10 shrink-0 rounded-2xl" />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Ubah ke tema ${isDark ? "terang" : "gelap"}`}
      className="neu-raised-sm neu-interactive neu-transition flex size-10 shrink-0 items-center justify-center rounded-2xl text-muted-foreground hover:text-foreground"
    >
      {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </button>
  )
}