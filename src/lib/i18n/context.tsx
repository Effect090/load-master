"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Locale, Translations } from "./types";
import { frDarija } from "./translations/fr-darija";
import { fr } from "./translations/fr";

const LOCALES: Record<Locale, Translations> = {
  "fr-darija": frDarija,
  fr,
};

const STORAGE_KEY = "casafoot_locale";
const DEFAULT_LOCALE: Locale = "fr-darija";

interface LangContextValue {
  locale: Locale;
  t: (key: keyof Translations, vars?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && stored in LOCALES) setLocaleState(stored);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: keyof Translations, vars?: Record<string, string | number>): string => {
      const dict = LOCALES[locale];
      let str: string = dict[key] ?? LOCALES[DEFAULT_LOCALE][key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    },
    [locale]
  );

  return (
    <LangContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
