import type { InternalGains, Zone } from "@/types";
import type { InternalGainsDetail } from "@/types";
import { OCCUPANCY_PRESETS } from "@/lib/defaults/internal";

/**
 * Compute internal sensible/latent gains for a zone in W.
 *
 *   lighting   = lightingTotalW  ??  (lightingWPerM2 × floorArea)
 *   equipment  = equipmentW
 *   people_S   = peopleCount × peopleSensibleW   (preset if not overridden)
 *   people_L   = peopleCount × peopleLatentW     (preset if not overridden)
 *
 * An optional diversity factor (0..1) scales all internal gains for cooling.
 */
export function internalGainsW(zone: Zone): {
  lightingW: number;
  equipmentW: number;
  peopleSensibleW: number;
  peopleLatentW: number;
  detail: InternalGainsDetail;
} {
  const g: InternalGains = zone.internalGains;
  const diversity = clamp01(g.diversity ?? 1);

  const preset = OCCUPANCY_PRESETS[g.occupancyType];
  const sensPerPerson = g.peopleSensibleW ?? preset.sensibleW;
  const latPerPerson = g.peopleLatentW ?? preset.latentW;
  const count = Math.max(0, g.peopleCount);

  const rawPeopleS = sensPerPerson * count;
  const rawPeopleL = latPerPerson * count;

  const useTotalW = g.lightingTotalW != null;
  const lightingInput = useTotalW ? g.lightingTotalW! : (g.lightingWPerM2 ?? 0);
  const rawLighting = useTotalW
    ? Math.max(0, g.lightingTotalW!)
    : Math.max(0, (g.lightingWPerM2 ?? 0) * zone.floorArea);

  const rawEquipment = Math.max(0, g.equipmentW);

  const lightingW = rawLighting * diversity;
  const equipmentW = rawEquipment * diversity;
  const peopleSensibleW = rawPeopleS * diversity;
  const peopleLatentW = rawPeopleL * diversity;

  const detail: InternalGainsDetail = {
    occupancyLabel: preset.label,
    peopleCount: count,
    peopleSensibleWPerPerson: sensPerPerson,
    peopleLatentWPerPerson: latPerPerson,
    peopleSensibleW,
    peopleLatentW,
    lightingMethodLabel: useTotalW ? "Total W (entered)" : `W/m² × ${zone.floorArea} m²`,
    lightingInputValue: lightingInput,
    lightingW,
    equipmentW,
    diversity,
    traces: [
      {
        label: "People — sensible",
        formula: "Q = peopleCount × sens_W/person × diversity",
        expression: `Q = ${count} × ${sensPerPerson} × ${diversity}`,
        inputs: {
          "people count": count,
          "sensible W/person": sensPerPerson,
          "diversity": diversity,
        },
        resultW: peopleSensibleW,
      },
      {
        label: "People — latent",
        formula: "Q = peopleCount × lat_W/person × diversity",
        expression: `Q = ${count} × ${latPerPerson} × ${diversity}`,
        inputs: {
          "people count": count,
          "latent W/person": latPerPerson,
          "diversity": diversity,
        },
        resultW: peopleLatentW,
      },
      {
        label: "Lighting",
        formula: useTotalW
          ? "Q = lightingTotalW × diversity"
          : "Q = lightingWPerM2 × floorArea × diversity",
        expression: useTotalW
          ? `Q = ${lightingInput} × ${diversity}`
          : `Q = ${lightingInput} × ${zone.floorArea} × ${diversity}`,
        inputs: useTotalW
          ? { "total W": lightingInput, "diversity": diversity }
          : {
              "W/m²": lightingInput,
              "floor area (m²)": zone.floorArea,
              "diversity": diversity,
            },
        resultW: lightingW,
      },
      {
        label: "Equipment",
        formula: "Q = equipmentW × diversity",
        expression: `Q = ${rawEquipment} × ${diversity}`,
        inputs: { "equipment W": rawEquipment, "diversity": diversity },
        resultW: equipmentW,
      },
    ],
  };

  return { lightingW, equipmentW, peopleSensibleW, peopleLatentW, detail };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 1;
  return Math.min(1, Math.max(0, n));
}
