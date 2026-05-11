import type { ClimateData } from "@/types";
import { DEFAULT_SOLAR_IRRADIANCE } from "./solar";

/**
 * Lightweight built-in climate presets. The user can edit any value or
 * pick "Custom" — this avoids depending on any paid weather API.
 */
export interface ClimatePreset {
  city: string;
  outdoorWinterDb: number; // °C
  outdoorSummerDb: number; // °C
  outdoorSummerRh: number; // %
  altitudeM: number;
}

export const CLIMATE_PRESETS: ClimatePreset[] = [
  { city: "Casablanca", outdoorWinterDb: 4, outdoorSummerDb: 33, outdoorSummerRh: 70, altitudeM: 50 },
  { city: "Rabat", outdoorWinterDb: 3, outdoorSummerDb: 32, outdoorSummerRh: 75, altitudeM: 75 },
  { city: "Marrakech", outdoorWinterDb: 0, outdoorSummerDb: 42, outdoorSummerRh: 35, altitudeM: 466 },
  { city: "Paris", outdoorWinterDb: -7, outdoorSummerDb: 32, outdoorSummerRh: 50, altitudeM: 35 },
  { city: "London", outdoorWinterDb: -3, outdoorSummerDb: 28, outdoorSummerRh: 60, altitudeM: 11 },
  { city: "Madrid", outdoorWinterDb: -3, outdoorSummerDb: 36, outdoorSummerRh: 35, altitudeM: 657 },
  { city: "Berlin", outdoorWinterDb: -12, outdoorSummerDb: 30, outdoorSummerRh: 55, altitudeM: 34 },
  { city: "New York", outdoorWinterDb: -10, outdoorSummerDb: 32, outdoorSummerRh: 55, altitudeM: 10 },
  { city: "Dubai", outdoorWinterDb: 12, outdoorSummerDb: 45, outdoorSummerRh: 60, altitudeM: 5 },
  { city: "Cairo", outdoorWinterDb: 6, outdoorSummerDb: 38, outdoorSummerRh: 50, altitudeM: 23 },
];

export function climateFromPreset(preset: ClimatePreset): ClimateData {
  return {
    city: preset.city,
    outdoorWinterDb: preset.outdoorWinterDb,
    outdoorSummerDb: preset.outdoorSummerDb,
    outdoorSummerRh: preset.outdoorSummerRh,
    indoorWinterDb: 20,
    indoorSummerDb: 26,
    indoorSummerRh: 50,
    altitudeM: preset.altitudeM,
    solarIrradiance: { ...DEFAULT_SOLAR_IRRADIANCE },
  };
}

export const DEFAULT_CLIMATE: ClimateData = climateFromPreset(CLIMATE_PRESETS[0]!);
