import { z } from "zod";

export const orientationEnum = z.enum([
  "N",
  "NE",
  "E",
  "SE",
  "S",
  "SW",
  "W",
  "NW",
  "horizontal",
]);
export const envelopeTypeEnum = z.enum([
  "wall",
  "roof",
  "floor",
  "window",
  "door",
]);
export const boundaryEnum = z.enum([
  "outside",
  "ground",
  "unconditioned",
  "adjacent_conditioned",
]);
export const buildingTypeEnum = z.enum([
  "apartment",
  "office",
  "house",
  "shop",
  "classroom",
  "custom",
]);
export const occupancyTypeEnum = z.enum([
  "residential_sedentary",
  "office_seated",
  "classroom",
  "retail_standing",
  "restaurant",
  "light_work",
  "moderate_work",
  "heavy_work",
  "custom",
]);
export const infiltrationMethodEnum = z.enum(["ach", "airflow"]);

export const envelopeElementSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: envelopeTypeEnum,
  area: z.coerce.number().nonnegative(),
  uValue: z.coerce.number().positive().max(20),
  orientation: orientationEnum,
  boundary: boundaryEnum,
  adjacentTemperatureWinter: z.coerce.number().optional(),
  adjacentTemperatureSummer: z.coerce.number().optional(),
  shadingFactor: z.coerce.number().min(0).max(1).optional(),
  shgc: z.coerce.number().min(0).max(1).optional(),
  glassArea: z.coerce.number().nonnegative().optional(),
  thermalBridgeWPerK: z.coerce.number().nonnegative().optional(),
});

export const internalGainsSchema = z.object({
  occupancyType: occupancyTypeEnum,
  peopleCount: z.coerce.number().int().nonnegative(),
  peopleSensibleW: z.coerce.number().nonnegative().optional(),
  peopleLatentW: z.coerce.number().nonnegative().optional(),
  lightingWPerM2: z.coerce.number().nonnegative().optional(),
  lightingTotalW: z.coerce.number().nonnegative().optional(),
  equipmentW: z.coerce.number().nonnegative(),
  diversity: z.coerce.number().min(0).max(1).optional(),
});

export const ventilationSchema = z.object({
  ventilationAirflowM3h: z.coerce.number().nonnegative(),
  infiltrationMethod: infiltrationMethodEnum,
  infiltrationAch: z.coerce.number().nonnegative().optional(),
  infiltrationAirflowM3h: z.coerce.number().nonnegative().optional(),
  heatRecoverySensible: z.coerce.number().min(0).max(1).optional(),
  heatRecoveryLatent: z.coerce.number().min(0).max(1).optional(),
});

export const zoneSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  floorArea: z.coerce.number().positive(),
  height: z.coerce.number().positive().max(20),
  volume: z.coerce.number().positive(),
  internalGains: internalGainsSchema,
  ventilation: ventilationSchema,
  envelope: z.array(envelopeElementSchema),
  notes: z.string().optional(),
});

export const climateSchema = z.object({
  city: z.string().min(1),
  outdoorWinterDb: z.coerce.number(),
  outdoorSummerDb: z.coerce.number(),
  outdoorSummerRh: z.coerce.number().min(0).max(100),
  indoorWinterDb: z.coerce.number(),
  indoorSummerDb: z.coerce.number(),
  indoorSummerRh: z.coerce.number().min(0).max(100),
  altitudeM: z.coerce.number().optional(),
  solarIrradiance: z.record(orientationEnum, z.coerce.number().nonnegative()),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  buildingType: buildingTypeEnum,
  climate: climateSchema,
  safetyMargin: z.coerce.number().min(0).max(1),
  diversityFactor: z.coerce.number().min(0).max(1),
  zones: z.array(zoneSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  notes: z.string().optional(),
});

export const projectMetaSchema = projectSchema.pick({
  name: true,
  buildingType: true,
  safetyMargin: true,
  diversityFactor: true,
});

export type ProjectMetaInput = z.infer<typeof projectMetaSchema>;
