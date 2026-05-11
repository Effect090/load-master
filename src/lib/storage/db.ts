"use client";

import type { AppSettings, Project } from "@/types";
import { openDB, type IDBPDatabase } from "idb";
import { validateProject } from "@/lib/projects/io";

const DB_NAME = "load-master";
const DB_VERSION = 1;
const PROJECTS_STORE = "projects";
const SETTINGS_STORE = "settings";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB only available in browser."));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
          db.createObjectStore(PROJECTS_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE);
        }
      },
    });
  }
  return dbPromise;
}

// ── Projects ─────────────────────────────────────────────────────────────

export async function listProjects(): Promise<Project[]> {
  const db = await getDB();
  const all = (await db.getAll(PROJECTS_STORE)) as unknown[];
  const valid: Project[] = [];
  for (const row of all) {
    const v = validateProject(row);
    if (v.ok && v.project) valid.push(v.project);
    else if (process.env.NODE_ENV !== "production") {
      console.warn("[load-master] skipping invalid stored project:", v.error);
    }
  }
  return valid.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await getDB();
  const row = (await db.get(PROJECTS_STORE, id)) as unknown;
  if (row == null) return undefined;
  const v = validateProject(row);
  return v.ok ? v.project : undefined;
}

export async function saveProject(project: Project): Promise<void> {
  const v = validateProject(project);
  if (!v.ok || !v.project) {
    throw new Error(`Refusing to save invalid project: ${v.error}`);
  }
  const db = await getDB();
  await db.put(PROJECTS_STORE, v.project);
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(PROJECTS_STORE, id);
}

// ── Settings ─────────────────────────────────────────────────────────────

const SETTINGS_KEY = "app";

export async function loadSettings(): Promise<AppSettings | undefined> {
  const db = await getDB();
  return (await db.get(SETTINGS_STORE, SETTINGS_KEY)) as AppSettings | undefined;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put(SETTINGS_STORE, settings, SETTINGS_KEY);
}
