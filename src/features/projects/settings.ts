"use client";

import { create } from "zustand";
import type { AppSettings } from "@/types";
import { loadSettings, saveSettings } from "@/lib/storage/db";

const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  theme: "system",
  defaultIndoorWinter: 20,
  defaultIndoorSummer: 26,
  defaultIndoorRh: 50,
  defaultSafetyMargin: 0.1,
  defaultDiversity: 1,
};

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  load: () => Promise<void>;
  update: (patch: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  async load() {
    if (typeof window === "undefined") return;
    try {
      const s = await loadSettings();
      set({ settings: s ?? DEFAULT_SETTINGS, loaded: true });
    } catch {
      set({ settings: DEFAULT_SETTINGS, loaded: true });
    }
  },
  async update(patch) {
    const next = { ...get().settings, ...patch };
    set({ settings: next });
    try {
      await saveSettings(next);
    } catch {
      // ignore — IndexedDB may not exist (SSR / private mode); UI state still updates.
    }
  },
}));

export { DEFAULT_SETTINGS };
