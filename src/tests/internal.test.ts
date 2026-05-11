import { describe, expect, it } from "vitest";
import { internalGainsW } from "@/lib/calculations/internal";
import { OCCUPANCY_PRESETS } from "@/lib/defaults/internal";
import type { Zone } from "@/types";

function makeZone(overrides: Partial<Zone> = {}): Zone {
  return {
    id: "z1",
    name: "Zone",
    floorArea: 20,
    height: 2.7,
    volume: 20 * 2.7,
    internalGains: {
      occupancyType: "office_seated",
      peopleCount: 2,
      lightingTotalW: 100,
      equipmentW: 50,
    },
    ventilation: {
      ventilationAirflowM3h: 0,
      infiltrationMethod: "ach",
      infiltrationAch: 0,
    },
    envelope: [],
    ...overrides,
  };
}

describe("internal gains", () => {
  it("uses the occupancy preset when per-person W not provided", () => {
    const z = makeZone();
    const g = internalGainsW(z);
    const preset = OCCUPANCY_PRESETS.office_seated;
    expect(g.peopleSensibleW).toBeCloseTo(preset.sensibleW * 2);
    expect(g.peopleLatentW).toBeCloseTo(preset.latentW * 2);
  });

  it("overrides per-person W when explicitly provided", () => {
    const z = makeZone({
      internalGains: {
        occupancyType: "office_seated",
        peopleCount: 3,
        peopleSensibleW: 80,
        peopleLatentW: 60,
        equipmentW: 0,
      },
    });
    const g = internalGainsW(z);
    expect(g.peopleSensibleW).toBeCloseTo(240);
    expect(g.peopleLatentW).toBeCloseTo(180);
  });

  it("prefers lightingTotalW over W/m²", () => {
    const z = makeZone({
      floorArea: 50,
      internalGains: {
        occupancyType: "office_seated",
        peopleCount: 0,
        lightingWPerM2: 9,
        lightingTotalW: 333,
        equipmentW: 0,
      },
    });
    expect(internalGainsW(z).lightingW).toBeCloseTo(333);
  });

  it("falls back to W/m² × floor area when total not given", () => {
    const z = makeZone({
      floorArea: 50,
      internalGains: {
        occupancyType: "office_seated",
        peopleCount: 0,
        lightingWPerM2: 9,
        equipmentW: 0,
      },
    });
    expect(internalGainsW(z).lightingW).toBeCloseTo(450);
  });

  it("applies diversity uniformly to all gains", () => {
    const z = makeZone({
      internalGains: {
        occupancyType: "office_seated",
        peopleCount: 4,
        lightingTotalW: 200,
        equipmentW: 100,
        diversity: 0.5,
      },
    });
    const g = internalGainsW(z);
    expect(g.lightingW).toBeCloseTo(100);
    expect(g.equipmentW).toBeCloseTo(50);
    const preset = OCCUPANCY_PRESETS.office_seated;
    expect(g.peopleSensibleW).toBeCloseTo(preset.sensibleW * 4 * 0.5);
    expect(g.peopleLatentW).toBeCloseTo(preset.latentW * 4 * 0.5);
  });

  it("clamps diversity outside 0..1 and treats NaN as 1", () => {
    const z = (d: number) =>
      makeZone({
        internalGains: {
          occupancyType: "office_seated",
          peopleCount: 0,
          lightingTotalW: 100,
          equipmentW: 0,
          diversity: d,
        },
      });
    expect(internalGainsW(z(2)).lightingW).toBeCloseTo(100);
    expect(internalGainsW(z(-1)).lightingW).toBeCloseTo(0);
    expect(internalGainsW(z(Number.NaN)).lightingW).toBeCloseTo(100);
  });

  it("clamps negative people / equipment to zero", () => {
    const z = makeZone({
      internalGains: {
        occupancyType: "office_seated",
        peopleCount: -3,
        equipmentW: -50,
      },
    });
    const g = internalGainsW(z);
    expect(g.peopleSensibleW).toBe(0);
    expect(g.peopleLatentW).toBe(0);
    expect(g.equipmentW).toBe(0);
  });
});
