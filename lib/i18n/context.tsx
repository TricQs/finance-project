"use client";

import React, { createContext, useContext, useState } from "react";
import { translations, Language } from "./dictionary";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.id;
  getGreeting: () => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("uangku_lang") as Language | null;
      if (saved === "id" || saved === "en" || saved === "ja") {
        return saved;
      }
      if (navigator.language) {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith("id")) return "id";
        if (browserLang.startsWith("ja")) return "ja";
      }
    }
    return "en";
  });


  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("uangku_lang", lang);
      document.cookie = `uangku_lang=${lang}; path=/; max-age=31536000`;
    }
  };

  // Real-time local browser time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const g = translations[language].greetings;

    if (hour >= 5 && hour < 12) {
      return g.morning;
    } else if (hour >= 12 && hour < 18) {
      return g.afternoon;
    } else {
      return g.night;
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getGreeting }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
