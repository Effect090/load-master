"use client";

import * as React from "react";
import type { Project, ProjectResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatNumber } from "@/lib/utils";
import { BUILDING_TYPE_LABELS } from "@/features/projects/factory";
import { ScrollText, ShieldCheck, AlertTriangle } from "lucide-react";

/**
 * Plain-English engineering summary of the calculation result.
 *
 * Generated deterministically from the project + result. Designed to
 * read like the executive summary an HVAC engineer would write at the
 * top of a calculation report.
 */
export function CalculationSummary({
  project,
  result,
}: {
  project: Project;
  result: ProjectResult;
}) {
  const totalH = result.recommendedHeatingW / 1000;
  const totalC = result.recommendedCoolingW / 1000;
  const safetyPct = Math.round(project.safetyMargin * 100);
  const diversityPct = Math.round(project.diversityFactor * 100);
  const heatingDensity = formatNumber(result.heatingPerM2, 1);
  const coolingDensity = formatNumber(result.coolingPerM2, 1);
  const totalArea = formatNumber(result.totalArea, 1);

  const dominantHeating = result.largestHeatingZones[0];
  const dominantCooling = result.largestCoolingZones[0];

  const sensibleRatio =
    result.totalCoolingW > 0
      ? result.totalSensibleW / result.totalCoolingW
      : 0;

  const accuracyNotes: { kind: "ok" | "warn"; text: string }[] = [];

  if (project.zones.some((z) => z.envelope.length === 0)) {
    accuracyNotes.push({
      kind: "warn",
      text: "Some zones have no envelope elements — fabric losses/gains are zero for those zones.",
    });
  }
  if (project.safetyMargin > 0.3) {
    accuracyNotes.push({
      kind: "warn",
      text: `Safety margin of ${safetyPct}% is unusually high (typical 5–15%).`,
    });
  }
  if (project.diversityFactor < 0.7) {
    accuracyNotes.push({
      kind: "warn",
      text: `Diversity factor of ${diversityPct}% is low — recommended capacity is heavily reduced.`,
    });
  }
  if (sensibleRatio < 0.6 && result.totalCoolingW > 0) {
    accuracyNotes.push({
      kind: "warn",
      text: "Latent cooling load exceeds 40% of total — verify outdoor design RH and ventilation rates.",
    });
  }
  if (result.warnings.length === 0 && project.zones.length > 0) {
    accuracyNotes.push({
      kind: "ok",
      text: "No engineering warnings detected for the entered design conditions.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center">
            <ScrollText className="size-4" />
          </span>
          <CardTitle>Professional summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed text-foreground/90 space-y-3">
        <p>
          Project <strong>{project.name}</strong> is a{" "}
          <strong>{BUILDING_TYPE_LABELS[project.buildingType].toLowerCase()}</strong>{" "}
          located in <strong>{project.climate.city || "an unspecified location"}</strong>.
          The model covers <strong>{project.zones.length}</strong> zone
          {project.zones.length === 1 ? "" : "s"} for a total conditioned
          area of <strong>{totalArea} m²</strong>, with a design ΔT of{" "}
          <strong>
            {formatNumber(
              project.climate.indoorWinterDb - project.climate.outdoorWinterDb,
              1,
            )}
            {" K"}
          </strong>{" "}
          (heating) and{" "}
          <strong>
            {formatNumber(
              project.climate.outdoorSummerDb - project.climate.indoorSummerDb,
              1,
            )}
            {" K"}
          </strong>{" "}
          (cooling).
        </p>

        <p>
          Applying a safety margin of <strong>{safetyPct}%</strong> and a
          diversity factor of <strong>{diversityPct}%</strong>, the
          recommended installed capacity is{" "}
          <strong className="text-primary">
            {formatNumber(totalH, 2)} kW heating
          </strong>{" "}
          and{" "}
          <strong className="text-info">
            {formatNumber(totalC, 2)} kW cooling
          </strong>
          , i.e. about <strong>{heatingDensity} W/m²</strong> heating and{" "}
          <strong>{coolingDensity} W/m²</strong> cooling. Cooling is{" "}
          <strong>
            {Math.round(sensibleRatio * 100)}% sensible /{" "}
            {Math.round((1 - sensibleRatio) * 100)}% latent
          </strong>
          .
        </p>

        {(dominantHeating || dominantCooling) && (
          <p>
            The dominant zones are{" "}
            {dominantHeating && (
              <>
                <strong>{dominantHeating.zoneName}</strong> for heating
                (
                {formatNumber(dominantHeating.w / 1000, 2)} kW)
              </>
            )}
            {dominantHeating && dominantCooling && " and "}
            {dominantCooling && (
              <>
                <strong>{dominantCooling.zoneName}</strong> for cooling
                (
                {formatNumber(dominantCooling.w / 1000, 2)} kW)
              </>
            )}
            .
          </p>
        )}

        {accuracyNotes.length > 0 && (
          <div className="rounded-lg border bg-muted/40 p-3 mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Calculation quality notes
            </p>
            <ul className="space-y-1.5 text-xs">
              {accuracyNotes.map((n, i) => (
                <li key={i} className="flex items-start gap-2">
                  {n.kind === "ok" ? (
                    <ShieldCheck className="size-3.5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="size-3.5 text-warning shrink-0 mt-0.5" />
                  )}
                  <span className="text-foreground/85">{n.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground italic mt-2">
          Generated automatically from project inputs. This is a transparent,
          simplified peak-load estimate — not a certified regulatory method.
          Verify with detailed simulation for final equipment selection.
        </p>
      </CardContent>
    </Card>
  );
}
