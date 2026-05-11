/**
 * Psychrometric helpers — simplified but transparent and well-documented.
 *
 * All functions use SI units. Pressure is in Pa, temperature in °C,
 * humidity ratio in kg water / kg dry air (multiply by 1000 for g/kg).
 *
 * Reference equations are textbook public-domain formulations (ASHRAE
 * Handbook style and Magnus equation). They are simplified and intended
 * for preliminary engineering estimates.
 */

const STANDARD_PRESSURE_PA = 101_325;

/**
 * Atmospheric pressure as a function of altitude (m).
 * Simplified barometric formula valid in the troposphere.
 *   p = p0 × (1 - 2.25577e-5 × z)^5.2559
 */
export function atmosphericPressure(altitudeM = 0): number {
  if (altitudeM <= 0) return STANDARD_PRESSURE_PA;
  return STANDARD_PRESSURE_PA * Math.pow(1 - 2.25577e-5 * altitudeM, 5.2559);
}

/**
 * Saturation vapor pressure (Pa) from dry-bulb temperature (°C),
 * Magnus / August-Roche-Magnus form:
 *   p_ws(T) = 610.94 × exp( 17.625 × T / (T + 243.04) )
 *
 * The Magnus form has a singularity at T = -243.04 °C (denominator → 0).
 * For temperatures at or below the practical HVAC range we clamp to a
 * safe lower bound so callers never see NaN/Infinity propagate into the
 * heat-load calculations.
 */
export function saturationVaporPressure(tempC: number): number {
  if (!Number.isFinite(tempC)) return 0;
  const t = Math.max(tempC, -60); // guards against the Magnus singularity
  return 610.94 * Math.exp((17.625 * t) / (t + 243.04));
}

/**
 * Humidity ratio (kg/kg dry air) from dry-bulb T (°C), RH (%) and pressure (Pa).
 *   p_w  = (RH/100) × p_ws(T)
 *   W    = 0.62198 × p_w / (p - p_w)
 *
 * Inputs are clamped to physical ranges (RH 0..100, pressure > 0) so that
 * malformed user input cannot produce NaN/Infinity loads downstream.
 */
export function humidityRatio(
  tempC: number,
  relativeHumidityPct: number,
  pressurePa: number = STANDARD_PRESSURE_PA,
): number {
  if (!Number.isFinite(tempC)) return 0;
  const rh = clamp(relativeHumidityPct, 0, 100);
  const p = pressurePa > 0 ? pressurePa : STANDARD_PRESSURE_PA;
  const pws = saturationVaporPressure(tempC);
  const pw = (rh / 100) * pws;
  if (pw >= p) return 0; // supersaturated / non-physical → treat as 0
  return (0.62198 * pw) / (p - pw);
}

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

/** Convenience: humidity ratio expressed in g water / kg dry air. */
export function humidityRatioGPerKg(
  tempC: number,
  relativeHumidityPct: number,
  pressurePa: number = STANDARD_PRESSURE_PA,
): number {
  return humidityRatio(tempC, relativeHumidityPct, pressurePa) * 1000;
}

/**
 * Sensible-heat coefficient for ventilation/infiltration in
 *   Q_sensible (W) = K_s × airflow (m³/h) × ΔT (K)
 *
 * Derived from Q = ρ_air × c_p × V̇ × ΔT with
 *   ρ_air ≈ 1.2 kg/m³, c_p ≈ 1006 J/(kg·K), and converting m³/h → m³/s
 *   K_s = 1.2 × 1006 / 3600 ≈ 0.335
 */
export const SENSIBLE_AIR_COEFF = 0.335;

/**
 * Latent-heat coefficient for ventilation/infiltration in
 *   Q_latent (W) = K_l × airflow (m³/h) × Δw (g/kg)
 *
 * Derived from Q = ρ_air × h_fg × V̇ × Δw with
 *   h_fg ≈ 2_500_000 J/kg, ρ_air ≈ 1.2 kg/m³
 *   K_l = 1.2 × 2_500_000 / 3600 / 1000 ≈ 0.833
 */
export const LATENT_AIR_COEFF = 0.83;
