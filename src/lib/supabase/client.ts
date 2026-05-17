"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Add env vars to .env.local.");
  }
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
