"use client";

import { useState, useEffect } from "react";

export type SystemLanguage = "en" | "id";

export function useSystemLanguage(): SystemLanguage {
  const [lang, setLang] = useState<SystemLanguage>("en"); // English is basic default

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.language) {
      const sysLang = navigator.language.toLowerCase();
      if (sysLang.startsWith("id")) {
        setLang("id");
      } else {
        // English for English and all languages outside Indonesian
        setLang("en");
      }
    }
  }, []);

  return lang;
}
