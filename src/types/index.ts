/**
 * Load Master — Core type definitions.
 *
 * All numeric values are in SI units unless explicitly stated:
 *   area    : m²
 *   volume  : m³
 *   length  : m
 *   temp    : °C
 *   power   : W (kW shown only at the UI layer)
 *   airflow : m³/h
 *   humidity ratio: g/kg dry air
 *   U-value : W/(m²·K)
 *   irradiance: W/m²
 */

export type Orientation =
  | "N"
  | "NE"
  | "E"
  | "SE"
  | "S"
  | "SW"
  | "W"
  | "NW"
  | "horizontal";

export type EnvelopeType =
  | "wall"
  | "roof"
  | "floor"
  | "window"
  | "door";

export type BoundaryCondition =
  | "outside"
  | "ground"
  | "unconditioned"
  | "adjacent_conditioned";

export type BuildingType =
  | "apartment"
  | "office"
  | "house"
  | "shop"
  | "classroom"
  | "custom";

export type OccupancyType =
  | "residential_sedentary"
  | "office_seated"
  | "classroom"
  | "retail_standing"
  | "restaurant"
  | "light_work"
  | "moderate_work"
  | "heavy_work"
  | "custom";

export type InfiltrationMethod = "ach" | "airflow";

export interface EnvelopeElement {
  id: string;
  name: string;
  type: EnvelopeType;
  area: number; // m²
  uValue: number; // W/(m²·K)
  orientation: Orientation;
  boundary: BoundaryCondition;
  /** Effective temperature of the boundary, only used when boundary !== "outside". */
  adjacentTemperatureWinter?: number; // °C
  adjacentTemperatureSummer?: number; // °C
  // Window-specific:
  shadingFactor?: number; // 0..1 — fraction of solar that PASSES through shading
  shgc?: number; // 0..1
  glassArea?: number; // m² (defaults to area if omitted)
  // Optional thermal-bridge linear coefficient * length, expressed as ΔU equivalent (W/K).
  thermalBridgeWPerK?: number;
}

export interface InternalGains {
  occupancyType: OccupancyType;
  peopleCount: number;
  /** Sensible heat per person in W. If undefined, taken from preset. */
  peopleSensibleW?: number;
  /** Latent heat per person in W. If undefined, taken from preset. */
  peopleLatentW?: number;
  /** Lighting power density W/m². If lightingTotalW is provided, that takes precedence. */
  lightingWPerM2?: number;
  lightingTotalW?: number;
  /** Equipment total power (W). */
  equipmentW: number;
  /** Diversity / use-factor 0..1 applied to internal gains for cooling (default 1). */
  diversity?: number;
}

export interface VentilationData {
  /** Mechanical ventilation airflow in m³/h. */
  ventilationAirflowM3h: number;
  infiltrationMethod: InfiltrationMethod;
  /** Air changes per hour (used when infiltrationMethod = "ach"). */
  infiltrationAch?: number;
  /** Direct infiltration airflow in m³/h (used when infiltrationMethod = "airflow"). */
  infiltrationAirflowM3h?: number;
  /** Heat-recovery sensible efficiency 0..1 (default 0). */
  heatRecoverySensible?: number;
  /** Heat-recovery latent efficiency 0..1 (default 0). */
  heatRecoveryLatent?: number;
}

export interface Zone {
  id: string;
  name: string;
  floorArea: number; // m²
  height: number; // m
  /** Volume in m³ — usually floorArea × height (computed in UI). */
  volume: number;
  internalGains: InternalGains;
  ventilation: VentilationData;
  envelope: EnvelopeElement[];
  notes?: string;
}

export interface ClimateData {
  city: string;
  /** Outdoor winter design dry-bulb temperature (°C). */
  outdoorWinterDb: number;
  /** Outdoor summer design dry-bulb temperature (°C). */
  outdoorSummerDb: number;
  /** Outdoor design relative humidity in summer (%). */
  outdoorSummerRh: number;
  /** Indoor heating set-point (°C). */
  indoorWinterDb: number;
  /** Indoor cooling set-point (°C). */
  indoorSummerDb: number;
  /** Indoor design relative humidity in summer (%). */
  indoorSummerRh: number;
  altitudeM?: number; // m, optional
  /** Solar irradiance per orientation in W/m² (peak design value). */
  solarIrradiance: Record<Orientation, number>;
}

export interface Project {
  id: string;
  name: string;
  buildingType: BuildingType;
  climate: ClimateData;
  /** Safety margin applied to recommended capacities, fraction (0.10 = +10%). */
  safetyMargin: number;
  /** Diversity factor across zones for project total (0..1, default 1). */
  diversityFactor: number;
  zones: Zone[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
  notes?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Calculation result types
// ────────────────────────────────────────────────────────────────────────────

export interface FormulaTrace {
  label: string;
  /** Symbolic formula, e.g. "Q = 0.335 × airflow × ΔT × (1 − HR)" */
  formula: string;
  /** Formula with actual values substituted, e.g. "Q = 0.335 × 35 × 24 × 0.30" */
  expression?: string;
  inputs: Record<string, number | string>;
  resultW: number;
}

export interface EnvelopeElementResult {
  id: string;
  name: string;
  type: EnvelopeType;
  /** Combined (U·A + ψL) × ΔT_h */
  heatingW: number;
  /** U·A × ΔT_h only */
  heatingTransmissionW: number;
  /** ψL × ΔT_h */
  heatingThermalBridgeW: number;
  heatingDeltaTK: number;
  /** Combined (U·A + ψL) × ΔT_c */
  coolingConductionW: number;
  /** U·A × ΔT_c only */
  coolingTransmissionW: number;
  /** ψL × ΔT_c */
  coolingThermalBridgeW: number;
  coolingDeltaTK: number;
  coolingSolarW: number; // 0 unless window
  trace: FormulaTrace[];
}

/** Psychrometric state derived from climate + altitude. */
export interface PsychrometricSummary {
  pressurePa: number;
  wIndoorGPerKg: number;
  wOutdoorGPerKg: number;
  /** max(0, wOutdoor − wIndoor) — used for latent loads. */
  deltaWGPerKg: number;
  /** wOutdoor − wIndoor before clamping (negative = indoor more humid). */
  deltaWRawGPerKg: number;
}

/** Detailed air-load breakdown including formula traces. */
export interface AirLoadsDetail {
  ventilationFlowM3h: number;
  infiltrationFlowM3h: number;
  heatingDeltaTK: number;
  coolingDeltaTK: number;
  heatRecoverySensible: number;
  heatRecoveryLatent: number;
  heatingVentTrace: FormulaTrace;
  heatingInfilTrace: FormulaTrace;
  coolingVentSensibleTrace: FormulaTrace;
  coolingVentLatentTrace: FormulaTrace;
  coolingInfilSensibleTrace: FormulaTrace;
  coolingInfilLatentTrace: FormulaTrace;
}

/** Detailed internal-gains breakdown. */
export interface InternalGainsDetail {
  occupancyLabel: string;
  peopleCount: number;
  peopleSensibleWPerPerson: number;
  peopleLatentWPerPerson: number;
  peopleSensibleW: number;
  peopleLatentW: number;
  lightingMethodLabel: string;
  lightingInputValue: number;
  lightingW: number;
  equipmentW: number;
  diversity: number;
  traces: FormulaTrace[];
}

export interface ZoneResult {
  zoneId: string;
  zoneName: string;
  floorArea: number;

  // Heating
  heatingTransmissionW: number;
  heatingVentilationW: number;
  heatingInfiltrationW: number;
  totalHeatingW: number;

  // Cooling — sensible
  coolingConductionW: number;
  coolingSolarW: number;
  coolingVentilationSensibleW: number;
  coolingInfiltrationSensibleW: number;
  peopleSensibleW: number;
  lightingW: number;
  equipmentW: number;
  totalSensibleCoolingW: number;

  // Cooling — latent
  coolingVentilationLatentW: number;
  coolingInfiltrationLatentW: number;
  peopleLatentW: number;
  totalLatentCoolingW: number;

  totalCoolingW: number;

  /** Raw total × (1 + safetyMargin) — no diversity applied. */
  recommendedHeatingW: number;
  recommendedCoolingW: number;

  heatingPerM2: number; // W/m²
  coolingPerM2: number; // W/m²

  envelopeBreakdown: EnvelopeElementResult[];
  psychrometrics: PsychrometricSummary;
  airLoadsDetail: AirLoadsDetail;
  internalGainsDetail: InternalGainsDetail;
  warnings: string[];
}

export interface ProjectResult {
  projectId: string;
  zones: ZoneResult[];
  totalHeatingW: number;
  totalCoolingW: number;
  totalSensibleW: number;
  totalLatentW: number;
  /** Σ zone totals × (1 + safety) — no diversity. */
  rawRecommendedHeatingW: number;
  rawRecommendedCoolingW: number;
  /** Σ zone totals × diversity × (1 + safety). */
  recommendedHeatingW: number;
  recommendedCoolingW: number;
  totalArea: number;
  heatingPerM2: number;
  coolingPerM2: number;
  largestHeatingZones: { zoneId: string; zoneName: string; w: number }[];
  largestCoolingZones: { zoneId: string; zoneName: string; w: number }[];
  warnings: string[];
}

// ────────────────────────────────────────────────────────────────────────────
// Settings
// ────────────────────────────────────────────────────────────────────────────

export type Language = "en" | "fr";
export type Theme = "light" | "dark" | "system";

export interface AppSettings {
  language: Language;
  theme: Theme;
  defaultIndoorWinter: number;
  defaultIndoorSummer: number;
  defaultIndoorRh: number;
  defaultSafetyMargin: number; // fraction
  defaultDiversity: number; // fraction
}
