import type { Project, ProjectResult } from "@/types";
import { computeZoneResult } from "./zone";

export function computeProjectResult(project: Project): ProjectResult {
  const zoneResults = project.zones.map((z) =>
    computeZoneResult(z, project.climate, { safetyMargin: project.safetyMargin }),
  );

  const totalHeatingW = sum(zoneResults.map((r) => r.totalHeatingW));
  const totalCoolingW = sum(zoneResults.map((r) => r.totalCoolingW));
  const totalSensibleW = sum(zoneResults.map((r) => r.totalSensibleCoolingW));
  const totalLatentW = sum(zoneResults.map((r) => r.totalLatentCoolingW));
  const totalArea = sum(zoneResults.map((r) => r.floorArea));

  const diversity = clamp01(project.diversityFactor ?? 1);
  const safety = Math.max(0, project.safetyMargin);

  const recommendedHeatingW = totalHeatingW * diversity * (1 + safety);
  const recommendedCoolingW = totalCoolingW * diversity * (1 + safety);

  const heatingPerM2 = totalArea > 0 ? totalHeatingW / totalArea : 0;
  const coolingPerM2 = totalArea > 0 ? totalCoolingW / totalArea : 0;

  const largestHeatingZones = [...zoneResults]
    .sort((a, b) => b.totalHeatingW - a.totalHeatingW)
    .slice(0, 5)
    .map((r) => ({ zoneId: r.zoneId, zoneName: r.zoneName, w: r.totalHeatingW }));

  const largestCoolingZones = [...zoneResults]
    .sort((a, b) => b.totalCoolingW - a.totalCoolingW)
    .slice(0, 5)
    .map((r) => ({ zoneId: r.zoneId, zoneName: r.zoneName, w: r.totalCoolingW }));

  const warnings = unique(zoneResults.flatMap((r) => r.warnings));

  if (project.zones.length === 0) {
    warnings.unshift("Project has no zones yet.");
  }

  return {
    projectId: project.id,
    zones: zoneResults,
    totalHeatingW,
    totalCoolingW,
    totalSensibleW,
    totalLatentW,
    recommendedHeatingW,
    recommendedCoolingW,
    totalArea,
    heatingPerM2,
    coolingPerM2,
    largestHeatingZones,
    largestCoolingZones,
    warnings,
  };
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}
function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
function clamp01(n: number): number {
  if (Number.isNaN(n)) return 1;
  return Math.min(1, Math.max(0, n));
}
