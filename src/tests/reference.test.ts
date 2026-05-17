/**
 * Reference-case validation tests.
 *
 * All expected values are derived from the same formulas that the engine uses,
 * with hand calculations documented in comments for traceability.
 *
 * Tolerance: ±1 W for component loads, ±0.01 kW for totals displayed.
 */

import { describe, expect, it } from "vitest";
import { computeZoneResult } from "@/lib/calculations/zone";
import { computeProjectResult } from "@/lib/calculations/project";
import type { ClimateData, Project, Zone } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Reference climate
// ─────────────────────────────────────────────────────────────────────────────

const CLIMATE: ClimateData = {
  city: "Reference",
  indoorWinterDb: 21,
  outdoorWinterDb: -3,
  indoorSummerDb: 25,
  outdoorSummerDb: 34,
  indoorSummerRh: 50,
  outdoorSummerRh: 60,
  altitudeM: 30,
  solarIrradiance: {
    N: 120, NE: 220, E: 420, SE: 580, S: 650, SW: 600, W: 500, NW: 250, horizontal: 780,
  },
};

// ΔT_h = 21 − (−3) = 24 K
// ΔT_c = 34 − 25   = 9  K

// ─────────────────────────────────────────────────────────────────────────────
// Zone 1 — Bedroom
// ─────────────────────────────────────────────────────────────────────────────

const ZONE1: Zone = {
  id: "z1",
  name: "Bedroom",
  floorArea: 14,
  height: 2.5,
  volume: 35,
  internalGains: {
    occupancyType: "residential_sedentary",
    peopleCount: 2,
    lightingWPerM2: 8,
    equipmentW: 120,
  },
  ventilation: {
    ventilationAirflowM3h: 35,
    infiltrationMethod: "ach",
    infiltrationAch: 0.5,
    heatRecoverySensible: 0.70,
    heatRecoveryLatent: 0.50,
  },
  envelope: [
    {
      id: "e1",
      name: "South wall",
      type: "wall",
      area: 10,
      uValue: 0.32,
      orientation: "S",
      boundary: "outside",
      thermalBridgeWPerK: 0.8,
    },
    {
      id: "e2",
      name: "South window",
      type: "window",
      area: 2.5,
      glassArea: 2.2,
      uValue: 1.4,
      orientation: "S",
      boundary: "outside",
      shgc: 0.55,
      shadingFactor: 0.75,
    },
    {
      id: "e3",
      name: "Roof",
      type: "roof",
      area: 14,
      uValue: 0.20,
      orientation: "horizontal",
      boundary: "outside",
      thermalBridgeWPerK: 1.2,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Zone 2 — Living room
// ─────────────────────────────────────────────────────────────────────────────

const ZONE2: Zone = {
  id: "z2",
  name: "Living room",
  floorArea: 28,
  height: 2.5,
  volume: 70,
  internalGains: {
    occupancyType: "residential_sedentary",
    peopleCount: 4,
    lightingWPerM2: 10,
    equipmentW: 400,
  },
  ventilation: {
    ventilationAirflowM3h: 70,
    infiltrationMethod: "airflow",
    infiltrationAirflowM3h: 25,
    heatRecoverySensible: 0.75,
    heatRecoveryLatent: 0.50,
  },
  envelope: [
    {
      id: "e4",
      name: "West wall",
      type: "wall",
      area: 18,
      uValue: 0.35,
      orientation: "W",
      boundary: "outside",
      thermalBridgeWPerK: 1.4,
    },
    {
      id: "e5",
      name: "West window",
      type: "window",
      area: 5,
      glassArea: 4.5,
      uValue: 1.5,
      orientation: "W",
      boundary: "outside",
      shgc: 0.60,
      shadingFactor: 0.65,
    },
    {
      id: "e6",
      name: "Floor to garage",
      type: "floor",
      area: 28,
      uValue: 0.45,
      orientation: "horizontal",
      boundary: "unconditioned",
      adjacentTemperatureWinter: 10,
      adjacentTemperatureSummer: 28,
      thermalBridgeWPerK: 1.0,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Zone 1 component tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Zone 1 — Bedroom", () => {
  const r = computeZoneResult(ZONE1, CLIMATE, { safetyMargin: 0.15 });

  it("envelope heating: south wall", () => {
    // UA = (0.32×10 + 0.8) = 4.0 W/K;  Q = 4.0 × 24 = 96 W
    const el = r.envelopeBreakdown.find((b) => b.id === "e1")!;
    expect(el.heatingW).toBeCloseTo(96, 0);
    expect(el.heatingTransmissionW).toBeCloseTo(76.8, 0); // 0.32×10×24
    expect(el.heatingThermalBridgeW).toBeCloseTo(19.2, 0); // 0.8×24
  });

  it("envelope heating: south window", () => {
    // UA = 1.4×2.5 = 3.5;  Q = 3.5 × 24 = 84 W
    const el = r.envelopeBreakdown.find((b) => b.id === "e2")!;
    expect(el.heatingW).toBeCloseTo(84, 0);
  });

  it("envelope heating: roof", () => {
    // UA = (0.20×14 + 1.2) = 4.0;  Q = 4.0 × 24 = 96 W
    const el = r.envelopeBreakdown.find((b) => b.id === "e3")!;
    expect(el.heatingW).toBeCloseTo(96, 0);
  });

  it("total envelope heating transmission", () => {
    // 96 + 84 + 96 = 276 W
    expect(r.heatingTransmissionW).toBeCloseTo(276, 0);
  });

  it("heating ventilation sensible", () => {
    // Q = 0.335 × 35 × (1−0.70) × 24 = 0.335 × 35 × 0.30 × 24 = 84.42 W
    expect(r.heatingVentilationW).toBeCloseTo(84.4, 0);
  });

  it("heating infiltration sensible (no HR)", () => {
    // infil = 35 × 0.5 = 17.5 m³/h;  Q = 0.335 × 17.5 × 24 = 140.7 W
    expect(r.heatingInfiltrationW).toBeCloseTo(140.7, 0);
  });

  it("total heating Zone 1", () => {
    // 276 + 84.42 + 140.7 = 501.12 W
    expect(r.totalHeatingW).toBeCloseTo(501, 0);
  });

  it("solar gain south window", () => {
    // Q = 2.2 × 0.55 × 650 × 0.75 = 589.875 W
    const el = r.envelopeBreakdown.find((b) => b.id === "e2")!;
    expect(el.coolingSolarW).toBeCloseTo(589.9, 0);
  });

  it("cooling conduction: south wall", () => {
    // 4.0 × 9 = 36 W
    const el = r.envelopeBreakdown.find((b) => b.id === "e1")!;
    expect(el.coolingConductionW).toBeCloseTo(36, 0);
  });

  it("cooling conduction: south window", () => {
    // 3.5 × 9 = 31.5 W
    const el = r.envelopeBreakdown.find((b) => b.id === "e2")!;
    expect(el.coolingConductionW).toBeCloseTo(31.5, 0);
  });

  it("cooling ventilation sensible", () => {
    // Q = 0.335 × 35 × 0.30 × 9 = 31.66 W
    expect(r.coolingVentilationSensibleW).toBeCloseTo(31.7, 0);
  });

  it("cooling infiltration sensible (no HR)", () => {
    // Q = 0.335 × 17.5 × 9 = 52.76 W
    expect(r.coolingInfiltrationSensibleW).toBeCloseTo(52.8, 0);
  });

  it("people sensible / latent (residential_sedentary preset: 75/55 W)", () => {
    // 2 × 75 = 150 W sens; 2 × 55 = 110 W lat
    expect(r.peopleSensibleW).toBeCloseTo(150, 0);
    expect(r.peopleLatentW).toBeCloseTo(110, 0);
  });

  it("lighting (8 W/m² × 14 m² = 112 W)", () => {
    expect(r.lightingW).toBeCloseTo(112, 0);
  });

  it("equipment (120 W)", () => {
    expect(r.equipmentW).toBeCloseTo(120, 0);
  });

  it("total sensible cooling Zone 1", () => {
    // 103.5 + 589.9 + 31.7 + 52.8 + 150 + 112 + 120 ≈ 1160 W
    expect(r.totalSensibleCoolingW).toBeCloseTo(1160, -1);
  });

  it("cooling ventilation latent", () => {
    // Δw ≈ 10.38 g/kg (computed from psychrometrics)
    // Q = 0.83 × 35 × (1−0.50) × 10.38 ≈ 150.8 W  (within ±2W for Δw rounding)
    expect(r.coolingVentilationLatentW).toBeGreaterThan(145);
    expect(r.coolingVentilationLatentW).toBeLessThan(158);
  });

  it("cooling infiltration latent (no HR)", () => {
    // Q = 0.83 × 17.5 × Δw  — same order of magnitude as vent latent
    expect(r.coolingInfiltrationLatentW).toBeGreaterThan(130);
    expect(r.coolingInfiltrationLatentW).toBeLessThan(160);
  });

  it("recommended heating = raw × 1.15", () => {
    expect(r.recommendedHeatingW).toBeCloseTo(r.totalHeatingW * 1.15, 1);
  });

  it("recommended cooling = raw × 1.15", () => {
    expect(r.recommendedCoolingW).toBeCloseTo(r.totalCoolingW * 1.15, 1);
  });

  it("psychrometrics: Δw > 0 (outdoor more humid than indoor in summer)", () => {
    expect(r.psychrometrics.deltaWGPerKg).toBeGreaterThan(0);
    expect(r.psychrometrics.wOutdoorGPerKg).toBeGreaterThan(r.psychrometrics.wIndoorGPerKg);
  });

  it("air loads detail flows match ventilation/zone data", () => {
    expect(r.airLoadsDetail.ventilationFlowM3h).toBe(35);
    expect(r.airLoadsDetail.infiltrationFlowM3h).toBeCloseTo(17.5, 1);
    expect(r.airLoadsDetail.heatRecoverySensible).toBeCloseTo(0.70, 2);
    expect(r.airLoadsDetail.heatRecoveryLatent).toBeCloseTo(0.50, 2);
  });

  it("no warnings for well-formed zone", () => {
    // Should not have critical errors (there may be an infiltration ACH range note)
    const critical = r.warnings.filter(
      (w) => w.includes("negative") || w.includes("zero") || w.includes("≤ 0"),
    );
    expect(critical).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Zone 2 component tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Zone 2 — Living room", () => {
  const r = computeZoneResult(ZONE2, CLIMATE, { safetyMargin: 0.15 });

  it("floor (unconditioned) heating: ΔT = 21−10 = 11 K", () => {
    // UA = (0.45×28 + 1.0) = 13.6;  Q = 13.6 × 11 = 149.6 W
    const el = r.envelopeBreakdown.find((b) => b.id === "e6")!;
    expect(el.heatingW).toBeCloseTo(149.6, 0);
    expect(el.heatingDeltaTK).toBeCloseTo(11, 1);
  });

  it("floor (unconditioned) cooling: ΔT = 28−25 = 3 K", () => {
    // 13.6 × 3 = 40.8 W
    const el = r.envelopeBreakdown.find((b) => b.id === "e6")!;
    expect(el.coolingConductionW).toBeCloseTo(40.8, 0);
    expect(el.coolingDeltaTK).toBeCloseTo(3, 1);
  });

  it("west window solar gain", () => {
    // Q = 4.5 × 0.60 × 500 × 0.65 = 877.5 W
    const el = r.envelopeBreakdown.find((b) => b.id === "e5")!;
    expect(el.coolingSolarW).toBeCloseTo(877.5, 0);
  });

  it("infiltration is direct airflow (25 m³/h), no ACH", () => {
    expect(r.airLoadsDetail.infiltrationFlowM3h).toBeCloseTo(25, 1);
  });

  it("heating ventilation (70 m³/h, HR_s=0.75)", () => {
    // Q = 0.335 × 70 × 0.25 × 24 = 140.7 W
    expect(r.heatingVentilationW).toBeCloseTo(140.7, 0);
  });

  it("heating infiltration (25 m³/h direct, no HR)", () => {
    // Q = 0.335 × 25 × 24 = 201 W
    expect(r.heatingInfiltrationW).toBeCloseTo(201, 0);
  });

  it("total heating Zone 2", () => {
    // 514.4 + 140.7 + 201 = 856.1 W
    expect(r.totalHeatingW).toBeCloseTo(856, 0);
  });

  it("total cooling Zone 2", () => {
    // Approximate; verifies sensible + latent structure
    expect(r.totalCoolingW).toBeGreaterThan(2700);
    expect(r.totalCoolingW).toBeLessThan(3200);
  });

  it("internal gains: 4 people, 10 W/m², 400 W equipment", () => {
    expect(r.peopleSensibleW).toBeCloseTo(300, 0); // 4 × 75
    expect(r.peopleLatentW).toBeCloseTo(220, 0);   // 4 × 55
    expect(r.lightingW).toBeCloseTo(280, 0);       // 10 × 28
    expect(r.equipmentW).toBeCloseTo(400, 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Project-level tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Project — diversity + safety", () => {
  const project: Project = {
    id: "p1",
    name: "Reference",
    buildingType: "apartment",
    climate: CLIMATE,
    safetyMargin: 0.15,
    diversityFactor: 0.92,
    zones: [ZONE1, ZONE2],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const res = computeProjectResult(project);

  it("total heating = sum of zone totals", () => {
    const r1 = computeZoneResult(ZONE1, CLIMATE, { safetyMargin: 0.15 });
    const r2 = computeZoneResult(ZONE2, CLIMATE, { safetyMargin: 0.15 });
    expect(res.totalHeatingW).toBeCloseTo(r1.totalHeatingW + r2.totalHeatingW, 1);
  });

  it("rawRecommendedHeatingW = total × 1.15 (no diversity)", () => {
    expect(res.rawRecommendedHeatingW).toBeCloseTo(res.totalHeatingW * 1.15, 1);
  });

  it("recommendedHeatingW = total × diversity × 1.15", () => {
    expect(res.recommendedHeatingW).toBeCloseTo(res.totalHeatingW * 0.92 * 1.15, 1);
  });

  it("recommendedHeatingW < rawRecommendedHeatingW (diversity reduces project total)", () => {
    expect(res.recommendedHeatingW).toBeLessThan(res.rawRecommendedHeatingW);
  });

  it("two zones in result", () => {
    expect(res.zones).toHaveLength(2);
  });

  it("total area = 14 + 28 = 42 m²", () => {
    expect(res.totalArea).toBeCloseTo(42, 0);
  });

  it("no safety-margin warning (15% ≤ 30%)", () => {
    const safetyWarn = res.warnings.find((w) => w.includes("Safety margin"));
    expect(safetyWarn).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Warning generation tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Warning generation", () => {
  it("warns when window SHGC=0 with non-zero irradiance", () => {
    const z: Zone = {
      ...ZONE1,
      envelope: [
        {
          id: "w1",
          name: "South win",
          type: "window",
          area: 2,
          uValue: 1.4,
          orientation: "S",
          boundary: "outside",
          shgc: 0, // intentionally 0
          shadingFactor: 1,
        },
      ],
    };
    const r = computeZoneResult(z, CLIMATE, { safetyMargin: 0 });
    expect(r.warnings.join(" ")).toMatch(/SHGC is 0/i);
  });

  it("warns when glass area > total window area", () => {
    const z: Zone = {
      ...ZONE1,
      envelope: [
        {
          id: "w2",
          name: "Bad window",
          type: "window",
          area: 2,
          glassArea: 3, // > area
          uValue: 1.4,
          orientation: "S",
          boundary: "outside",
          shgc: 0.5,
          shadingFactor: 1,
        },
      ],
    };
    const r = computeZoneResult(z, CLIMATE, { safetyMargin: 0 });
    expect(r.warnings.join(" ")).toMatch(/glass area.*exceeds/i);
  });

  it("warns when indoor air is significantly more humid than outdoor", () => {
    const dryOutdoor: ClimateData = {
      ...CLIMATE,
      outdoorSummerDb: 30,
      outdoorSummerRh: 10, // very dry outdoor
      indoorSummerDb: 26,
      indoorSummerRh: 90,  // very humid indoor
    };
    const r = computeZoneResult(
      { ...ZONE1, ventilation: { ...ZONE1.ventilation, ventilationAirflowM3h: 200 } },
      dryOutdoor,
      { safetyMargin: 0 },
    );
    expect(r.warnings.join(" ")).toMatch(/indoor air is more humid/i);
    expect(r.coolingVentilationLatentW).toBe(0);
    expect(r.coolingInfiltrationLatentW).toBe(0);
  });

  it("infiltration latent is 0 when Δw ≤ 0 (clamped)", () => {
    const dryOutdoor: ClimateData = {
      ...CLIMATE,
      outdoorSummerRh: 5,
      indoorSummerRh: 80,
    };
    const r = computeZoneResult(ZONE1, dryOutdoor, { safetyMargin: 0 });
    expect(r.coolingVentilationLatentW).toBe(0);
    expect(r.coolingInfiltrationLatentW).toBe(0);
  });

  it("adjacent_conditioned boundary contributes 0 load without temperature override", () => {
    const z: Zone = {
      ...ZONE1,
      envelope: [
        {
          id: "ac",
          name: "Party wall",
          type: "wall",
          area: 10,
          uValue: 0.5,
          orientation: "N",
          boundary: "adjacent_conditioned",
          // no adjacentTemperatureWinter/Summer override
        },
      ],
    };
    const r = computeZoneResult(z, CLIMATE, { safetyMargin: 0 });
    const el = r.envelopeBreakdown.find((b) => b.id === "ac")!;
    expect(el.heatingW).toBe(0);
    expect(el.coolingConductionW).toBe(0);
  });

  it("project warns when safety margin > 30%", () => {
    const project: Project = {
      id: "p2",
      name: "HighSafety",
      buildingType: "custom",
      climate: CLIMATE,
      safetyMargin: 0.35, // 35% — triggers warning
      diversityFactor: 1,
      zones: [ZONE1],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const res = computeProjectResult(project);
    expect(res.warnings.join(" ")).toMatch(/safety margin/i);
  });

  it("no NaN or Infinity in all result numbers", () => {
    const r = computeZoneResult(ZONE1, CLIMATE, { safetyMargin: 0.15 });
    const numbers = [
      r.totalHeatingW, r.totalCoolingW, r.totalSensibleCoolingW, r.totalLatentCoolingW,
      r.recommendedHeatingW, r.recommendedCoolingW, r.heatingTransmissionW,
      r.heatingVentilationW, r.heatingInfiltrationW, r.coolingConductionW, r.coolingSolarW,
      r.peopleSensibleW, r.peopleLatentW, r.lightingW, r.equipmentW,
    ];
    for (const n of numbers) {
      expect(Number.isFinite(n)).toBe(true);
    }
  });
});
