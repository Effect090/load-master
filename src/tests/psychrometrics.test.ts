import { describe, expect, it } from "vitest";
import {
  atmosphericPressure,
  humidityRatio,
  humidityRatioGPerKg,
  saturationVaporPressure,
} from "@/lib/calculations/psychrometrics";

describe("psychrometrics", () => {
  it("saturation vapor pressure at 0 °C ≈ 611 Pa", () => {
    expect(saturationVaporPressure(0)).toBeCloseTo(611, 0);
  });

  it("saturation vapor pressure at 25 °C ≈ 3170 Pa (within 3%)", () => {
    const p = saturationVaporPressure(25);
    expect(p).toBeGreaterThan(3070);
    expect(p).toBeLessThan(3270);
  });

  it("humidity ratio at 25 °C, 50% RH ≈ 0.0098 kg/kg", () => {
    const w = humidityRatio(25, 50);
    expect(w).toBeGreaterThan(0.009);
    expect(w).toBeLessThan(0.011);
  });

  it("humidity ratio in g/kg matches the kg/kg result × 1000", () => {
    const a = humidityRatio(20, 60);
    const b = humidityRatioGPerKg(20, 60);
    expect(b / 1000).toBeCloseTo(a, 6);
  });

  it("atmospheric pressure decreases with altitude", () => {
    const p0 = atmosphericPressure(0);
    const p1500 = atmosphericPressure(1500);
    expect(p0).toBeGreaterThan(p1500);
    expect(p0).toBeCloseTo(101325, 0);
  });

  it("rejects NaN / Infinity inputs without producing NaN outputs", () => {
    expect(saturationVaporPressure(Number.NaN)).toBe(0);
    expect(humidityRatio(Number.NaN, 50)).toBe(0);
    expect(Number.isFinite(humidityRatio(20, Number.POSITIVE_INFINITY))).toBe(true);
  });

  it("clamps relative humidity into the 0..100 range", () => {
    const hi = humidityRatio(25, 150);
    const cap = humidityRatio(25, 100);
    expect(hi).toBeCloseTo(cap, 6);
    expect(humidityRatio(25, -20)).toBe(0);
  });

  it("returns 0 (not NaN) at the Magnus singularity bound", () => {
    expect(Number.isFinite(saturationVaporPressure(-273))).toBe(true);
    expect(saturationVaporPressure(-273)).toBeGreaterThanOrEqual(0);
  });

  it("treats non-positive pressure as standard atmosphere", () => {
    const w0 = humidityRatio(25, 50, 0);
    const wStd = humidityRatio(25, 50);
    expect(w0).toBeCloseTo(wStd, 9);
  });
});
