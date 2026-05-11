"use client";

import * as React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { I18nProvider } from "./I18nProvider";
import { useSettingsStore } from "@/features/projects/settings";
import { useProjectsStore } from "@/features/projects/store";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";

export function Providers({ children }: { children: React.ReactNode }) {
  const { settings, load, update } = useSettingsStore();
  const loadProjects = useProjectsStore((s) => s.load);

  React.useEffect(() => {
    void load();
    void loadProjects();
  }, [load, loadProjects]);

  return (
    <ThemeProvider theme={settings.theme} setTheme={(t) => void update({ theme: t })}>
      <I18nProvider
        language={settings.language}
        setLanguage={(l) => void update({ language: l })}
      >
        <ServiceWorkerRegister />
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
