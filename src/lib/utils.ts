import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Generate a short, URL-safe unique id. */
export function uid(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36).slice(-4)
  );
}

/** Round to N decimals while keeping a number type. */
export function round(value: number, decimals = 0): number {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

/** Format a power value: < 1000 W shown as W, otherwise kW. */
export function formatPower(w: number, decimals = 1): string {
  if (!Number.isFinite(w)) return "—";
  if (Math.abs(w) >= 1000) return `${(w / 1000).toFixed(decimals)} kW`;
  return `${Math.round(w)} W`;
}

export function formatNumber(n: number, decimals = 1): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatArea(m2: number): string {
  return `${formatNumber(m2, 1)} m²`;
}

export function formatTemp(c: number): string {
  return `${formatNumber(c, 1)} °C`;
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

/** URL-safe slug from an arbitrary string (≤60 chars, fallback for empty results). */
export function slug(s: string, fallback = "project"): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || fallback
  );
}
