import type { BuildingType, Project, Zone } from "@/types";
import { uid } from "@/lib/utils";
import { DEFAULT_CLIMATE } from "@/lib/defaults/climate";

export function createEmptyProject(name = "Untitled project"): Project {
  const now = new Date().toISOString();
  return {
    id: uid(),
    name,
    buildingType: "office",
    climate: { ...DEFAULT_CLIMATE, solarIrradiance: { ...DEFAULT_CLIMATE.solarIrradiance } },
    safetyMargin: 0.1,
    diversityFactor: 1,
    zones: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** Demo project pre-populated with two zones for the “View demo” CTA. */
export function createDemoProject(): Project {
  const base = createEmptyProject("Demo — small office");
  base.buildingType = "office";

  const office: Zone = {
    id: uid(),
    name: "Open office",
    floorArea: 35,
    height: 2.8,
    volume: 35 * 2.8,
    internalGains: {
      occupancyType: "office_seated",
      peopleCount: 6,
      lightingWPerM2: 9,
      equipmentW: 900,
    },
    ventilation: {
      ventilationAirflowM3h: 180,
      infiltrationMethod: "ach",
      infiltrationAch: 0.4,
    },
    envelope: [
      {
        id: uid(),
        name: "South wall",
        type: "wall",
        area: 18,
        uValue: 0.35,
        orientation: "S",
        boundary: "outside",
      },
      {
        id: uid(),
        name: "South window",
        type: "window",
        area: 4,
        glassArea: 3.5,
        uValue: 1.6,
        shgc: 0.55,
        shadingFactor: 0.7,
        orientation: "S",
        boundary: "outside",
      },
      {
        id: uid(),
        name: "Roof",
        type: "roof",
        area: 35,
        uValue: 0.25,
        orientation: "horizontal",
        boundary: "outside",
      },
    ],
  };

  const meeting: Zone = {
    id: uid(),
    name: "Meeting room",
    floorArea: 18,
    height: 2.8,
    volume: 18 * 2.8,
    internalGains: {
      occupancyType: "office_seated",
      peopleCount: 8,
      lightingWPerM2: 9,
      equipmentW: 250,
    },
    ventilation: {
      ventilationAirflowM3h: 240,
      infiltrationMethod: "ach",
      infiltrationAch: 0.4,
    },
    envelope: [
      {
        id: uid(),
        name: "West wall",
        type: "wall",
        area: 10,
        uValue: 0.35,
        orientation: "W",
        boundary: "outside",
      },
      {
        id: uid(),
        name: "West window",
        type: "window",
        area: 2.5,
        glassArea: 2.2,
        uValue: 1.6,
        shgc: 0.55,
        shadingFactor: 0.7,
        orientation: "W",
        boundary: "outside",
      },
    ],
  };

  base.zones = [office, meeting];
  return base;
}

/** Deep-clone a project with new IDs, useful for duplication. */
export function duplicateProject(p: Project): Project {
  const now = new Date().toISOString();
  return {
    ...p,
    id: uid(),
    name: `${p.name} (copy)`,
    createdAt: now,
    updatedAt: now,
    zones: p.zones.map((z) => ({
      ...z,
      id: uid(),
      envelope: z.envelope.map((e) => ({ ...e, id: uid() })),
    })),
    climate: { ...p.climate, solarIrradiance: { ...p.climate.solarIrradiance } },
  };
}

export function withUpdatedTimestamp<T extends { updatedAt: string }>(p: T): T {
  return { ...p, updatedAt: new Date().toISOString() };
}

export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  apartment: "Apartment",
  office: "Office",
  house: "House",
  shop: "Shop / retail",
  classroom: "Classroom",
  custom: "Custom",
};
