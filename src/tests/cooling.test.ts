import { describe, expect, it } from "vitest";
import {
  airCoolingLoads,
  envelopeCoolingConductionW,
  envelopeCoolingSolarW,
} from "@/lib/calculations/cooling";
import type { ClimateData, EnvelopeElement, Zone } from "@/types";

const CLIMATE: ClimateData = {
  city: "Test",
  outdoorWinterDb: -5,
  outdoorSummerDb: 32,
  outdoorSummerRh: 60,
  indoorWinterDb: 20,
  indoorSummerDb: 26,
  indoorSummerRh: 50,
  altitudeM: 0,
  solarIrradiance: {
    N: 100, NE: 200, E: 400, SE: 350, S: 300, SW: 400, W: 500, NW: 300, horizontal: 700,
  },
};

describe("envelope cooling conduction", () => {
  it("Q = U × A × ΔT_c for outside wall", () => {
    const el: EnvelopeElement = {
      id: "1",
      name: "wall",
      type: "wall",
      area: 10,
      uValue: 0.3,
      orientation: "N",
      boundary: "outside",
    };
    // ΔT = 32 − 26 = 6; Q = 0.3 × 10 × 6 = 18 W
    expect(envelopeCoolingConductionW(el, CLIMATE).w).toBeCloseTo(18, 6);
  });
});

describe("envelope solar gain", () => {
  it("non-windows produce 0 solar gain", () => {
    const el: EnvelopeElement = {
      id: "1",
      name: "wall",
      type: "wall",
      area: 10,
      uValue: 0.3,
      orientation: "S",
      boundary: "outside",
    };
    expect(envelopeCoolingSolarW(el, CLIMATE).w).toBe(0);
  });

  it("Q_solar = A_g × SHGC × I × shading", () => {
    const el: EnvelopeElement = {
      id: "1",
      name: "win",
      type: "window",
      area: 2,
      glassArea: 1.6,
      uValue: 1.6,
      orientation: "W",
      boundary: "outside",
      shgc: 0.5,
      shadingFactor: 0.8,
    };
    // 1.6 × 0.5 × 500 × 0.8 = 320 W
    expect(envelopeCoolingSolarW(el, CLIMATE).w).toBeCloseTo(320, 6);
  });
});

describe("airCoolingLoads", () => {
  const zone: Zone = {
    id: "z1",
    name: "Z",
    floorArea: 20,
    height: 2.5,
    volume: 50,
    internalGains: { occupancyType: "office_seated", peopleCount: 0, equipmentW: 0 },
    ventilation: {
      ventilationAirflowM3h: 100,
      infiltrationMethod: "ach",
      infiltrationAch: 0.5,
    },
    envelope: [],
  };

  it("sensible ventilation load ≈ 0.335 × 100 × 6 = 201 W", () => {
    const r = airCoolingLoads(zone, CLIMATE);
    expect(r.ventilationSensibleW).toBeCloseTo(0.335 * 100 * 6, 1);
  });

  it("latent ventilation load uses Δw, > 0 when outdoor humid", () => {
    const r = airCoolingLoads(zone, CLIMATE);
    expect(r.ventilationLatentW).toBeGreaterThan(0);
    expect(r.deltaWGPerKg).toBeGreaterThan(0);
  });
});
