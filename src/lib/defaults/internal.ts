import type { OccupancyType } from "@/types";

/**
 * Default sensible/latent heat per occupant (W) by activity level.
 * Values are pragmatic engineering averages; users can override per-zone.
 */
export const OCCUPANCY_PRESETS: Record<
  OccupancyType,
  { sensibleW: number; latentW: number; label: string }
> = {
  residential_sedentary: { sensibleW: 75, latentW: 55, label: "Residential / sedentary" },
  office_seated: { sensibleW: 75, latentW: 55, label: "Office / seated" },
  classroom: { sensibleW: 75, latentW: 60, label: "Classroom" },
  retail_standing: { sensibleW: 75, latentW: 70, label: "Retail / standing" },
  restaurant: { sensibleW: 80, latentW: 80, label: "Restaurant / dining" },
  light_work: { sensibleW: 80, latentW: 100, label: "Light bench work" },
  moderate_work: { sensibleW: 95, latentW: 175, label: "Moderate work" },
  heavy_work: { sensibleW: 130, latentW: 270, label: "Heavy work / gym" },
  custom: { sensibleW: 75, latentW: 55, label: "Custom" },
};

/** Default lighting power density W/m² by space type. */
export const DEFAULT_LIGHTING_W_PER_M2: Record<string, number> = {
  apartment: 6,
  house: 5,
  office: 9,
  classroom: 10,
  shop: 14,
  custom: 8,
};

/** Default equipment power density W/m². */
export const DEFAULT_EQUIPMENT_W_PER_M2: Record<string, number> = {
  apartment: 4,
  house: 3,
  office: 12,
  classroom: 8,
  shop: 10,
  custom: 6,
};

/**
 * Default ventilation airflow per person, m³/h.
 * Common rule-of-thumb baseline; can be edited.
 */
export const DEFAULT_VENT_M3H_PER_PERSON: Record<string, number> = {
  apartment: 25,
  house: 25,
  office: 30,
  classroom: 25,
  shop: 30,
  custom: 25,
};

/** Default ACH for infiltration by building tightness. */
export const DEFAULT_ACH: Record<string, number> = {
  leaky: 1.2,
  average: 0.6,
  tight: 0.3,
  passive: 0.1,
};
