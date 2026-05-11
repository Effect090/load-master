"use client";

import * as React from "react";
import type { Language } from "@/types";
import { getMessages, type Messages } from "@/lib/i18n/messages";

interface I18nContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  t: Messages;
}

const I18nContext = React.createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({
  language,
  setLanguage,
  children,
}: {
  language: Language;
  setLanguage: (l: Language) => void;
  children: React.ReactNode;
}) {
  const value = React.useMemo<I18nContextValue>(
    () => ({ language, setLanguage, t: getMessages(language) }),
    [language, setLanguage],
  );

  // Keep <html lang> in sync with the active UI language for screen
  // readers, browser translation hints and SEO. Done on the client to
  // avoid hydration mismatches with the server-rendered "en" default.
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
