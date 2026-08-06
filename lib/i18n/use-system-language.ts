"use client";

import { useState } from "react";

export type SystemLanguage = "en" | "id";

export function useSystemLanguage(): SystemLanguage {
  const [lang] = useState<SystemLanguage>(() => {
    if (typeof window !== "undefined" && navigator.language) {
      return navigator.language.toLowerCase().startsWith("id") ? "id" : "en";
    }
    return "en";
  });

  return lang;
}
