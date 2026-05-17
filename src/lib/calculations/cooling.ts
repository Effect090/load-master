import type {
  ClimateData,
  EnvelopeElement,
  FormulaTrace,
  Zone,
} from "@/types";
import {
  LATENT_AIR_COEFF,
  SENSIBLE_AIR_COEFF,
  atmosphericPressure,
  humidityRatioGPerKg,
} from "./psychrometrics";
import { computeInfiltrationFlow } from "./heating";

/**
 * Conduction cooling load through an envelope element.
 *   Q = (U × A + ψL) × ΔT_c
 *
 * Returns 0 if the boundary is cooler than the indoor set-point.
 */
export function envelopeCoolingConductionW(
  el: EnvelopeElement,
  climate: ClimateData,
): {
  w: number;
  transmissionW: number;
  thermalBridgeW: number;
  deltaT: number;
  trace: FormulaTrace;
} {
  const { indoorSummerDb, outdoorSummerDb } = climate;

  let boundaryTemp: number;
  switch (el.boundary) {
    case "outside":
      boundaryTemp = outdoorSummerDb;
      break;
    case "ground":
      boundaryTemp =
        el.adjacentTemperatureSummer ?? (indoorSummerDb + outdoorSummerDb) / 2;
      break;
    case "unconditioned":
      boundaryTemp =
        el.adjacentTemperatureSummer ?? (indoorSummerDb + outdoorSummerDb) / 2;
      break;
    case "adjacent_conditioned":
      boundaryTemp = el.adjacentTemperatureSummer ?? indoorSummerDb;
      break;
  }

  const dT = boundaryTemp - indoorSummerDb;
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
      label: `Cooling conduction — ${el.name}`,
      formula: "Q = (U × A + ψL) × ΔT_c",
      expression: `Q = (${el.uValue} × ${el.area} + ${tbOnly}) × ${dT.toFixed(1)}`,
      inputs: {
        "U (W/m²K)": el.uValue,
        "A (m²)": el.area,
        "ψL (W/K)": tbOnly,
        "boundary": el.boundary,
        "T_boundary (°C)": boundaryTemp,
        "T_indoor (°C)": indoorSummerDb,
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
 * Solar heat gain through a window element only.
 *   Q_solar = A_glass × SHGC × I_orientation × shading_factor
 *
 * A_glass = glassArea if provided, else full element area.
 * Solar is never applied to opaque elements.
 */
export function envelopeCoolingSolarW(
  el: EnvelopeElement,
  climate: ClimateData,
): { w: number; trace: FormulaTrace } {
  if (el.type !== "window") {
    return {
      w: 0,
      trace: {
        label: `Solar gain — ${el.name}`,
        formula: "n/a (not a window)",
        inputs: {},
        resultW: 0,
      },
    };
  }
  const A = Math.max(0, el.glassArea ?? el.area);
  const shgc = clamp01(el.shgc ?? 0);
  const shading = clamp01(el.shadingFactor ?? 1);
  const I = climate.solarIrradiance[el.orientation] ?? 0;
  const w = A * shgc * I * shading;

  return {
    w,
    trace: {
      label: `Solar gain — ${el.name}`,
      formula: "Q = A_glass × SHGC × I × shading",
      expression: `Q = ${A} × ${shgc} × ${I} × ${shading}`,
      inputs: {
        "A_glass (m²)": A,
        "total area (m²)": el.area,
        "SHGC": shgc,
        "I (W/m²)": I,
        "orientation": el.orientation,
        "shading factor": shading,
      },
      resultW: w,
    },
  };
}

/**
 * Sensible & latent cooling loads from ventilation + infiltration.
 *
 *   Q_vent_sens  = 0.335 × ventFlow × (1 − HR_sens) × ΔT_c
 *   Q_vent_lat   = 0.83  × ventFlow × (1 − HR_lat)  × Δw
 *   Q_infil_sens = 0.335 × infiltFlow × ΔT_c               (no HR)
 *   Q_infil_lat  = 0.83  × infiltFlow × Δw                 (no HR)
 *
 * Δw = max(0, w_outdoor − w_indoor) [g/kg dry air] — latent can never be negative.
 * deltaWRaw is exposed so the caller can warn when indoor is more humid than outdoor.
 */
export function airCoolingLoads(
  zone: Zone,
  climate: ClimateData,
): {
  ventilationSensibleW: number;
  ventilationLatentW: number;
  infiltrationSensibleW: number;
  infiltrationLatentW: number;
  ventilationFlow: number;
  infiltrationFlow: number;
  deltaT: number;
  deltaWGPerKg: number;
  deltaWRawGPerKg: number;
  ventSensibleTrace: FormulaTrace;
  ventLatentTrace: FormulaTrace;
  infilSensibleTrace: FormulaTrace;
  infilLatentTrace: FormulaTrace;
} {
  const dT = climate.outdoorSummerDb - climate.indoorSummerDb;
  const p = atmosphericPressure(climate.altitudeM ?? 0);
  const wOut = humidityRatioGPerKg(climate.outdoorSummerDb, climate.outdoorSummerRh, p);
  const wIn = humidityRatioGPerKg(climate.indoorSummerDb, climate.indoorSummerRh, p);
  const deltaWRaw = wOut - wIn;
  const dW = Math.max(0, deltaWRaw); // latent load is never negative

  const v = zone.ventilation;
  const hrSens = clamp01(v.heatRecoverySensible ?? 0);
  const hrLat = clamp01(v.heatRecoveryLatent ?? 0);
  const ventFlow = Math.max(0, v.ventilationAirflowM3h);
  const infFlow = computeInfiltrationFlow(zone.volume, v);
  const effVentSens = ventFlow * (1 - hrSens);
  const effVentLat = ventFlow * (1 - hrLat);

  const ventilationSensibleW = Math.max(0, SENSIBLE_AIR_COEFF * effVentSens * dT);
  const ventilationLatentW = Math.max(0, LATENT_AIR_COEFF * effVentLat * dW);
  const infiltrationSensibleW = Math.max(0, SENSIBLE_AIR_COEFF * infFlow * dT);
  const infiltrationLatentW = Math.max(0, LATENT_AIR_COEFF * infFlow * dW);

  return {
    ventilationSensibleW,
    ventilationLatentW,
    infiltrationSensibleW,
    infiltrationLatentW,
    ventilationFlow: ventFlow,
    infiltrationFlow: infFlow,
    deltaT: dT,
    deltaWGPerKg: dW,
    deltaWRawGPerKg: deltaWRaw,
    ventSensibleTrace: {
      label: "Ventilation — cooling sensible",
      formula: "Q = 0.335 × airflow × (1 − HR_sens) × ΔT_c",
      expression: `Q = 0.335 × ${ventFlow} × (1 − ${hrSens}) × ${dT.toFixed(1)}`,
      inputs: {
        "airflow (m³/h)": ventFlow,
        "HR_sensible": hrSens,
        "effective flow (m³/h)": parseFloat(effVentSens.toFixed(2)),
        "ΔT_c (K)": parseFloat(dT.toFixed(2)),
      },
      resultW: ventilationSensibleW,
    },
    ventLatentTrace: {
      label: "Ventilation — cooling latent",
      formula: "Q = 0.83 × airflow × (1 − HR_lat) × Δw",
      expression: `Q = 0.83 × ${ventFlow} × (1 − ${hrLat}) × ${dW.toFixed(3)}`,
      inputs: {
        "airflow (m³/h)": ventFlow,
        "HR_latent": hrLat,
        "effective flow (m³/h)": parseFloat(effVentLat.toFixed(2)),
        "Δw (g/kg)": parseFloat(dW.toFixed(3)),
        "w_outdoor (g/kg)": parseFloat(wOut.toFixed(3)),
        "w_indoor (g/kg)": parseFloat(wIn.toFixed(3)),
      },
      resultW: ventilationLatentW,
    },
    infilSensibleTrace: {
      label: "Infiltration — cooling sensible",
      formula: "Q = 0.335 × infil_flow × ΔT_c  (no HR on infiltration)",
      expression: `Q = 0.335 × ${infFlow.toFixed(2)} × ${dT.toFixed(1)}`,
      inputs: {
        "infil flow (m³/h)": parseFloat(infFlow.toFixed(2)),
        "method": v.infiltrationMethod,
        "ΔT_c (K)": parseFloat(dT.toFixed(2)),
      },
      resultW: infiltrationSensibleW,
    },
    infilLatentTrace: {
      label: "Infiltration — cooling latent",
      formula: "Q = 0.83 × infil_flow × Δw  (no HR on infiltration)",
      expression: `Q = 0.83 × ${infFlow.toFixed(2)} × ${dW.toFixed(3)}`,
      inputs: {
        "infil flow (m³/h)": parseFloat(infFlow.toFixed(2)),
        "Δw (g/kg)": parseFloat(dW.toFixed(3)),
      },
      resultW: infiltrationLatentW,
    },
  };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
