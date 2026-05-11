import type { Orientation } from "@/types";

/**
 * Default peak design solar irradiance per orientation (W/m²).
 *
 * These are simplified, climate-agnostic engineering presets meant for
 * preliminary cooling-load estimates at mid-latitudes during summer at
 * solar-noon-equivalent peak. Users SHOULD edit them to match their site.
 *
 * Source: simplified ASHRAE-style peak transmitted-radiation envelope
 * commonly used in textbook preliminary calculations. Re-stated from
 * publicly available engineering material — not a regulated table.
 */
export const DEFAULT_SOLAR_IRRADIANCE: Record<Orientation, number> = {
  N: 100,
  NE: 250,
  E: 500,
  SE: 450,
  S: 350,
  SW: 500,
  W: 600,
  NW: 350,
  horizontal: 800,
};
