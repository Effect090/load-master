"use client";

import * as React from "react";
import type { Theme } from "@/types";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(theme: Theme): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  let resolved: "light" | "dark";
  if (theme === "system") {
    resolved =
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  } else {
    resolved = theme;
  }
  if (resolved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  return resolved;
}

export function ThemeProvider({
  theme,
  setTheme,
  children,
}: {
  theme: Theme;
  setTheme: (t: Theme) => void;
  children: React.ReactNode;
}) {
  const [resolved, setResolved] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    setResolved(applyTheme(theme));
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(applyTheme("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
