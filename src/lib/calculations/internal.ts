import type { InternalGains, Zone } from "@/types";
import { OCCUPANCY_PRESETS } from "@/lib/defaults/internal";

/**
 * Compute internal sensible/latent gains for a zone in W.
 *
 *   lighting   = lightingTotalW ?? (lightingWPerM2 × floorArea)
 *   equipment  = equipmentW
 *   people_S   = peopleCount × peopleSensibleW (preset if missing)
 *   people_L   = peopleCount × peopleLatentW   (preset if missing)
 *
 * A diversity factor (0..1) applied to all internal gains for cooling.
 */
export function internalGainsW(zone: Zone): {
  lightingW: number;
  equipmentW: number;
  peopleSensibleW: number;
  peopleLatentW: number;
} {
  const g: InternalGains = zone.internalGains;
  const diversity = clamp01(g.diversity ?? 1);

  const preset = OCCUPANCY_PRESETS[g.occupancyType];
  const peopleS = (g.peopleSensibleW ?? preset.sensibleW) * Math.max(0, g.peopleCount);
  const peopleL = (g.peopleLatentW ?? preset.latentW) * Math.max(0, g.peopleCount);

  const lighting = (g.lightingTotalW ?? (g.lightingWPerM2 ?? 0) * zone.floorArea);
  const equipment = Math.max(0, g.equipmentW);

  return {
    lightingW: Math.max(0, lighting) * diversity,
    equipmentW: equipment * diversity,
    peopleSensibleW: peopleS * diversity,
    peopleLatentW: peopleL * diversity,
  };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 1;
  return Math.min(1, Math.max(0, n));
}
