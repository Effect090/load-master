import { describe, expect, it } from "vitest";
import { computeZoneResult } from "@/lib/calculations/zone";
import type { ClimateData, Zone } from "@/types";

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

function zone(over: Partial<Zone> = {}): Zone {
  return {
    id: "z1",
    name: "Z1",
    floorArea: 20,
    height: 2.7,
    volume: 54,
    internalGains: {
      occupancyType: "office_seated",
      peopleCount: 0,
      equipmentW: 0,
    },
    ventilation: {
      ventilationAirflowM3h: 0,
      infiltrationMethod: "ach",
      infiltrationAch: 0,
    },
    envelope: [],
    ...over,
  };
}

describe("computeZoneResult", () => {
  it("aggregates totals: heating = transmission + ventilation + infiltration", () => {
    const z = zone({
      envelope: [
        { id: "e1", name: "wall", type: "wall", area: 10, uValue: 0.3,
          orientation: "N", boundary: "outside" },
      ],
      ventilation: {
        ventilationAirflowM3h: 50,
        infiltrationMethod: "ach",
        infiltrationAch: 0.5,
      },
    });
    const r = computeZoneResult(z, CLIMATE, { safetyMargin: 0.1 });
    const expected =
      r.heatingTransmissionW + r.heatingVentilationW + r.heatingInfiltrationW;
    expect(r.totalHeatingW).toBeCloseTo(expected, 6);
    expect(r.recommendedHeatingW).toBeCloseTo(r.totalHeatingW * 1.1, 6);
  });

  it("returns Δw-driven latent cooling = 0 when indoor air is more humid than outdoor", () => {
    const dryOutside: ClimateData = {
      ...CLIMATE,
      outdoorSummerDb: 30,
      outdoorSummerRh: 10,
      indoorSummerDb: 26,
      indoorSummerRh: 90,
    };
    const z = zone({
      ventilation: {
        ventilationAirflowM3h: 200,
        infiltrationMethod: "ach",
        infiltrationAch: 0.3,
      },
    });
    const r = computeZoneResult(z, dryOutside, { safetyMargin: 0 });
    expect(r.coolingVentilationLatentW).toBe(0);
    expect(r.coolingInfiltrationLatentW).toBe(0);
    expect(r.peopleLatentW).toBe(0);
    expect(r.totalLatentCoolingW).toBe(0);
  });

  it("emits warnings for zero floor area and inverted set-points", () => {
    const z = zone({
      floorArea: 0,
      volume: 0,
      height: 0,
    });
    const climate: ClimateData = {
      ...CLIMATE,
      indoorWinterDb: 5,
      outdoorWinterDb: 10,
      indoorSummerDb: 35,
      outdoorSummerDb: 30,
    };
    const r = computeZoneResult(z, climate, { safetyMargin: 0 });
    const joined = r.warnings.join(" | ");
    expect(joined).toMatch(/floor area/i);
    expect(joined).toMatch(/winter design temperature/i);
    expect(joined).toMatch(/summer design temperature/i);
  });

  it("clamps cooling conduction at 0 for ground/adjacent boundaries cooler than indoor", () => {
    const z = zone({
      envelope: [
        { id: "g", name: "slab", type: "floor", area: 20, uValue: 1.0,
          orientation: "horizontal", boundary: "ground",
          adjacentTemperatureSummer: 18 },
      ],
    });
    const r = computeZoneResult(z, CLIMATE, { safetyMargin: 0 });
    expect(r.coolingConductionW).toBe(0);
  });

  it("never produces NaN/Infinity for an extreme but valid zone", () => {
    const z = zone({
      envelope: [
        { id: "1", name: "wall", type: "wall", area: 100, uValue: 5,
          orientation: "N", boundary: "outside" },
      ],
      ventilation: {
        ventilationAirflowM3h: 1_000_000,
        infiltrationMethod: "ach",
        infiltrationAch: 50,
      },
    });
    const r = computeZoneResult(z, CLIMATE, { safetyMargin: 0.5 });
    expect(Number.isFinite(r.totalHeatingW)).toBe(true);
    expect(Number.isFinite(r.totalCoolingW)).toBe(true);
    expect(Number.isFinite(r.recommendedHeatingW)).toBe(true);
    expect(Number.isFinite(r.recommendedCoolingW)).toBe(true);
  });
});
