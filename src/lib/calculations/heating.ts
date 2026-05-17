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
 * Boundary temperature:
 *   outside              → indoorWinter − outdoorWinter
 *   ground / unconditioned → indoorWinter − adjacentWinter (or midpoint)
 *   adjacent_conditioned → 0 unless user overrides adjacent temp
 *
 * Returns 0 if the boundary is warmer than the indoor set-point.
 */
export function envelopeHeatingW(
  el: EnvelopeElement,
  climate: ClimateData,
): {
  w: number;
  transmissionW: number;
  thermalBridgeW: number;
  deltaT: number;
  trace: FormulaTrace;
} {
  const { indoorWinterDb, outdoorWinterDb } = climate;

  let boundaryTemp: number;
  switch (el.boundary) {
    case "outside":
      boundaryTemp = outdoorWinterDb;
      break;
    case "ground":
      boundaryTemp =
        el.adjacentTemperatureWinter ?? (indoorWinterDb + outdoorWinterDb) / 2;
      break;
    case "unconditioned":
      boundaryTemp =
        el.adjacentTemperatureWinter ?? (indoorWinterDb + outdoorWinterDb) / 2;
      break;
    case "adjacent_conditioned":
      // Zero load unless the user explicitly overrides the adjacent temperature.
      boundaryTemp = el.adjacentTemperatureWinter ?? indoorWinterDb;
      break;
  }

  const dT = indoorWinterDb - boundaryTemp;
  const uaOnly = el.uValue * el.area;
  const tbOnly = el.thermalBridgeWPerK ?? 0;
  const transmissionW = Math.max(0, uaOnly * dT);
  const thermalBridgeW = Math.max(0, tbOnly * dT);
  const w = Math.max(0, (uaOnly + tbOnly) * dT);

  return {
    w,
    transmissionW,
    thermalBridgeW,
    deltaT: dT,
    trace: {
      label: `Heating — ${el.name}`,
      formula: "Q = (U × A + ψL) × ΔT",
      expression: `Q = (${el.uValue} × ${el.area} + ${tbOnly}) × ${dT.toFixed(1)}`,
      inputs: {
        "U (W/m²K)": el.uValue,
        "A (m²)": el.area,
        "ψL (W/K)": tbOnly,
        "boundary": el.boundary,
        "T_indoor (°C)": indoorWinterDb,
        "T_boundary (°C)": boundaryTemp,
        "ΔT (K)": parseFloat(dT.toFixed(2)),
        "U·A (W/K)": parseFloat(uaOnly.toFixed(3)),
        "transmission W": parseFloat(transmissionW.toFixed(1)),
        "thermal bridge W": parseFloat(thermalBridgeW.toFixed(1)),
      },
      resultW: w,
    },
  };
}

/**
 * Heating ventilation/infiltration sensible loads.
 *
 *   Q_vent  = K_s × ventilationFlow × (1 − ε_HR_sens) × ΔT
 *   Q_infil = K_s × infiltrationFlow × ΔT      (no heat recovery on infiltration)
 *
 * K_s = 0.335 W·h/(m³·K)
 */
export function airHeatingLoads(
  zone: Zone,
  climate: ClimateData,
): {
  ventilationW: number;
  infiltrationW: number;
  ventilationFlow: number;
  infiltrationFlow: number;
  ventTrace: FormulaTrace;
  infilTrace: FormulaTrace;
} {
  const dT = climate.indoorWinterDb - climate.outdoorWinterDb;
  const v = zone.ventilation;
  const hrSens = clamp01(v.heatRecoverySensible ?? 0);
  const ventFlow = Math.max(0, v.ventilationAirflowM3h);
  const infFlow = computeInfiltrationFlow(zone.volume, v);
  const effectiveVentFlow = ventFlow * (1 - hrSens);

  const ventilationW = Math.max(0, SENSIBLE_AIR_COEFF * effectiveVentFlow * dT);
  const infiltrationW = Math.max(0, SENSIBLE_AIR_COEFF * infFlow * dT);

  return {
    ventilationFlow: ventFlow,
    infiltrationFlow: infFlow,
    ventilationW,
    infiltrationW,
    ventTrace: {
      label: "Ventilation — heating sensible",
      formula: "Q = 0.335 × airflow × (1 − HR_sens) × ΔT",
      expression: `Q = 0.335 × ${ventFlow} × (1 − ${hrSens}) × ${dT.toFixed(1)}`,
      inputs: {
        "airflow (m³/h)": ventFlow,
        "HR_sensible": hrSens,
        "effective flow (m³/h)": parseFloat(effectiveVentFlow.toFixed(2)),
        "ΔT_h (K)": parseFloat(dT.toFixed(2)),
      },
      resultW: ventilationW,
    },
    infilTrace: {
      label: "Infiltration — heating sensible",
      formula: "Q = 0.335 × infil_flow × ΔT  (no heat recovery on infiltration)",
      expression: `Q = 0.335 × ${infFlow.toFixed(2)} × ${dT.toFixed(1)}`,
      inputs: {
        "infil flow (m³/h)": parseFloat(infFlow.toFixed(2)),
        "method": v.infiltrationMethod,
        "ΔT_h (K)": parseFloat(dT.toFixed(2)),
      },
      resultW: infiltrationW,
    },
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
