import type {
  ClimateData,
  EnvelopeElementResult,
  PsychrometricSummary,
  Zone,
  ZoneResult,
} from "@/types";
import { airHeatingLoads, envelopeHeatingW } from "./heating";
import {
  airCoolingLoads,
  envelopeCoolingConductionW,
  envelopeCoolingSolarW,
} from "./cooling";
import { internalGainsW } from "./internal";
import {
  atmosphericPressure,
  humidityRatioGPerKg,
} from "./psychrometrics";

export interface ComputeZoneOptions {
  /** Safety margin as fraction (e.g. 0.10 = +10%). */
  safetyMargin: number;
}

export function computeZoneResult(
  zone: Zone,
  climate: ClimateData,
  opts: ComputeZoneOptions,
): ZoneResult {
  // ── Psychrometric summary ─────────────────────────────────────────────
  const pressurePa = atmosphericPressure(climate.altitudeM ?? 0);
  const wIn = humidityRatioGPerKg(climate.indoorSummerDb, climate.indoorSummerRh, pressurePa);
  const wOut = humidityRatioGPerKg(climate.outdoorSummerDb, climate.outdoorSummerRh, pressurePa);
  const deltaWRaw = wOut - wIn;
  const psychrometrics: PsychrometricSummary = {
    pressurePa: Math.round(pressurePa),
    wIndoorGPerKg: parseFloat(wIn.toFixed(3)),
    wOutdoorGPerKg: parseFloat(wOut.toFixed(3)),
    deltaWGPerKg: parseFloat(Math.max(0, deltaWRaw).toFixed(3)),
    deltaWRawGPerKg: parseFloat(deltaWRaw.toFixed(3)),
  };

  // ── Envelope: heating + cooling conduction + solar gains ──────────────
  let heatingTrans = 0;
  let coolingCond = 0;
  let coolingSol = 0;
  const envelopeBreakdown: EnvelopeElementResult[] = [];

  for (const el of zone.envelope) {
    const heat = envelopeHeatingW(el, climate);
    const cool = envelopeCoolingConductionW(el, climate);
    const solar = envelopeCoolingSolarW(el, climate);

    heatingTrans += heat.w;
    coolingCond += cool.w;
    coolingSol += solar.w;

    const traces = [heat.trace, cool.trace];
    if (el.type === "window") traces.push(solar.trace);

    envelopeBreakdown.push({
      id: el.id,
      name: el.name,
      type: el.type,
      heatingW: heat.w,
      heatingTransmissionW: heat.transmissionW,
      heatingThermalBridgeW: heat.thermalBridgeW,
      heatingDeltaTK: heat.deltaT,
      coolingConductionW: cool.w,
      coolingTransmissionW: cool.transmissionW,
      coolingThermalBridgeW: cool.thermalBridgeW,
      coolingDeltaTK: cool.deltaT,
      coolingSolarW: solar.w,
      trace: traces,
    });
  }

  // ── Air loads ─────────────────────────────────────────────────────────
  const heatAir = airHeatingLoads(zone, climate);
  const coolAir = airCoolingLoads(zone, climate);

  // ── Internal gains ────────────────────────────────────────────────────
  const ig = internalGainsW(zone);

  // ── Totals ────────────────────────────────────────────────────────────
  const totalHeatingW =
    heatingTrans + heatAir.ventilationW + heatAir.infiltrationW;

  const totalSensibleCoolingW =
    coolingCond +
    coolingSol +
    coolAir.ventilationSensibleW +
    coolAir.infiltrationSensibleW +
    ig.peopleSensibleW +
    ig.lightingW +
    ig.equipmentW;

  const totalLatentCoolingW =
    coolAir.ventilationLatentW +
    coolAir.infiltrationLatentW +
    ig.peopleLatentW;

  const totalCoolingW = totalSensibleCoolingW + totalLatentCoolingW;

  const safety = Math.max(0, opts.safetyMargin);
  const recommendedHeatingW = totalHeatingW * (1 + safety);
  const recommendedCoolingW = totalCoolingW * (1 + safety);

  const heatingPerM2 = zone.floorArea > 0 ? totalHeatingW / zone.floorArea : 0;
  const coolingPerM2 = zone.floorArea > 0 ? totalCoolingW / zone.floorArea : 0;

  // ── Warnings ─────────────────────────────────────────────────────────
  const warnings = collectZoneWarnings(zone, climate, coolAir.deltaWRawGPerKg);

  if (heatingPerM2 > 200) warnings.push("Heating density > 200 W/m² — verify inputs.");
  if (coolingPerM2 > 250) warnings.push("Cooling density > 250 W/m² — verify inputs.");

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    floorArea: zone.floorArea,
    heatingTransmissionW: heatingTrans,
    heatingVentilationW: heatAir.ventilationW,
    heatingInfiltrationW: heatAir.infiltrationW,
    totalHeatingW,
    coolingConductionW: coolingCond,
    coolingSolarW: coolingSol,
    coolingVentilationSensibleW: coolAir.ventilationSensibleW,
    coolingInfiltrationSensibleW: coolAir.infiltrationSensibleW,
    peopleSensibleW: ig.peopleSensibleW,
    lightingW: ig.lightingW,
    equipmentW: ig.equipmentW,
    totalSensibleCoolingW,
    coolingVentilationLatentW: coolAir.ventilationLatentW,
    coolingInfiltrationLatentW: coolAir.infiltrationLatentW,
    peopleLatentW: ig.peopleLatentW,
    totalLatentCoolingW,
    totalCoolingW,
    recommendedHeatingW,
    recommendedCoolingW,
    heatingPerM2,
    coolingPerM2,
    envelopeBreakdown,
    psychrometrics,
    airLoadsDetail: {
      ventilationFlowM3h: heatAir.ventilationFlow,
      infiltrationFlowM3h: heatAir.infiltrationFlow,
      heatingDeltaTK: climate.indoorWinterDb - climate.outdoorWinterDb,
      coolingDeltaTK: coolAir.deltaT,
      heatRecoverySensible: zone.ventilation.heatRecoverySensible ?? 0,
      heatRecoveryLatent: zone.ventilation.heatRecoveryLatent ?? 0,
      heatingVentTrace: heatAir.ventTrace,
      heatingInfilTrace: heatAir.infilTrace,
      coolingVentSensibleTrace: coolAir.ventSensibleTrace,
      coolingVentLatentTrace: coolAir.ventLatentTrace,
      coolingInfilSensibleTrace: coolAir.infilSensibleTrace,
      coolingInfilLatentTrace: coolAir.infilLatentTrace,
    },
    internalGainsDetail: ig.detail,
    warnings,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Engineering warnings
// ─────────────────────────────────────────────────────────────────────────────

function collectZoneWarnings(
  zone: Zone,
  climate: ClimateData,
  deltaWRaw: number,
): string[] {
  const w: string[] = [];

  // Zone geometry
  if (zone.floorArea <= 0) w.push("Floor area is zero or negative.");
  if (zone.height <= 0) w.push("Zone height is zero or negative.");
  if (zone.volume <= 0) w.push("Zone volume is zero or negative.");
  if (zone.envelope.length === 0)
    w.push("Zone has no envelope elements — loads will only include ventilation & gains.");

  // Design temperatures
  if (climate.indoorWinterDb <= climate.outdoorWinterDb)
    w.push("Indoor heating set-point is not higher than outdoor winter design temperature.");
  if (climate.indoorSummerDb >= climate.outdoorSummerDb)
    w.push("Indoor cooling set-point is not lower than outdoor summer design temperature.");

  // Envelope elements
  for (const el of zone.envelope) {
    if (el.uValue <= 0)
      w.push(`"${el.name}": U-value is zero or negative — element produces no load.`);
    if (el.uValue > 6)
      w.push(`"${el.name}": U-value > 6 W/m²K — extremely poor insulation, verify value.`);
    if (el.area <= 0)
      w.push(`"${el.name}": area is zero or negative.`);

    if (el.type === "window") {
      const shgc = el.shgc ?? 0;
      if (shgc < 0 || shgc > 1)
        w.push(`"${el.name}": SHGC is outside 0–1 (got ${shgc}).`);
      if (shgc === 0) {
        const I = climate.solarIrradiance[el.orientation] ?? 0;
        if (I > 0)
          w.push(
            `"${el.name}": SHGC is 0 but orientation ${el.orientation} has irradiance ${I} W/m² — solar gain will be zero.`,
          );
      }
      const sh = el.shadingFactor ?? 1;
      if (sh < 0 || sh > 1)
        w.push(`"${el.name}": shading factor is outside 0–1 (got ${sh}).`);
      const ga = el.glassArea;
      if (ga != null && ga > el.area)
        w.push(
          `"${el.name}": glass area (${ga} m²) exceeds total window area (${el.area} m²).`,
        );
    }

    if (el.boundary === "adjacent_conditioned") {
      const adjW = el.adjacentTemperatureWinter;
      const adjS = el.adjacentTemperatureSummer;
      if (adjW != null && Math.abs(adjW - climate.indoorWinterDb) > 0.5)
        w.push(
          `"${el.name}": adjacent-conditioned boundary has a different winter temperature (${adjW}°C vs indoor ${climate.indoorWinterDb}°C) — a small load will be calculated.`,
        );
      if (adjS != null && Math.abs(adjS - climate.indoorSummerDb) > 0.5)
        w.push(
          `"${el.name}": adjacent-conditioned boundary has a different summer temperature (${adjS}°C vs indoor ${climate.indoorSummerDb}°C) — a small load will be calculated.`,
        );
    }
  }

  // Ventilation & infiltration
  const v = zone.ventilation;
  const hrSens = v.heatRecoverySensible ?? 0;
  const hrLat = v.heatRecoveryLatent ?? 0;
  if (hrSens < 0 || hrSens > 1)
    w.push(`Heat-recovery sensible efficiency is outside 0–1 (got ${hrSens}).`);
  if (hrLat < 0 || hrLat > 1)
    w.push(`Heat-recovery latent efficiency is outside 0–1 (got ${hrLat}).`);

  if (v.infiltrationMethod === "ach") {
    const ach = v.infiltrationAch ?? 0;
    if (ach < 0) w.push("Infiltration ACH is negative.");
    if (ach > 0 && ach < 0.1)
      w.push(`Infiltration ACH is very low (${ach}) — typical passive houses are ~0.1 ACH.`);
    if (ach > 2)
      w.push(`Infiltration ACH is high (${ach}) — typical well-sealed buildings are ≤ 1 ACH.`);
  }
  if (v.ventilationAirflowM3h < 0)
    w.push("Ventilation airflow is negative.");

  // Psychrometrics — warn if indoor more humid than outdoor
  if (deltaWRaw < -1)
    w.push(
      `Indoor air is more humid than outdoor (Δw = ${deltaWRaw.toFixed(1)} g/kg) — latent cooling load is clamped to 0. Check design RH values.`,
    );

  return w;
}
