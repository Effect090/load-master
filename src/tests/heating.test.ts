import { describe, expect, it } from "vitest";
import {
  airHeatingLoads,
  envelopeHeatingW,
} from "@/lib/calculations/heating";
import type { ClimateData, EnvelopeElement, Zone } from "@/types";

const CLIMATE: ClimateData = {
  city: "Test",
  outdoorWinterDb: -5,
  outdoorSummerDb: 32,
  outdoorSummerRh: 50,
  indoorWinterDb: 20,
  indoorSummerDb: 26,
  indoorSummerRh: 50,
  altitudeM: 0,
  solarIrradiance: {
    N: 0, NE: 0, E: 0, SE: 0, S: 0, SW: 0, W: 0, NW: 0, horizontal: 0,
  },
};

describe("envelopeHeatingW", () => {
  it("Q = U × A × ΔT for an outside wall", () => {
    const el: EnvelopeElement = {
      id: "1",
      name: "wall",
      type: "wall",
      area: 10,
      uValue: 0.3,
      orientation: "N",
      boundary: "outside",
    };
    // ΔT = 20 − (−5) = 25; Q = 0.3 × 10 × 25 = 75 W
    expect(envelopeHeatingW(el, CLIMATE).w).toBeCloseTo(75, 6);
  });

  it("includes thermal-bridge ψL term", () => {
    const el: EnvelopeElement = {
      id: "1",
      name: "wall",
      type: "wall",
      area: 10,
      uValue: 0.3,
      thermalBridgeWPerK: 1, // adds 1 × 25 = 25 W
      orientation: "N",
      boundary: "outside",
    };
    expect(envelopeHeatingW(el, CLIMATE).w).toBeCloseTo(100, 6);
  });

  it("returns 0 if boundary is warmer than indoor (e.g. adjacent room at 22 °C)", () => {
    const el: EnvelopeElement = {
      id: "1",
      name: "wall",
      type: "wall",
      area: 10,
      uValue: 0.3,
      orientation: "N",
      boundary: "adjacent_conditioned",
      adjacentTemperatureWinter: 22,
    };
    expect(envelopeHeatingW(el, CLIMATE).w).toBe(0);
  });
});

describe("airHeatingLoads", () => {
  const zone: Zone = {
    id: "z1",
    name: "Z",
    floorArea: 20,
    height: 2.5,
    volume: 50,
    internalGains: {
      occupancyType: "office_seated",
      peopleCount: 0,
      equipmentW: 0,
    },
    ventilation: {
      ventilationAirflowM3h: 100,
      infiltrationMethod: "ach",
      infiltrationAch: 0.5,
    },
    envelope: [],
  };

  it("ventilation Q ≈ 0.335 × 100 × 25 = 837.5 W", () => {
    const r = airHeatingLoads(zone, CLIMATE);
    expect(r.ventilationW).toBeCloseTo(837.5, 1);
  });

  it("infiltration airflow = volume × ACH = 50 × 0.5 = 25 m³/h", () => {
    const r = airHeatingLoads(zone, CLIMATE);
    expect(r.infiltrationFlow).toBeCloseTo(25, 6);
    expect(r.infiltrationW).toBeCloseTo(0.335 * 25 * 25, 1);
  });

  it("heat-recovery sensible ε reduces ventilation load", () => {
    const z = { ...zone, ventilation: { ...zone.ventilation, heatRecoverySensible: 0.7 } };
    const r = airHeatingLoads(z, CLIMATE);
    // 30% of base = 0.3 × 837.5
    expect(r.ventilationW).toBeCloseTo(0.3 * 0.335 * 100 * 25, 1);
  });
});
