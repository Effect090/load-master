import { describe, expect, it } from "vitest";
import { computeProjectResult } from "@/lib/calculations/project";
import type { Project } from "@/types";

const project: Project = {
  id: "p",
  name: "Test",
  buildingType: "office",
  safetyMargin: 0.1,
  diversityFactor: 1,
  createdAt: "",
  updatedAt: "",
  climate: {
    city: "Test",
    outdoorWinterDb: -5,
    outdoorSummerDb: 32,
    outdoorSummerRh: 50,
    indoorWinterDb: 20,
    indoorSummerDb: 26,
    indoorSummerRh: 50,
    altitudeM: 0,
    solarIrradiance: {
      N: 100, NE: 200, E: 400, SE: 350, S: 300, SW: 400, W: 500, NW: 300, horizontal: 700,
    },
  },
  zones: [
    {
      id: "z1",
      name: "Office A",
      floorArea: 20,
      height: 2.7,
      volume: 54,
      internalGains: {
        occupancyType: "office_seated",
        peopleCount: 2,
        lightingTotalW: 200,
        equipmentW: 300,
      },
      ventilation: {
        ventilationAirflowM3h: 60,
        infiltrationMethod: "ach",
        infiltrationAch: 0.4,
      },
      envelope: [
        {
          id: "w1",
          name: "Outside wall N",
          type: "wall",
          area: 10,
          uValue: 0.3,
          orientation: "N",
          boundary: "outside",
        },
        {
          id: "win1",
          name: "Window N",
          type: "window",
          area: 2,
          glassArea: 1.6,
          uValue: 1.6,
          shgc: 0.5,
          shadingFactor: 1,
          orientation: "N",
          boundary: "outside",
        },
      ],
    },
    {
      id: "z2",
      name: "Office B",
      floorArea: 30,
      height: 2.7,
      volume: 81,
      internalGains: {
        occupancyType: "office_seated",
        peopleCount: 3,
        lightingTotalW: 300,
        equipmentW: 450,
      },
      ventilation: {
        ventilationAirflowM3h: 90,
        infiltrationMethod: "ach",
        infiltrationAch: 0.4,
      },
      envelope: [
        {
          id: "w2",
          name: "Wall E",
          type: "wall",
          area: 12,
          uValue: 0.3,
          orientation: "E",
          boundary: "outside",
        },
      ],
    },
  ],
};

describe("computeProjectResult", () => {
  const result = computeProjectResult(project);

  it("totals are sums of zones", () => {
    const sumH = result.zones.reduce((s, z) => s + z.totalHeatingW, 0);
    const sumC = result.zones.reduce((s, z) => s + z.totalCoolingW, 0);
    expect(result.totalHeatingW).toBeCloseTo(sumH, 6);
    expect(result.totalCoolingW).toBeCloseTo(sumC, 6);
  });

  it("recommended capacities apply diversity × safety margin", () => {
    expect(result.recommendedHeatingW).toBeCloseTo(result.totalHeatingW * 1.1, 4);
    expect(result.recommendedCoolingW).toBeCloseTo(result.totalCoolingW * 1.1, 4);
  });

  it("largest zone lists are sorted descending", () => {
    const sortedH = [...result.largestHeatingZones].sort((a, b) => b.w - a.w);
    expect(result.largestHeatingZones).toEqual(sortedH);
  });

  it("totalArea matches the sum of zone floor areas", () => {
    expect(result.totalArea).toBe(50);
  });
});
