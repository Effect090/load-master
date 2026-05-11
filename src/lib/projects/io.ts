import type { Project } from "@/types";
import { projectSchema } from "@/lib/validation/schemas";

export interface ParseProjectResult {
  ok: boolean;
  project?: Project;
  error?: string;
}

/**
 * Parse a JSON string into a validated Project using the Zod schema.
 *
 * Returns a typed result rather than throwing, so callers can surface
 * a human-readable message in the UI.
 */
export function parseProjectJson(input: string): ParseProjectResult {
  let raw: unknown;
  try {
    raw = JSON.parse(input);
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
  return validateProject(raw);
}

export function validateProject(raw: unknown): ParseProjectResult {
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const path = first?.path.join(".") || "(root)";
    return {
      ok: false,
      error: `Not a valid Load Master project (at ${path}: ${first?.message ?? "schema mismatch"})`,
    };
  }
  return { ok: true, project: parsed.data as Project };
}
