import type { Zone } from "@/types";
import { uid } from "@/lib/utils";

export type ZoneTemplateId =
  | "bedroom"
  | "living_room"
  | "office"
  | "classroom"
  | "server_room"
  | "shop"
  | "blank";

export interface ZoneTemplate {
  id: ZoneTemplateId;
  label: string;
  description: string;
  build: () => Zone;
}

function blankZone(name: string): Zone {
  return {
    id: uid(),
    name,
    floorArea: 15,
    height: 2.7,
    volume: 15 * 2.7,
    internalGains: {
      occupancyType: "office_seated",
      peopleCount: 1,
      lightingWPerM2: 6,
      equipmentW: 100,
    },
    ventilation: {
      ventilationAirflowM3h: 30,
      infiltrationMethod: "ach",
      infiltrationAch: 0.5,
    },
    envelope: [],
  };
}

export const ZONE_TEMPLATES: ZoneTemplate[] = [
  {
    id: "blank",
    label: "Blank zone",
    description: "Empty zone with sensible defaults.",
    build: () => blankZone("New zone"),
  },
  {
    id: "bedroom",
    label: "Bedroom",
    description: "Residential bedroom, ~12 m².",
    build: () => ({
      ...blankZone("Bedroom"),
      floorArea: 12,
      height: 2.6,
      volume: 12 * 2.6,
      internalGains: {
        occupancyType: "residential_sedentary",
        peopleCount: 2,
        lightingWPerM2: 5,
        equipmentW: 80,
      },
      ventilation: {
        ventilationAirflowM3h: 30,
        infiltrationMethod: "ach",
        infiltrationAch: 0.5,
      },
    }),
  },
  {
    id: "living_room",
    label: "Living room",
    description: "Residential living area, ~25 m².",
    build: () => ({
      ...blankZone("Living room"),
      floorArea: 25,
      height: 2.7,
      volume: 25 * 2.7,
      internalGains: {
        occupancyType: "residential_sedentary",
        peopleCount: 4,
        lightingWPerM2: 6,
        equipmentW: 200,
      },
      ventilation: {
        ventilationAirflowM3h: 60,
        infiltrationMethod: "ach",
        infiltrationAch: 0.6,
      },
    }),
  },
  {
    id: "office",
    label: "Office",
    description: "Open office, ~20 m².",
    build: () => ({
      ...blankZone("Office"),
      floorArea: 20,
      height: 2.7,
      volume: 20 * 2.7,
      internalGains: {
        occupancyType: "office_seated",
        peopleCount: 2,
        lightingWPerM2: 9,
        equipmentW: 350,
      },
      ventilation: {
        ventilationAirflowM3h: 60,
        infiltrationMethod: "ach",
        infiltrationAch: 0.4,
      },
    }),
  },
  {
    id: "classroom",
    label: "Classroom",
    description: "School classroom, ~50 m².",
    build: () => ({
      ...blankZone("Classroom"),
      floorArea: 50,
      height: 3,
      volume: 50 * 3,
      internalGains: {
        occupancyType: "classroom",
        peopleCount: 25,
        lightingWPerM2: 10,
        equipmentW: 300,
      },
      ventilation: {
        ventilationAirflowM3h: 600,
        infiltrationMethod: "ach",
        infiltrationAch: 0.4,
      },
    }),
  },
  {
    id: "server_room",
    label: "Server room",
    description: "High equipment density, low occupancy.",
    build: () => ({
      ...blankZone("Server room"),
      floorArea: 10,
      height: 2.7,
      volume: 10 * 2.7,
      internalGains: {
        occupancyType: "office_seated",
        peopleCount: 0,
        lightingWPerM2: 8,
        equipmentW: 4000,
      },
      ventilation: {
        ventilationAirflowM3h: 30,
        infiltrationMethod: "ach",
        infiltrationAch: 0.2,
      },
    }),
  },
  {
    id: "shop",
    label: "Shop / retail",
    description: "Retail floor, ~40 m².",
    build: () => ({
      ...blankZone("Shop"),
      floorArea: 40,
      height: 3,
      volume: 40 * 3,
      internalGains: {
        occupancyType: "retail_standing",
        peopleCount: 5,
        lightingWPerM2: 14,
        equipmentW: 500,
      },
      ventilation: {
        ventilationAirflowM3h: 200,
        infiltrationMethod: "ach",
        infiltrationAch: 0.6,
      },
    }),
  },
];

export function templateById(id: ZoneTemplateId): ZoneTemplate {
  return ZONE_TEMPLATES.find((t) => t.id === id) ?? ZONE_TEMPLATES[0]!;
}
