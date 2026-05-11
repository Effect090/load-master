import type {
  ClimateData,
  EnvelopeElementResult,
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

export interface ComputeZoneOptions {
  /** Safety margin as fraction (e.g. 0.10 = +10%). */
  safetyMargin: number;
}

export function computeZoneResult(
  zone: Zone,
  climate: ClimateData,
  opts: ComputeZoneOptions,
): ZoneResult {
  const warnings: string[] = collectZoneWarnings(zone, climate);

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

    envelopeBreakdown.push({
      id: el.id,
      name: el.name,
      type: el.type,
      heatingW: heat.w,
      coolingConductionW: cool.w,
      coolingSolarW: solar.w,
      trace: [heat.trace, cool.trace, solar.trace].filter(
        (t) => t.formula !== "n/a (not a window)",
      ),
    });
  }

  // ── Air loads ─────────────────────────────────────────────────────────
  const heatAir = airHeatingLoads(zone, climate);
  const coolAir = airCoolingLoads(zone, climate);

  // ── Internal gains ────────────────────────────────────────────────────
  const ig = internalGainsW(zone);

  // ── Totals ────────────────────────────────────────────────────────────
  const totalHeatingW = heatingTrans + heatAir.ventilationW + heatAir.infiltrationW;

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
    warnings,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Warnings — engineering sanity checks
// ────────────────────────────────────────────────────────────────────────────

function collectZoneWarnings(zone: Zone, climate: ClimateData): string[] {
  const w: string[] = [];

  if (zone.envelope.length === 0) {
    w.push("Zone has no envelope elements — heating/cooling will be only ventilation+gains.");
  }
  if (zone.floorArea <= 0) w.push("Floor area is zero or negative.");
  if (zone.height <= 0) w.push("Zone height is zero or negative.");
  if (zone.volume <= 0) w.push("Zone volume is zero or negative.");

  if (climate.indoorWinterDb <= climate.outdoorWinterDb) {
    w.push("Indoor heating set-point is not higher than outdoor winter design temperature.");
  }
  if (climate.indoorSummerDb >= climate.outdoorSummerDb) {
    w.push("Indoor cooling set-point is not lower than outdoor summer design temperature.");
  }

  for (const el of zone.envelope) {
    if (el.uValue <= 0) w.push(`U-value ≤ 0 on element "${el.name}".`);
    if (el.uValue > 6) w.push(`U-value > 6 W/m²K on element "${el.name}" — extremely poor insulation.`);
    if (el.area <= 0) w.push(`Area ≤ 0 on element "${el.name}".`);
    if (el.type === "window") {
      const shgc = el.shgc ?? 0;
      if (shgc < 0 || shgc > 1) w.push(`SHGC outside 0–1 on window "${el.name}".`);
      const sh = el.shadingFactor ?? 1;
      if (sh < 0 || sh > 1) w.push(`Shading factor outside 0–1 on window "${el.name}".`);
    }
  }

  const v = zone.ventilation;
  if (v.infiltrationMethod === "ach") {
    const ach = v.infiltrationAch ?? 0;
    if (ach < 0) w.push("Infiltration ACH is negative.");
    if (ach > 5) w.push("Infiltration ACH > 5 — extremely leaky building.");
  }
  if (v.ventilationAirflowM3h < 0) w.push("Ventilation airflow is negative.");

  return w;
}
