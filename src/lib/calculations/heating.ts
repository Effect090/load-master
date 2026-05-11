import type {
  ClimateData,
  EnvelopeElement,
  FormulaTrace,
  VentilationData,
  Zone,
} from "@/types";
import { SENSIBLE_AIR_COEFF } from "./psychrometrics";

/**
 * Heating transmission load through a single envelope element.
 *   Q = (U × A + ψL) × ΔT     [W]
 *
 * ΔT is computed against the appropriate boundary temperature:
 *   - outside              → indoorWinter − outdoorWinter
 *   - ground               → indoorWinter − (avg of indoor & outdoor)/2 (heuristic)
 *   - unconditioned        → indoorWinter − adjacentTemperatureWinter (default = avg)
 *   - adjacent_conditioned → indoorWinter − adjacentTemperatureWinter (default = indoor)
 *
 * Returns 0 if the boundary is warmer than the indoor set-point.
 */
export function envelopeHeatingW(
  el: EnvelopeElement,
  climate: ClimateData,
): { w: number; trace: FormulaTrace } {
  const { indoorWinterDb, outdoorWinterDb } = climate;
  const ua = el.uValue * el.area + (el.thermalBridgeWPerK ?? 0);

  let boundaryTemp: number;
  switch (el.boundary) {
    case "outside":
      boundaryTemp = outdoorWinterDb;
      break;
    case "ground":
      // Crude assumption: ground stays at midpoint between indoor and outdoor
      boundaryTemp =
        el.adjacentTemperatureWinter ?? (indoorWinterDb + outdoorWinterDb) / 2;
      break;
    case "unconditioned":
      boundaryTemp =
        el.adjacentTemperatureWinter ?? (indoorWinterDb + outdoorWinterDb) / 2;
      break;
    case "adjacent_conditioned":
      boundaryTemp = el.adjacentTemperatureWinter ?? indoorWinterDb;
      break;
  }

  const dT = indoorWinterDb - boundaryTemp;
  const w = Math.max(0, ua * dT);

  return {
    w,
    trace: {
      label: `Heating transmission — ${el.name}`,
      formula: "Q = (U × A + ψ·L) × ΔT",
      inputs: {
        U: el.uValue,
        A: el.area,
        thermalBridgeWPerK: el.thermalBridgeWPerK ?? 0,
        boundary: el.boundary,
        indoorWinterDb,
        boundaryTemp,
        deltaT: dT,
      },
      resultW: w,
    },
  };
}

/**
 * Heating ventilation/infiltration sensible loads.
 *
 *   ventilation_airflow = ventilationAirflowM3h × (1 − ε_sensible_HR)
 *   infiltration_airflow = volume × ACH    OR    direct airflow
 *   Q_vent  = K_s × ventilation_airflow × ΔT
 *   Q_inf   = K_s × infiltration_airflow × ΔT
 *
 * with K_s = 0.335 W·h/(m³·K).
 */
export function airHeatingLoads(
  zone: Zone,
  climate: ClimateData,
): {
  ventilationW: number;
  infiltrationW: number;
  ventilationFlow: number;
  infiltrationFlow: number;
} {
  const dT = climate.indoorWinterDb - climate.outdoorWinterDb;
  const v = zone.ventilation;
  const hrSens = clamp01(v.heatRecoverySensible ?? 0);
  const ventFlow = Math.max(0, v.ventilationAirflowM3h) * (1 - hrSens);
  const infFlow = computeInfiltrationFlow(zone.volume, v);
  return {
    ventilationFlow: ventFlow,
    infiltrationFlow: infFlow,
    ventilationW: Math.max(0, SENSIBLE_AIR_COEFF * ventFlow * dT),
    infiltrationW: Math.max(0, SENSIBLE_AIR_COEFF * infFlow * dT),
  };
}

export function computeInfiltrationFlow(
  volumeM3: number,
  v: VentilationData,
): number {
  if (v.infiltrationMethod === "ach") {
    const ach = Math.max(0, v.infiltrationAch ?? 0);
    return volumeM3 * ach;
  }
  return Math.max(0, v.infiltrationAirflowM3h ?? 0);
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
