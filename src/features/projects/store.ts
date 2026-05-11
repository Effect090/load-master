"use client";

import { create } from "zustand";
import type { Project } from "@/types";
import {
  deleteProject as dbDelete,
  getProject as dbGet,
  listProjects as dbList,
  saveProject as dbSave,
} from "@/lib/storage/db";
import { withUpdatedTimestamp } from "./factory";

interface ProjectsState {
  projects: Project[];
  loaded: boolean;
  load: () => Promise<void>;
  upsert: (p: Project) => Promise<void>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => Promise<Project | undefined>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  loaded: false,

  async load() {
    if (typeof window === "undefined") return;
    const projects = await dbList();
    set({ projects, loaded: true });
  },

  async upsert(p) {
    const updated = withUpdatedTimestamp(p);
    await dbSave(updated);
    set((state) => {
      const idx = state.projects.findIndex((x) => x.id === updated.id);
      const next =
        idx === -1
          ? [updated, ...state.projects]
          : state.projects.map((x, i) => (i === idx ? updated : x));
      next.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      return { projects: next, loaded: true };
    });
  },

  async remove(id) {
    await dbDelete(id);
    set({
      projects: get().projects.filter((p) => p.id !== id),
    });
  },

  async get(id) {
    const inMemory = get().projects.find((p) => p.id === id);
    if (inMemory) return inMemory;
    return dbGet(id);
  },
}));
