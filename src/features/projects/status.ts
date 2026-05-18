import type { Project, ProjectResult } from "@/types";
import type { ProjectStatus } from "@/components/ui/StatusBadge";

/**
 * Derive a coarse project status from the data + computed result.
 *
 *   - draft        : no zones yet
 *   - needs-review : has zones but warnings or missing envelope
 *   - calculated   : has zones, computes loads, no critical warnings
 *   - ready        : calculated + has at least one envelope element per zone
 */
export function deriveProjectStatus(
  project: Project,
  result?: ProjectResult,
): ProjectStatus {
  if (!project.zones.length) return "draft";

  const allHaveEnvelope = project.zones.every((z) => z.envelope.length > 0);
  const warnings = result?.warnings.length ?? 0;

  if (!allHaveEnvelope || warnings > 2) return "needs-review";
  if (allHaveEnvelope && warnings === 0) return "ready";
  return "calculated";
}

/**
 * Calculation completeness (0..1) — used as a "input completeness" indicator.
 * A simple, transparent heuristic: counts populated key fields per zone.
 */
export function calculationCompleteness(project: Project): number {
  if (!project.zones.length) return 0;

  let score = 0;
  let max = 0;

  // Project-level fields
  max += 4;
  if (project.name.trim().length > 0 && project.name !== "Untitled project") score++;
  if (project.climate.city) score++;
  if (project.safetyMargin >= 0) score++;
  if (project.diversityFactor > 0) score++;

  for (const z of project.zones) {
    max += 6;
    if (z.name.trim().length > 0) score++;
    if (z.floorArea > 0) score++;
    if (z.height > 0) score++;
    if (z.envelope.length > 0) score++;
    if (z.internalGains.peopleCount > 0 || z.internalGains.equipmentW > 0) score++;
    if (
      z.ventilation.ventilationAirflowM3h > 0 ||
      (z.ventilation.infiltrationMethod === "ach" && (z.ventilation.infiltrationAch ?? 0) > 0)
    )
      score++;
  }

  return Math.max(0, Math.min(1, score / max));
}
