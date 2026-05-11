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
 *   Q = (U × A + ψ·L) × ΔT_c
 *
 * ΔT_c uses summer outdoor design temp by default. For windows we add
 * the solar gain separately via {@link envelopeCoolingSolarW}.
 */
export function envelopeCoolingConductionW(
  el: EnvelopeElement,
  climate: ClimateData,
): { w: number; trace: FormulaTrace } {
  const { indoorSummerDb, outdoorSummerDb } = climate;
  const ua = el.uValue * el.area + (el.thermalBridgeWPerK ?? 0);

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
  const w = Math.max(0, ua * dT);

  return {
    w,
    trace: {
      label: `Cooling conduction — ${el.name}`,
      formula: "Q = (U × A + ψ·L) × ΔT_c",
      inputs: {
        U: el.uValue,
        A: el.area,
        thermalBridgeWPerK: el.thermalBridgeWPerK ?? 0,
        indoorSummerDb,
        boundaryTemp,
        deltaT: dT,
      },
      resultW: w,
    },
  };
}

/**
 * Solar heat gain through a window or any element with SHGC and glassArea.
 *   Q_solar = A_glass × SHGC × I × shading_factor
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
      formula: "Q_solar = A_glass × SHGC × I × shading_factor",
      inputs: {
        glassArea: A,
        SHGC: shgc,
        irradiance: I,
        orientation: el.orientation,
        shadingFactor: shading,
      },
      resultW: w,
    },
  };
}

/**
 * Sensible & latent cooling loads from ventilation + infiltration.
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
  deltaW: number;
} {
  const dT = climate.outdoorSummerDb - climate.indoorSummerDb;
  const p = atmosphericPressure(climate.altitudeM ?? 0);
  const wOut = humidityRatioGPerKg(climate.outdoorSummerDb, climate.outdoorSummerRh, p);
  const wIn = humidityRatioGPerKg(climate.indoorSummerDb, climate.indoorSummerRh, p);
  const dW = wOut - wIn; // g/kg

  const v = zone.ventilation;
  const hrSens = clamp01(v.heatRecoverySensible ?? 0);
  const hrLat = clamp01(v.heatRecoveryLatent ?? 0);
  const ventFlow = Math.max(0, v.ventilationAirflowM3h);
  const infFlow = computeInfiltrationFlow(zone.volume, v);

  return {
    ventilationSensibleW: Math.max(
      0,
      SENSIBLE_AIR_COEFF * ventFlow * (1 - hrSens) * dT,
    ),
    ventilationLatentW: Math.max(
      0,
      LATENT_AIR_COEFF * ventFlow * (1 - hrLat) * dW,
    ),
    infiltrationSensibleW: Math.max(0, SENSIBLE_AIR_COEFF * infFlow * dT),
    infiltrationLatentW: Math.max(0, LATENT_AIR_COEFF * infFlow * dW),
    ventilationFlow: ventFlow,
    infiltrationFlow: infFlow,
    deltaT: dT,
    deltaW: dW,
  };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
